import { Box, Flex, Text, Button } from "@chakra-ui/react";
import type { EjercicioRutina } from "../../services/routine-exercises";
import { IoClose } from "react-icons/io5";

interface Props {
  ejercicio: EjercicioRutina;
  nombre: string;
  onDelete: (id: number) => void;
}

export const EjercicioCard = ({ ejercicio, nombre, onDelete }: Props) => {
  return (
    <Box
      p={2}
      borderWidth="1px"
      borderRadius="md"
      borderColor={"brand.500"}
      bg="gray.700"
      color="white"
      boxShadow="md"
      mb={2}
      w="100%"
    >
      <Flex justify="space-between" align="center">
        <Box flex="1" pr={2}>
          <Text
            fontWeight="bold"
            fontSize={{ base: "xs", md: "sm" }}
            whiteSpace="normal"
            wordBreak="break-word"
          >
            {nombre}
          </Text>
          <Text fontSize={{ base: "xs", md: "sm" }}>
            {ejercicio.sets} x {ejercicio.repeticiones} |{" "}
            {ejercicio.record_peso ?? 0} kg
          </Text>
        </Box>

        <Button
          size="xs"
          w="25px"
          h="25px"
          minW="15px"
          minH="15px"
          px={0}
          py={0}
          fontSize="xs"
          borderRadius={"md"}
          bgColor={"red.500"}
          _hover={{ bgColor: "red.700" }}
          onClick={() => onDelete(ejercicio.id)}
          aria-label="Eliminar ejercicio"
          flexShrink={0}
          ml={2}
        >
          <IoClose color="white" />
        </Button>
      </Flex>
    </Box>
  );
};