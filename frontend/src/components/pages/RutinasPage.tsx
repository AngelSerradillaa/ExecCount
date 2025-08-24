import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Stack,
  HStack,
} from "@chakra-ui/react";
import { getRutinas, deleteRutina } from "../../services/routines";
import type { Rutina } from "../../services/routines";
import type { EjercicioRutina } from "../../services/routine-exercises";
import { CreateRutinaButton } from "../atoms/CreateRoutineButton";
import { CreateRutina } from "../organisms/CreateRoutine";
import { deleteEjercicioRutina } from "../../services/routine-exercises";
import { EjercicioCard } from "../atoms/ExerciseRoutineCard";

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
      // Aseguramos que cada rutina tenga un array ejercicios aunque venga vacío
      setRutinas(data.map(r => ({ ...r, ejercicios: r.ejercicios || [] })));
    };
    fetchRutinas();
  }, []);

  const handleEliminarRutina = async (rutinaId: number) => {
    await deleteRutina(rutinaId);
    setRutinas((prev) => prev.filter((r) => r.id !== rutinaId));
    if (selectedRutina?.id === rutinaId) {
      setSelectedRutina(null);
    }
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
      prev.map(r =>
        r.id === rutinaId ? { ...r, ejercicios } : r
      )
    );
  };

  const handleCloseModal = async (hayEjercicios: boolean = false) => {
    if (selectedRutina) {
      if (!hayEjercicios) {
        // Si no se añadieron ejercicios, borramos la rutina
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
    rutinas.find((rutina) => rutina.dia === dia);

  return (
    <Box p={6} mt={12}>
      <Heading size="lg" mb={6} textAlign="center">
        Rutinas semanales
      </Heading>

      <Flex gap={4} justify="space-between">
        {diasSemana.map((d) => {
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
                  <Box
                    p={2}
                    borderRadius="lg"
                    textAlign="center"
                  >

                    {/* Ejercicios asociados */}
                    {rutina.ejercicios?.map((e) => (
                      
                      <EjercicioCard
                        key={e.id}
                        ejercicio={e}
                        nombre={e.nombre_ejercicio ?? "Ejercicio"}
                        onDelete={(id) => handleEliminarEjercicio(rutina.id, id)}
                      />
                      
                    ))}
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
                  onCreated={(nueva) => {
                    setRutinas((prev) => [...prev, { ...nueva, ejercicios: [] }]);
                    setSelectedRutina({ ...nueva, ejercicios: [] }); // abrir directamente modal
                  }}
                />
              )}
            </Box>
          );
        })}
      </Flex>

      {/* Dialog de ejercicios */}
      {selectedRutina && (
        <CreateRutina
          rutina={selectedRutina}
          onClose={handleCloseModal}
          onEjerciciosChange={(ejercicios) =>
            handleEjerciciosChange(selectedRutina.id, ejercicios)
          }
        />
      )}
    </Box>
  );
};