import { Flex, Button } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../../services/auth";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    try{
        logoutUser();
        console.log("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
    navigate("/"); // Redirige al login
  };

  const buttons = [
    { label: "Ejercicios", path: "/ejercicios" },
    { label: "Rutinas", path: "/rutinas" },
    { label: "Social", path: "/social" },
    { label: "Perfil", path: "/perfil" },
  ];

  return (
    <Flex
      as="nav"
      position="fixed"
      top={0}
      w="100%"
      px="4"
      py="2"
      justify="space-between"
      align="center"
      zIndex={1000}
      bg="gray.900"
    >
      {/* Botones de navegación */}
      <Flex gap={2}>
        {buttons.map((btn) => (
          <Button
            key={btn.path}
            onClick={() => navigate(btn.path)}
            bgColor={location.pathname === btn.path ? "brand.600" : "gray.900"}
            colorScheme="brand"
            color={location.pathname === btn.path ? "white" : "gray.400"}
            size="sm"
          >
            {btn.label}
          </Button>
        ))}
      </Flex>

      {/* Botón de Logout */}
      <Button
        onClick={handleLogout}
        colorScheme="red"
        size="sm"
      >
        Logout
      </Button>
    </Flex>
  );
};