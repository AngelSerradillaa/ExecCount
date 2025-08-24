import { Flex, Stack, Input, Button, Text, chakra } from '@chakra-ui/react';
import { AuthCard } from '../organisms/AuthCard';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { registerUser, loginUser, getCurrentUser } from "../../services/auth";
import { useState } from "react";
import axios from "axios";

const ChakraRouterLink = chakra(RouterLink);

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== password2) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      // 1. Registrar usuario
      console.log("Se va registrar")
      await registerUser({ email, username, nombre, apellidos, password, password2 });
      console.log("Se va a loguear")
      // 2. Loguear automáticamente para obtener token
      const loginData = await loginUser(email, password);
      console.log("Login Data:", loginData);
      const token = { access: loginData.access, refresh: loginData.refresh };
      console.log("Token:", token);

      // 3. Guardar token en localStorage
      localStorage.setItem("authToken", JSON.stringify(token));

      // 4. Obtener usuario autenticado
      const user = await getCurrentUser(token.access);
      localStorage.setItem("user", JSON.stringify(user));

      // 5. Redirigir al dashboard
      navigate("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Error en el registro");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      minW="100vw"
      align="center"
      justify="center"
      bg="background.dark"
      px="4"
    >
      <AuthCard title="Regístrate">
        <Stack gap="4" as="form" onSubmit={handleSubmit}>
          <Input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} bg="gray.800" color="white" />
          <Input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} bg="gray.800" color="white" />
          <Input placeholder="Apellidos" value={apellidos} onChange={e => setApellidos(e.target.value)} bg="gray.800" color="white" />
          <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} bg="gray.800" color="white" />
          <Input placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} bg="gray.800" color="white" />
          <Input placeholder="Repite la contraseña" type="password" value={password2} onChange={e => setPassword2(e.target.value)} bg="gray.800" color="white" />
          <Button type="submit" colorScheme="brand" bgColor="brand.500" size="lg" _hover={{ bgColor: "brand.700" }} loading={loading}>
            Registrarse
          </Button>
          {error && <Text color="red.400" textAlign="center">{error}</Text>}
          <Text textAlign="center" color="gray.400">
            ¿Ya tienes cuenta?{' '}
            <ChakraRouterLink to="/" color="purple.400">
              Inicia Sesión
            </ChakraRouterLink>
          </Text>
        </Stack>
      </AuthCard>
    </Flex>
  );
};