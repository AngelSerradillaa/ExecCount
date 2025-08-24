"use client"

import { useState, useEffect } from "react"
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Flex,
  Button,
  Dialog,
  Portal,
  CloseButton,
} from "@chakra-ui/react"
import { FaDumbbell, FaRunning, FaBiking, FaHeartbeat } from "react-icons/fa"
import type { IconType } from "react-icons"
import { getTipoEjercicios, deleteTipoEjercicio } from "../../services/exercises"
import { CreateTipoEjercicio } from "../organisms/CreateExercise"
import { toaster } from "../ui/toaster"

interface Ejercicio {
  id: number
  nombre: string
  descripcion: string
  grupo_muscular: string
}

const iconosGrupo: Record<string, IconType> = {
  pecho: FaDumbbell,
  espalda: FaRunning,
  piernas: FaBiking,
  cardio: FaHeartbeat,
}

export const EjerciciosPage = () => {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [filtro, setFiltro] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedEjercicio, setSelectedEjercicio] = useState<Ejercicio | null>(null)
  const [loadingDelete, setLoadingDelete] = useState(false)

  useEffect(() => {
    const fetchEjercicios = async () => {
      try {
        const data = await getTipoEjercicios()
        setEjercicios(data)
      } catch (err) {
        console.error("Error al cargar ejercicios:", err)
      }
    }
    fetchEjercicios()
  }, [])

  // callback cuando se crea un nuevo ejercicio
  const handleCreated = (nuevo: Ejercicio) => {
    setEjercicios((prev) => [...prev, nuevo])
  }

  const handleDelete = async () => {
    if (!selectedEjercicio) return
    setLoadingDelete(true)
    try {
      await deleteTipoEjercicio(selectedEjercicio.id)
      setEjercicios((prev) => prev.filter((e) => e.id !== selectedEjercicio.id))
      toaster.create({
        description: "Ejercicio eliminado correctamente",
        type: "success",
      })
      setOpenDialog(false)
      setSelectedEjercicio(null)
    } catch (err) {
      console.error("Error eliminando ejercicio:", err)
      toaster.create({
        description: "No se pudo eliminar el ejercicio",
        type: "error",
      })
    } finally {
      setLoadingDelete(false)
    }
  }

  const ejerciciosFiltrados = filtro
    ? ejercicios.filter((e) => e.grupo_muscular.toLowerCase() === filtro.toLowerCase())
    : ejercicios

  return (
    <Flex direction="column" align="center" minH="100vh" px={4} pt={24} w="100%">
      <VStack gap={6} w="full" maxW="1200px" align="center">
        <Heading>Ejercicios</Heading>

        {/* Botón con el Dialog del formulario */}
        <CreateTipoEjercicio onCreated={handleCreated} />

        {/* Botones de filtro */}
        <HStack gap={3} wrap="wrap" justify="center">
          <Button onClick={() => setFiltro(null)} colorScheme={!filtro ? "brand" : "gray"}>
            Todos
          </Button>
          <Button onClick={() => setFiltro("Pecho")} colorScheme={filtro === "Pecho" ? "brand" : "gray"}>
            Pecho
          </Button>
          <Button onClick={() => setFiltro("Espalda")} colorScheme={filtro === "Espalda" ? "brand" : "gray"}>
            Espalda
          </Button>
          <Button onClick={() => setFiltro("Piernas")} colorScheme={filtro === "Piernas" ? "brand" : "gray"}>
            Piernas
          </Button>
          <Button onClick={() => setFiltro("Cardio")} colorScheme={filtro === "Cardio" ? "brand" : "gray"}>
            Cardio
          </Button>
        </HStack>

        {/* Grid de ejercicios */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6} w="full">
          {ejerciciosFiltrados.map((ej) => (
            <Box
              key={ej.id}
              p={5}
              borderWidth="1px"
              borderRadius="2xl"
              shadow="md"
              textAlign="center"
              bg="gray.800"
            >
              <Icon
                as={iconosGrupo[ej.grupo_muscular] || FaDumbbell}
                boxSize={8}
                mb={3}
                color="brand.500"
              />
              <Heading size="md" color="white">
                {ej.nombre}
              </Heading>
              <Text mt={2} color="gray.400">
                {ej.descripcion}
              </Text>
              <Button
                mt={4}
                size="sm"
                colorScheme="red"
                onClick={() => {
                  setSelectedEjercicio(ej)
                  setOpenDialog(true)
                }}
              >
                Eliminar
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>

      {/* Dialog de confirmación */}
      <Dialog.Root open={openDialog} onOpenChange={(details) => setOpenDialog(details.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content bg="black" borderRadius="lg" p={6}>
              <Dialog.Header>
                <Heading size="md" color="white">
                  ¿Eliminar ejercicio?
                </Heading>
              </Dialog.Header>
              <Dialog.Body>
                <Text color="gray.300">
                  {selectedEjercicio
                    ? `¿Seguro que quieres eliminar "${selectedEjercicio.nombre}"? Esta acción no se puede deshacer.`
                    : ""}
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <HStack justify="flex-end" gap={3}>
                  <Button onClick={() => setOpenDialog(false)} variant="outline">
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={handleDelete}
                    loading={loadingDelete}
                  >
                    Aceptar
                  </Button>
                </HStack>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Flex>
  )
}