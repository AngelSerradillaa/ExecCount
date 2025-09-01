import { useEffect, useState, useCallback } from "react";
import { Box, Button, Flex, Heading, Stack, HStack } from "@chakra-ui/react";
import List, { ItemDragging, type IItemDraggingProps } from "devextreme-react/list";
import { getRutinas, deleteRutina } from "../../services/routines";
import type { Rutina } from "../../services/routines";
import type { EjercicioRutina } from "../../services/routine-exercises";
import { CreateRutinaButton } from "../atoms/CreateRoutineButton";
import { CreateRutina } from "../organisms/CreateRoutine";
import { deleteEjercicioRutina } from "../../services/routine-exercises";
import { EjercicioCard } from "../atoms/ExerciseRoutineCard";
import { reorderEjerciciosRutina } from "../../services/routines";

const diasSemana = [
  { label: "Lunes", value: "lunes" },
  { label: "Martes", value: "martes" },
  { label: "Miércoles", value: "miércoles" },
  { label: "Jueves", value: "jueves" },
  { label: "Viernes", value: "viernes" },
  { label: "Sábado", value: "sábado" },
  { label: "Domingo", value: "domingo" },
];

export const RutinasPage = () => {
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [selectedRutina, setSelectedRutina] = useState<Rutina | null>(null);

  useEffect(() => {
    const fetchRutinas = async () => {
      const data = await getRutinas();
      setRutinas(data.map(r => ({ ...r, ejercicios: r.ejercicios || [] })));
    };
    fetchRutinas();
  }, []);

  const handleEliminarRutina = async (rutinaId: number) => {
    await deleteRutina(rutinaId);
    setRutinas(prev => prev.filter(r => r.id !== rutinaId));
    if (selectedRutina?.id === rutinaId) setSelectedRutina(null);
  };

  const handleEliminarEjercicio = async (rutinaId: number, ejercicioId: number) => {
    try {
      await deleteEjercicioRutina(ejercicioId);
      const rutina = rutinas.find(r => r.id === rutinaId);
      if (!rutina) return;
      handleEjerciciosChange(
        rutinaId,
        (rutina.ejercicios || []).filter(e => e.id !== ejercicioId)
      );
    } catch (err) {
      console.error("Error eliminando ejercicio", err);
    }
  };

  const handleEjerciciosChange = (rutinaId: number, ejercicios: EjercicioRutina[]) => {
    setRutinas(prev =>
      prev.map(r => (r.id === rutinaId ? { ...r, ejercicios } : r))
    );
  };

  const handleCloseModal = async (hayEjercicios: boolean = false) => {
    if (selectedRutina) {
      if (!hayEjercicios) {
        try {
          await deleteRutina(selectedRutina.id);
          setRutinas(prev => prev.filter(r => r.id !== selectedRutina.id));
        } catch (err) {
          console.error("Error eliminando rutina vacía:", err);
        }
      }
      setSelectedRutina(null);
    }
  };

  const getRutinaByDia = (dia: string) =>
    rutinas.find(rutina => rutina.dia === dia);

  /** --- Drag & Drop handlers usando IItemDraggingProps --- */
  const onDragStart = useCallback(
    (rutinaId: number): IItemDraggingProps['onDragStart'] => (e) => {
      const rutina = rutinas.find(r => r.id === rutinaId);
      if (!rutina) return;
      e.itemData = rutina?.ejercicios?.[e.fromIndex] ?? null;
    },
    [rutinas]
  );

  const onReorder = useCallback(
  (rutinaId: number): IItemDraggingProps['onReorder'] => async (e) => {
    const rutina = rutinas.find(r => r.id === rutinaId);
    if (!rutina) return;

    const updated = [...(rutina.ejercicios || [])];
    const [moved] = updated.splice(e.fromIndex, 1);
    updated.splice(e.toIndex, 0, moved);

    // recalcular orden según la nueva posición
    const ejerciciosConOrden = updated.map((ej, index) => ({
      ...ej,
      orden: index,
    }));

    // actualizar estado local
    handleEjerciciosChange(rutinaId, ejerciciosConOrden);

    try {
      await reorderEjerciciosRutina(
        rutinaId,
        ejerciciosConOrden.map(ej => ({ id: ej.id, orden: ej.orden }))
      );
    } catch (err) {
      console.error("Error reordenando ejercicios:", err);
    }
  },
  [rutinas]
);

  return (
    <Box p={6} mt={12}>
      <Heading size="lg" mb={6} textAlign="center">
        Rutinas semanales
      </Heading>

      <Flex gap={4} justify="space-between">
        {diasSemana.map(d => {
          const rutina = getRutinaByDia(d.value);

          return (
            <Box
              key={d.value}
              flex="1"
              p={4}
              borderWidth="1px"
              borderRadius="2xl"
              boxShadow="md"
            >
              <Heading size="md" mb={4} textAlign="center">
                {d.label}
              </Heading>

              {rutina ? (
                <Stack gap={2}>
                  <Box p={2} borderRadius="lg" textAlign="center">
                    <List
                      dataSource={rutina.ejercicios}
                      keyExpr="id"
                      repaintChangesOnly={true}
                      itemRender={(ejercicio: EjercicioRutina) => (
                        <EjercicioCard
                          ejercicio={ejercicio}
                          nombre={ejercicio.nombre_ejercicio ?? "Ejercicio"}
                          onDelete={id => handleEliminarEjercicio(rutina.id, id)}
                        />
                      )}
                    >
                      <ItemDragging
                        allowReordering={true}
                        onDragStart={onDragStart(rutina.id)}
                        onReorder={onReorder(rutina.id)}
                      />
                    </List>
                  </Box>

                  <HStack justify="center">
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => setSelectedRutina(rutina)}
                    >
                      Añadir ejercicios
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleEliminarRutina(rutina.id)}
                    >
                      Eliminar
                    </Button>
                  </HStack>
                </Stack>
              ) : (
                <CreateRutinaButton
                  dia={d.value}
                  onCreated={nueva => {
                    setRutinas(prev => [...prev, { ...nueva, ejercicios: [] }]);
                    setSelectedRutina({ ...nueva, ejercicios: [] });
                  }}
                />
              )}
            </Box>
          );
        })}
      </Flex>

      {selectedRutina && (
        <CreateRutina
          rutina={selectedRutina}
          onClose={handleCloseModal}
          onEjerciciosChange={ejercicios =>
            handleEjerciciosChange(selectedRutina.id, ejercicios)
          }
        />
      )}
    </Box>
  );
};