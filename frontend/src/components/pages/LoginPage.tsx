import { Flex, Stack, Input, Button, Text, chakra, Image } from "@chakra-ui/react";
import { AuthCard } from "../organisms/AuthCard";
import { Link as RouterLink, useNavigate } from "react-router-dom";
const ChakraRouterLink = chakra(RouterLink);
import { loginUser, getCurrentUser } from "../../services/auth";
import { useState } from "react";
import { AxiosError } from "axios";

export const LoginPage = () => {
  const navigate = useNavigate(); // ✅ en Vite usamos esto
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Login y obtener token
      const data = await loginUser(email, password);
      //const token = data.access;
      const dataObj = { access: data.access, refresh: data.refresh };
      // 2. Guardar token en localStorage
      localStorage.setItem("authToken", JSON.stringify(dataObj));

      // 3. Obtener usuario autenticado
      const user = await getCurrentUser(dataObj.access);
      localStorage.setItem("user", JSON.stringify(user));

      // 4. Redirigir a dashboard
      navigate("/rutinas"); 
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ detail: string }>;
      setError(axiosError.response?.data?.detail || "Error en login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      minW="100vw"
      align="center"
      direction="column"
      justify="flex-start"
      pt={20}
      px="4"
    >
      <Flex direction="column" align="center">
        <Text fontSize="4xl" fontWeight="bold" color="white">
          Bienvenido a 
        </Text>
        <Image src="/title.png" alt="Logo"/>
        </Flex>
      <form onSubmit={handleSubmit}>
        <AuthCard title="Inicia sesión">
          <Stack gap="4">
            <Input
              placeholder="Email"
              type="email"
              bg="gray.800"
              color="white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              placeholder="Contraseña"
              type="password"
              bg="gray.800"
              color="white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <Text color="red.400" fontSize="sm" textAlign="center">
                {error}
              </Text>
            )}
            <Button
              type="submit"
              colorScheme="brand"
              bgColor="brand.500"
              size="lg"
              loading={loading}
              _hover={{ bgColor: "brand.700" }}
            >
              Acceder
            </Button>
            <Text textAlign="center" color="gray.400">
              ¿No tienes cuenta?{" "}
              <ChakraRouterLink to="/register" color="purple.400" fontWeight="bold">
                Regístrate
              </ChakraRouterLink>
            </Text>
          </Stack>
        </AuthCard>
      </form>
    </Flex>
  );
};