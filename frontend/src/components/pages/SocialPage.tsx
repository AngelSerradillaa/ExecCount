import { useEffect, useState } from "react";
import {
  Button,
  Flex,
  Heading,
  Textarea,
  VStack,
  Spinner,
  Container,
} from "@chakra-ui/react";
import { getPublicaciones, createPublicacion, type Publicacion } from "../../services/posts";
import { PostCard } from "../organisms/PostCard";

export const SocialPage = () => {
  const [posts, setPosts] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [contenido, setContenido] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getPublicaciones();
      setPosts(data);
    } catch (err) {
      console.error("Error cargando publicaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!contenido.trim()) return;
    try {
      const nueva = await createPublicacion(contenido);
      setPosts([nueva, ...posts]);
      setContenido("");
    } catch (err) {
      console.error("Error creando publicación:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Container maxW="lg" p={4} mt={12}>
      {/* Caja para crear post */}
      <VStack gap={2} my={6}>
        <Heading size="2xl" mb={6} textAlign="left">
        Comparte con tus amigos:
        </Heading>
        <Textarea
          placeholder="¿Qué estás pensando?"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          bg="gray.800"
          color="white"
        />
        <Button size="sm" bgColor="brand.500" _hover={{bgColor:"brand.700"}} onClick={handleCreate} alignSelf="flex-end">
          Publicar
        </Button>
      </VStack>

      {/* Feed */}
      <Heading size="md" mb={3} textAlign="center">
        Últimas publicaciones
      </Heading>
      {loading ? (
        <Flex justify="center" mt={6}>
          <Spinner />
        </Flex>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </Container>
  );
};