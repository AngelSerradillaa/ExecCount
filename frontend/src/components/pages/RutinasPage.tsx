import { useEffect, useState, useCallback } from "react";
import { Box, Button, Flex, Heading, Stack } from "@chakra-ui/react";
import List, { ItemDragging, type IItemDraggingProps } from "devextreme-react/list";
import { getRutinas, deleteRutina, reorderEjerciciosRutina } from "../../services/routines";
import type { Rutina } from "../../services/routines";
import type { EjercicioRutina } from "../../services/routine-exercises";
import { CreateRutinaButton } from "../atoms/CreateRoutineButton";
import { CreateRutina } from "../organisms/CreateRoutine";
import { deleteEjercicioRutina } from "../../services/routine-exercises";
import { EjercicioCard } from "../atoms/ExerciseRoutineCard";
import { toaster } from "../ui/toasterInstance";

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
  const [selectedDay, setSelectedDay] = useState<string>("lunes");

  useEffect(() => {
    const fetchRutinas = async () => {
      const data = await getRutinas();
      const rutinasConEjercicios = data.map(r => ({ ...r, ejercicios: r.ejercicios || [] }));

      // Buscar las que están vacías
      const vacias = rutinasConEjercicios.filter(r => r.ejercicios.length === 0);

      // Eliminar en backend y frontend
      for (const rutina of vacias) {
        try {
          await deleteRutina(rutina.id);
        } catch (err) {
          console.error(`Error eliminando rutina vacía con id ${rutina.id}`, err);
        }
      }

      // Dejar solo las que tengan ejercicios
      setRutinas(rutinasConEjercicios.filter(r => r.ejercicios.length > 0));
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
      toaster.create({ 
        title: "Ejercicio eliminado",
        description: "Ejercicio eliminado", 
        type: "success" });
    } catch (err) {
      console.error("Error eliminando ejercicio", err);
      toaster.create({ 
        title: "Error",
        description: "Error eliminando ejercicio", 
        type: "error" });
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

  const getRutinaByDia = (dia: string) => rutinas.find(rutina => rutina.dia === dia);

  /** --- Drag & Drop handlers --- */
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

      const ejerciciosConOrden = updated.map((ej, index) => ({
        ...ej,
        orden: index,
      }));

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
    <Box p={4} mt={12}>
      <Heading size="2xl" mb={6} textAlign="center">
        Rutinas semanales
      </Heading>

      {/* Selector de días en móvil */}
      <Box display={{ base: "flex", "2xl": "none" }} justifyContent="center" mb={4} gap={2} flexWrap="wrap">
        {diasSemana.map(d => (
          <Button
            key={d.value}
            size="sm"
            minW="90px"
            bgColor={selectedDay === d.value ? "brand.500" : "gray.800"}
            _hover={{ bgColor: selectedDay === d.value ? "brand.500" : "brand.700" }}
            onClick={() => setSelectedDay(d.value)}
          >
            {d.label}
          </Button>
        ))}
      </Box>

      {/* Contenedor de rutinas para escritorio */}
      <Flex
        display={{ base: "none", "2xl": "flex" }}
        gap={4}
        justify="flex-start"
        flexWrap="nowrap"
        p={2}
      >
        {diasSemana.map(d => {
          const rutina = getRutinaByDia(d.value);
          return (
            <Box
              key={d.value}
              flex="1 0 calc(100% / 7 - 16px)"
              minW="120px"
              bgColor={"gray.800"}
              p={2}
              borderWidth="1px"
              borderRadius="lg"
              boxShadow="md"
            >
              <Heading size="lg" my={2} textAlign="center">{d.label}</Heading>

              {rutina ? (
                <Stack gap={2}>
                  <Box p={1} borderRadius="lg" textAlign="center" overflow="hidden">
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

                  <Stack direction={{base:"column", xl:"column"}} justify="center" gap={2} mx={2}>
                    <Button size="xs" bgColor={"brand.500"} _hover={{ bgColor: "brand.800" }} onClick={() => setSelectedRutina(rutina)}>Añadir ejercicio</Button>
                    <Button mb={2} size="xs" bgColor={"red.500"} _hover={{ bgColor: "red.700" }} onClick={() => handleEliminarRutina(rutina.id)}>Eliminar</Button>
                  </Stack>
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

      {/* Contenedor de rutinas para móvil: solo columna del día seleccionado */}
      <Box display={{ base: "block", "2xl": "none" }} maxW={"400px"} mx="auto">
        {(() => {
          const rutina = getRutinaByDia(selectedDay);
          const dia = diasSemana.find(d => d.value === selectedDay);
          if (!dia) return null;

          return (
            <Box p={2} borderWidth="1px" borderRadius="2xl" boxShadow="md">
              <Heading size="sm" mb={2} textAlign="center">{dia.label}</Heading>

              {rutina ? (
                <Stack gap={2}>
                  <Box p={1} borderRadius="lg" textAlign="center" overflow="hidden">
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

                  <Stack direction="row" justify="center" gap={2}>
                    <Button size="xs" bgColor={"brand.500"} _hover={{ bgColor: "brand.800" }} onClick={() => setSelectedRutina(rutina)}>Añadir ejercicio</Button>
                    <Button mb={3} size="xs" bgColor={"red.500"} _hover={{ bgColor: "red.700" }} onClick={() => handleEliminarRutina(rutina.id)}>Eliminar</Button>
                  </Stack>
                </Stack>
              ) : (
                <CreateRutinaButton
                  dia={selectedDay}
                  onCreated={nueva => {
                    setRutinas(prev => [...prev, { ...nueva, ejercicios: [] }]);
                    setSelectedRutina({ ...nueva, ejercicios: [] });
                  }}
                />
              )}
            </Box>
          );
        })()}
      </Box>

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