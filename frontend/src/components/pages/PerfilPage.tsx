import { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  Tabs,
} from "@chakra-ui/react";
import {
  getCurrentUser,
  updateCurrentUser,
  type RegisterData,
} from "../../services/auth";
import {
  getAmistades,
  crearAmistad,
  eliminarAmistad,
  actualizarAmistad,
  type Amistad,
} from "../../services/friendship";
import { toaster } from "../ui/toaster";

export const PerfilPage = () => {
  const [user, setUser] = useState<RegisterData | null>(null);
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [password, setPassword] = useState("");
  const [amistades, setAmistades] = useState<Amistad[]>([]);
  const [nuevoAmigo, setNuevoAmigo] = useState("");
  const [perfilHeight, setPerfilHeight] = useState(0);

  const perfilRef = useRef<HTMLDivElement | null>(null);

  const token = JSON.parse(localStorage.getItem("authToken") || "{}")?.access;

  // Cargar usuario y amistades
  useEffect(() => {
    const loadUser = async () => {
      try {
        const localUser = localStorage.getItem("user");
        if (localUser) {
          const parsed = JSON.parse(localUser);
          setUser(parsed);
          setNombre(parsed.nombre);
          setApellidos(parsed.apellidos);
        } else if (token) {
          const apiUser = await getCurrentUser(token);
          setUser(apiUser);
          setNombre(apiUser.nombre);
          setApellidos(apiUser.apellidos);
        }

        if (token) {
          const misAmistades = await getAmistades(token);
          setAmistades(misAmistades);
        }
      } catch (err) {
        console.error("Error cargando usuario o amistades:", err);
      }
    };
    loadUser();
  }, [token]);

  // Medir altura de la pestaña de perfil después de render
  useEffect(() => {
    if (perfilRef.current) {
      setPerfilHeight(perfilRef.current.offsetHeight);
    }
  }, [user, nombre, apellidos, password]);

  const handleActualizarAmistad = async (id: number, status: "aceptada" | "rechazada") => {
  if (!token) return;
  try {
    const updated = await actualizarAmistad(id, status, token);
    setAmistades((prev) =>
      prev.map((a) => (a.id === id ? updated : a))
    );
    toaster.create({ description: `Solicitud ${status}`, type: "success" });
  } catch (err) {
    console.error("Error actualizando amistad:", err);
    toaster.create({ description: "Error al actualizar amistad", type: "error" });
  }
};

  const handleSave = async () => {
    if (!token || !user) return;
    try {
      const updated = await updateCurrentUser(token, {
        nombre,
        apellidos,
        ...(password ? { password } : {}),
      });
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setPassword("");
      toaster.create({
        description: "Perfil actualizado correctamente",
        type: "success",
      });
    } catch (err) {
      console.error("Error actualizando usuario:", err);
      toaster.create({
        description: "Error al actualizar perfil",
        type: "error",
      });
    }
  };

  const handleAgregarAmigo = async () => {
    if (!token || !nuevoAmigo.trim()) return;
    try {
      const nuevo = await crearAmistad(nuevoAmigo.trim(), token);
      setAmistades((prev) => [...prev, nuevo]);
      setNuevoAmigo("");
      toaster.create({ description: "Solicitud enviada", type: "success" });
    } catch (err) {
      console.error("Error agregando amigo:", err);
      toaster.create({ description: "Error al agregar amigo", type: "error" });
    }
  };

  const handleEliminarAmigo = async (id: number) => {
    if (!token) return;
    try {
      await eliminarAmistad(id, token);
      setAmistades((prev) => prev.filter((a) => a.id !== id));
      toaster.create({ description: "Amistad eliminada", type: "success" });
    } catch (err) {
      console.error("Error eliminando amigo:", err);
      toaster.create({
        description: "Error al eliminar amistad",
        type: "error",
      });
    }
  };

  if (!user) {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Text>Cargando perfil...</Text>
      </Flex>
    );
  }

  return (
    <Flex justify="center" align="center" minH="80vh" p={4}>
      <Box
        w={{ base: "100%", sm: "90%", md: "500px" }}
        bg="gray.800"
        color="white"
        borderRadius="2xl"
        boxShadow="lg"
        p={6}
      >
        <Tabs.Root defaultValue="perfil" variant="plain">
          <Tabs.List mb={4} borderBottom="1px solid" borderColor="gray.600">
            <Tabs.Trigger value="perfil" px={4} py={2}>
              Perfil
            </Tabs.Trigger>
            <Tabs.Trigger value="amistades" px={4} py={2}>
              Amistades
            </Tabs.Trigger>
          </Tabs.List>

          {/* Pestaña Perfil */}
          <Tabs.Content value="perfil">
            <Box ref={perfilRef}>
              <Heading size="lg" textAlign="center" mb={6}>
                Perfil de usuario
              </Heading>
              <Stack gap={4}>
                <Box>
                  <Text mb={1}>Email</Text>
                  <Input value={user.email} readOnly bg="gray.700" />
                </Box>

                <Box>
                  <Text mb={1}>Usuario</Text>
                  <Input value={user.username} readOnly bg="gray.700" />
                </Box>

                <Box>
                  <Text mb={1}>Nombre</Text>
                  <Input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    bg="gray.700"
                  />
                </Box>

                <Box>
                  <Text mb={1}>Apellidos</Text>
                  <Input
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    bg="gray.700"
                  />
                </Box>

                <Box>
                  <Text mb={1}>Contraseña</Text>
                  <Input
                    type="password"
                    value={password}
                    placeholder="Nueva contraseña"
                    onChange={(e) => setPassword(e.target.value)}
                    bg="gray.700"
                  />
                </Box>

                <Button colorScheme="blue" onClick={handleSave}>
                  Guardar cambios
                </Button>
              </Stack>
            </Box>
          </Tabs.Content>

          {/* Pestaña Amistades */}
          <Tabs.Content value="amistades">
            <Box minH={perfilHeight}>
              <Heading size="lg" textAlign="center" mb={6}>
                Lista de amigos
              </Heading>

              <Stack gap={4}>
                <Flex as="form" onSubmit={(e) => { e.preventDefault(); handleAgregarAmigo(); }}>
                  <Input
                    placeholder="Introduce email o usuario"
                    value={nuevoAmigo}
                    onChange={(e) => setNuevoAmigo(e.target.value)}
                    bg="gray.700"
                  />
                  <Button ml={2} type="submit">
                    Enviar
                  </Button>
                </Flex>

                {amistades.length === 0 ? (
                  <Text>No tienes amistades todavía.</Text>
                ) : (
                  <Stack gap={2}>
                    {amistades.map((a) => (
                      <Flex
                        key={a.id}
                        justify="space-between"
                        align="center"
                        bg="gray.700"
                        px={3}
                        py={2}
                        borderRadius="lg"
                      >
                        <Text>
                          {a.status === "aceptada"
                            ? a.tipo === "enviada"
                              ? a.amigo_username
                              : a.usuario_username
                            : a.tipo === "enviada"
                            ? `Has enviado solicitud a ${a.amigo_username}`
                            : `${a.usuario_username} te ha enviado una solicitud`}
                          {a.status !== "aceptada" ? ` - ${a.status}` : ""}
                        </Text>

                        {a.status === "pendiente" && a.tipo === "recibida" ? (
                          <Flex gap={2}>
                            <Button
                              size="sm"
                              colorScheme="green"
                              onClick={() => handleActualizarAmistad(a.id, "aceptada")}
                            >
                              Aceptar
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleActualizarAmistad(a.id, "rechazada")}
                            >
                              Rechazar
                            </Button>
                          </Flex>
                        ) : a.status === "aceptada" ? (
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleEliminarAmigo(a.id)}
                          >
                            Eliminar amigo
                          </Button>
                        ) : null}
                      </Flex>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Flex>
  );
};