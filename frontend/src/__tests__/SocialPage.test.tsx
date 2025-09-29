import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SocialPage } from "../components/pages/SocialPage";
import * as postsService from "../services/posts";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "../styles/theme";
import type { Publicacion } from "../services/posts";

// Mock PostCard para no depender de su implementación
vi.mock("../components/organisms/PostCard", () => ({
  PostCard: ({ post }: { post: Publicacion }) => <div data-testid="post">{post.contenido}</div>,
}));

describe("SocialPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches posts on mount and allows creating a new post", async () => {
    const publicacionesMock: Publicacion[] = [
        {
            id: 1,
            usuario: "juan",
            contenido: "Post 1",
            tipo: "texto",
            fecha_creacion: "2025-09-25T16:00:00Z",
            likes_count: 5,
            liked_by_user: false,
        },
        {
            id: 2,
            usuario: "maria",
            contenido: "Post 2",
            tipo: "texto",
            fecha_creacion: "2025-09-25T15:30:00Z",
            likes_count: 3,
            liked_by_user: true,
        },
        ];
    const nuevaPublicacionMock: Publicacion = {
        id: 3,
        usuario: "juan",
        contenido: "Nuevo post",
        tipo: "texto",
        fecha_creacion: "2025-09-25T16:30:00Z",
        likes_count: 0,
        liked_by_user: false,
        };

    // Mocks de los servicios
    const getPublicacionesMock = vi.spyOn(postsService, "getPublicaciones").mockResolvedValue(publicacionesMock);
    const createPublicacionMock = vi.spyOn(postsService, "createPublicacion").mockResolvedValue(nuevaPublicacionMock);

    render(
      <ChakraProvider value={theme}>
        <SocialPage />
      </ChakraProvider>
    );

    // Espera a que se carguen los posts
    await waitFor(() => {
      expect(getPublicacionesMock).toHaveBeenCalled();
      expect(screen.getAllByTestId("post")).toHaveLength(2);
    });

    // Escribir un nuevo post y publicarlo
    fireEvent.change(screen.getByPlaceholderText(/qué estás pensando/i), { target: { value: "Nuevo post" } });
    fireEvent.click(screen.getByRole("button", { name: /publicar/i }));

    await waitFor(() => {
      expect(createPublicacionMock).toHaveBeenCalledWith("Nuevo post");
      // Ahora debe renderizarse también el nuevo post al principio
      const posts = screen.getAllByTestId("post");
      expect(posts).toHaveLength(3);
      expect(posts[0]).toHaveTextContent("Nuevo post");
    });
  });
});