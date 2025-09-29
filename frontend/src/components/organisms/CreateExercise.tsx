"use client"

import { useState } from "react"
import {
  Button,
  CloseButton,
  Dialog,
  HStack,
  Portal,
  Stack,
  Textarea,
  Input,
  Select,
  createListCollection,
} from "@chakra-ui/react"
import { createTipoEjercicio } from "../../services/exercises"
import type { TipoEjercicio } from "../../services/exercises"
import { toaster } from "../ui/toasterInstance"

interface CreateTipoEjercicioProps {
  onCreated: (nuevo: TipoEjercicio) => void
}

const gruposCollection = createListCollection({
  items: [
    { label: "Pecho", value: "pecho" },
    { label: "Brazos", value: "brazos" },
    { label: "Espalda", value: "espalda" },
    { label: "Piernas", value: "piernas" },
    { label: "Cardio", value: "cardio" },
  ],
})

export const CreateTipoEjercicio = ({ onCreated }: CreateTipoEjercicioProps) => {
  const [open, setOpen] = useState(false) // 👈 estado del diálogo
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [grupo, setGrupo] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!nombre || !descripcion || grupo.length === 0) {
      toaster.create({
        description: "Rellena todos los campos",
        type: "error",
      })
      return
    }

    setLoading(true)
    try {
      const nuevo = await createTipoEjercicio({
        nombre,
        descripcion,
        grupo_muscular: grupo[0],
      })
      onCreated(nuevo)
      toaster.create({
        description: "Ejercicio creado correctamente",
        type: "success",
      })

      // Resetear campos
      setNombre("")
      setDescripcion("")
      setGrupo([])

      // 👇 cerrar el diálogo SOLO si fue exitoso
      setOpen(false)
    } catch (err) {
      console.error("Error creando ejercicio:", err)
      toaster.create({
        description: "No se pudo crear el ejercicio",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <HStack>
      <Dialog.Root open={open} onOpenChange={(details) => setOpen(details.open)}>
        <Dialog.Trigger asChild>
          <Button bgColor="brand.500" _hover={{bgColor: "brand.700"}}>Crear nuevo ejercicio</Button>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content bgColor="black" boxShadow="lg">
  <Dialog.Header textAlign="center">
    <Dialog.Title>Nuevo ejercicio</Dialog.Title>
  </Dialog.Header>
  <Dialog.Body mx={8}>
    <Stack gap={4} minW="320px" align="center">
      <Input
        placeholder="Nombre del ejercicio"
        value={nombre}
        bgColor="gray.800"
        color="white"
        borderColor="brand.600"
        onChange={(e) => setNombre(e.target.value)}
      />
      <Textarea
        placeholder="Descripción"
        bgColor="gray.800"
        color="white"
        borderColor="brand.600"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />
      <Select.Root
        collection={gruposCollection}
        value={grupo}
        onValueChange={(details) => setGrupo(details.value)}
      >
        <Select.HiddenSelect />
        <Select.Label>Grupo muscular</Select.Label>
        <Select.Control>
          <Select.Trigger bgColor="gray.800" borderColor="brand.600">
            <Select.ValueText
              placeholder="Selecciona un grupo"
              color="white"
              
            />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator color={"brand.600"}/>
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content
              zIndex={2000}
              bgColor="gray.800"
              borderColor="brand.600"
            >
              {gruposCollection.items.map((g) => (
                <Select.Item item={g} key={g.value}>
                  {g.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </Stack>
  </Dialog.Body>
  <Dialog.Footer mr={8} mb={4}>
    <Button
      colorScheme="brand"
      bgColor="brand.600"
      _hover={{ bgColor: "brand.800" }}
      onClick={handleSubmit}
      loading={loading}
    >
      Crear
    </Button>
  </Dialog.Footer>
  <Dialog.CloseTrigger asChild>
    <CloseButton mr={2} mt={2} color="white" size="sm" bgColor={"red.500"} _hover={{ bgColor: "red.700" }}/>
  </Dialog.CloseTrigger>
</Dialog.Content> 
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </HStack>
  )
}