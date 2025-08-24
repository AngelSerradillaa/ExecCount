import { useEffect, useState } from "react";
import {
  Button,
  CloseButton,
  Dialog,
  Portal,
  Stack,
  Text,
  Select,
  createListCollection,
  NumberInput,
} from "@chakra-ui/react";
import type { ListCollection } from "@chakra-ui/react";
import { createEjercicioRutina } from "../../services/routine-exercises";
import { getTipoEjercicios } from "../../services/exercises";
import type { TipoEjercicio } from "../../services/exercises";
import type { EjercicioRutina } from "../../services/routine-exercises";
import { deleteRutina, type Rutina } from "../../services/routines";
import { toaster } from "../ui/toaster";

interface Props {
  rutina: Rutina;
  onClose: () => void;
  onEjerciciosChange?: (ejercicios: EjercicioRutina[]) => void;
}

export const CreateRutina = ({ rutina, onClose, onEjerciciosChange }: Props) => {
  type Item = { label: string; value: string };

  const [ejercicios, setEjercicios] = useState<EjercicioRutina[]>([]);
  const [tipoEjercicios, setTipoEjercicios] = useState<TipoEjercicio[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<string>(""); 
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("12");
  const [peso, setPeso] = useState("0");

  // crear la colección vacía inicialmente
  const [ejerciciosCollection, setEjerciciosCollection] = useState<ListCollection<Item>>(
    createListCollection<Item>({ items: [] })
  );

  useEffect(() => {
  getTipoEjercicios()
    .then((tipos) => {
      setTipoEjercicios(tipos);

      // Crear una nueva colección usando createListCollection
      const collection = createListCollection<Item>({
        items: tipos.map((e) => ({
          label: `${e.nombre} (${e.grupo_muscular})`,
          value: e.id.toString(),
        })),
      });

      setEjerciciosCollection(collection);
    })
    .catch(() => {
      console.log("Error cargando los tipos de ejercicios");
    });
}, []);

    const handleAddEjercicio = async () => {
    if (!selectedTipo) {
      toaster.create({ description: "Selecciona un ejercicio", type: "error" });
      return;
    }

    try {
      const nuevo = await createEjercicioRutina({
        rutina: rutina.id,
        tipo_ejercicio: parseInt(selectedTipo, 10),
        sets: parseInt(sets, 10),
        repeticiones: parseInt(reps, 10),
        record_peso: parseFloat(peso),
      });

      setEjercicios((prev) => {
        const nuevos = [...prev, nuevo];
        onEjerciciosChange?.(nuevos); // Avisamos al padre
        return nuevos;
      });

      // Reseteamos valores
      setSelectedTipo("");
      setSets("3");
      setReps("12");
      setPeso("0");
    } catch {
      toaster.create({ description: "Error creando ejercicio", type: "error" });
    }
  };

  const handleClose = () => {
    if (ejercicios.length === 0) {
      deleteRutina(rutina.id);
    }
    onClose();
  };

  const getTipoNombre = (id: number) =>
    tipoEjercicios.find((t) => t.id === id)?.nombre || "Desconocido";

  return (
    <Dialog.Root open={true} onOpenChange={(d) => !d.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bgColor="black" boxShadow="lg">
            <Dialog.Header>
              <Dialog.Title>Ejercicios para {rutina.nombre}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4} w="320px">
                {ejercicios.map((e) => (
                  <Text key={e.id}>
                    {getTipoNombre(e.tipo_ejercicio)} - {e.sets}x{e.repeticiones} ({e.record_peso}kg)
                  </Text>
                ))}

                {ejerciciosCollection.items.length > 0 && (
                  <Select.Root
                    collection={ejerciciosCollection}
                    value={[selectedTipo]}
                    onValueChange={(d) => setSelectedTipo(d.value[0] || "")}
                  >
                    <Select.HiddenSelect />
                    <Select.Label>Tipo de ejercicio</Select.Label>
                    <Select.Control>
                      <Select.Trigger bgColor="gray.800">
                        <Select.ValueText placeholder="Selecciona un ejercicio" color="white" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content bgColor="gray.800" zIndex={2000}>
                          {ejerciciosCollection.items.map((item) => (
                            <Select.Item key={item.value} item={item}>
                              {item.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                )}

                <NumberInput.Root value={sets} onValueChange={(d) => setSets(d.value)}>
                  <NumberInput.Label>Sets</NumberInput.Label>
                  <NumberInput.Control />
                  <NumberInput.Input />
                </NumberInput.Root>

                <NumberInput.Root value={reps} onValueChange={(d) => setReps(d.value)}>
                  <NumberInput.Label>Repeticiones</NumberInput.Label>
                  <NumberInput.Control />
                  <NumberInput.Input />
                </NumberInput.Root>

                <NumberInput.Root value={peso} onValueChange={(d) => setPeso(d.value)}>
                  <NumberInput.Label>Peso (kg)</NumberInput.Label>
                  <NumberInput.Control />
                  <NumberInput.Input />
                </NumberInput.Root>

                <Button onClick={handleAddEjercicio} colorScheme="green">
                  Añadir ejercicio
                </Button>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={handleClose} colorScheme="blue">Guardar y salir</Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" onClick={handleClose} />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};