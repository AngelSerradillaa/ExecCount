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
import {  FaHeartbeat } from "react-icons/fa"
import { GiMuscularTorso, GiBiceps, GiLeg, GiMuscleUp } from "react-icons/gi";
import type { IconType } from "react-icons"
import { getTipoEjercicios, deleteTipoEjercicio } from "../../services/exercises"
import { CreateTipoEjercicio } from "../organisms/CreateExercise"
import { toaster } from "../ui/toasterInstance"

export interface Ejercicio {
  id: number
  nombre: string
  descripcion: string
  grupo_muscular: string
}

const iconosGrupo: Record<string, IconType> = {
  pecho: GiMuscularTorso,
  brazos: GiBiceps,
  espalda: GiMuscleUp,
  piernas: GiLeg,
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
    <Flex direction="column" align="center" minH="100vh" px={4} pt={24} alignContent={"center"}>
      <VStack gap={6} w="full" maxW="1200px" align="center">
        <Heading>Ejercicios</Heading>

        {/* Botón con el Dialog del formulario */}
        <CreateTipoEjercicio onCreated={handleCreated} />

        {/* Botones de filtro */}
        <HStack gap={3} wrap="wrap" justify="center">
          <Button onClick={() => setFiltro(null)} bgColor={!filtro ? "brand.500" : "#1a1a1a"} _hover={{bgColor: "brand.700"}}>
            Todos
          </Button>
          <Button onClick={() => setFiltro("Pecho")} bgColor={filtro === "Pecho" ? "brand.500" : "#1a1a1a"} _hover={{bgColor: "brand.600"}}>
            <GiMuscularTorso></GiMuscularTorso>
            Pecho
          </Button>
          <Button onClick={() => setFiltro("Brazos")} bgColor={filtro === "Brazos" ? "brand.500" : "#1a1a1a"} _hover={{bgColor: "brand.600"}}>
            <GiBiceps></GiBiceps>
            Brazos
          </Button>
          <Button onClick={() => setFiltro("Espalda")} bgColor={filtro === "Espalda" ? "brand.500" : "#1a1a1a"} _hover={{bgColor: "brand.600"}}>
            <GiMuscleUp />
            Espalda
          </Button>
          <Button onClick={() => setFiltro("Piernas")} bgColor={filtro === "Piernas" ? "brand.500" : "#1a1a1a"} _hover={{bgColor: "brand.600"}}>
            <GiLeg></GiLeg>
            Piernas
          </Button>
          <Button onClick={() => setFiltro("Cardio")} bgColor={filtro === "Cardio" ? "brand.500" : "#1a1a1a"} _hover={{bgColor: "brand.600"}}>
            <FaHeartbeat></FaHeartbeat>
            Cardio
          </Button>
        </HStack>

        {/* Grid de ejercicios */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={6} w="full">
          {ejerciciosFiltrados.map((ej) => (
            <Box
              key={ej.id}
              p={5}
              borderWidth="1px"
              borderRadius="xl"
              shadow="md"
              bg="gray.800"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              minH="300px"
            >
              <Box textAlign="center">
              <Icon
                as={iconosGrupo[ej.grupo_muscular] || FaHeartbeat}
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
              </Box>
              <Button
                mt={4}
                size="sm"
                bgColor={"red.500"} _hover={{ bgColor: "red.700" }}
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
            <Dialog.Content bg="black" borderRadius="lg" boxShadow="lg">
              <Dialog.Header>
                <Dialog.Title>
                  ¿Eliminar ejercicio?
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body mx={8}>
                <Text color="white" fontWeight={"medium"}>
                  {selectedEjercicio
                    ? `¿Seguro que quieres eliminar "${selectedEjercicio.nombre}"? Esta acción no se puede deshacer.`
                    : ""}
                </Text>
              </Dialog.Body>
              <Dialog.Footer mr={6} mb={4}>
                <HStack justify="flex-end" gap={3}>
                  <Button onClick={() => setOpenDialog(false)} variant="outline"
                    bgColor="red.500" _hover={{ bgColor: "red.700" }}
                    color={"white"}>
                    Cancelar
                  </Button>
                  <Button
                    bgColor="brand.500" _hover={{ bgColor: "brand.700" }}
                    onClick={handleDelete}
                    loading={loadingDelete}
                  >
                    Aceptar
                  </Button>
                </HStack>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton mr={2} mt={2} color="white" size="sm" bgColor={"red.500"} _hover={{ bgColor: "red.700" }}/>
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Flex>
  )
}