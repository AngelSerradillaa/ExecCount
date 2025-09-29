import { useState } from "react";
import { Button, Flex } from "@chakra-ui/react";
import { createRutina } from "../../services/routines";
import type { Rutina } from "../../services/routines";
import { toaster } from "../ui/toasterInstance";

interface Props {
  dia: string;
  onCreated: (nuevo: Rutina) => void;
}

export const CreateRutinaButton = ({ dia, onCreated }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleCrear = async () => {
    const userData = localStorage.getItem("user");
    if (!userData) return;
    const parsedUser = JSON.parse(userData);

    try {
      setLoading(true);
      const nueva = await createRutina({
        nombre: `Rutina ${dia}`,
        dia,
        usuario: parsedUser.id,
      });
      onCreated(nueva);
    } catch (err) {
      console.error(err);
      toaster.create({ description: "Error creando rutina", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex justify="center" mt={4}>
      <Button size="sm" bgColor={"brand.500"} _hover={{ bgColor: "brand.800" }} onClick={handleCrear} loading={loading}>
        Crear rutina
      </Button>
    </Flex>
  );
};