import { Box, Flex, Text, Button } from "@chakra-ui/react";
import type { EjercicioRutina } from "../../services/routine-exercises";

interface Props {
  ejercicio: EjercicioRutina;
  nombre: string;
  onDelete: (id: number) => void;
}

export const EjercicioCard = ({ ejercicio, nombre, onDelete }: Props) => {
  return (
    <Box
      p={3}
      borderWidth="1px"
      borderRadius="lg"
      bg="gray.700"
      color="white"
      boxShadow="md"
      mb={3}
    >
      <Flex justify="space-between" align="center">
        <Box>
          <Text fontWeight="bold">{nombre}</Text>
          <Text fontSize="sm">
            {ejercicio.sets} x {ejercicio.repeticiones} | {ejercicio.record_peso ?? 0} kg
          </Text>
        </Box>
        <Button size="xs" colorScheme="red" onClick={() => onDelete(ejercicio.id)}>
          X
        </Button>
      </Flex>
    </Box>
  );
};