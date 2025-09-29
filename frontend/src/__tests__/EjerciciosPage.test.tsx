import { render, screen, fireEvent, waitFor, act} from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { EjerciciosPage, type Ejercicio } from "../components/pages/EjerciciosPage"
import * as exercisesService from "../services/exercises"
import { ChakraProvider } from "@chakra-ui/react"
import { theme } from "../styles/theme"

// Mock del toaster
vi.mock("../ui/toasterInstance", () => ({
  toaster: { create: vi.fn() },
}))

// Mock de CreateTipoEjercicio para que simplemente dispare onCreated
vi.mock("../organisms/CreateExercise", () => ({
  CreateTipoEjercicio: ({ onCreated }: { onCreated: (ej: Ejercicio) => void }) => (
    <button
      onClick={() =>
        onCreated({
          id: 999,
          nombre: "Nuevo",
          descripcion: "Desc",
          grupo_muscular: "pecho",
        })
      }
    >
      Crear nuevo ejercicio
    </button>
  ),
}))

describe("EjerciciosPage", () => {
  const mockEjercicios: Ejercicio[] = [
    { id: 1, nombre: "Press Banca", descripcion: "Pecho", grupo_muscular: "pecho" },
    { id: 2, nombre: "Curl Bíceps", descripcion: "Brazos", grupo_muscular: "brazos" },
  ]

  beforeEach(() => {
    vi.spyOn(exercisesService, "getTipoEjercicios").mockResolvedValue(mockEjercicios)
    vi.spyOn(exercisesService, "deleteTipoEjercicio").mockResolvedValue(undefined)
  })

  it("renderiza la lista de ejercicios", async () => {
    render(
      <ChakraProvider value={theme}>
        <EjerciciosPage />
      </ChakraProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("Press Banca")).toBeDefined()
      expect(screen.getByText("Curl Bíceps")).toBeDefined()
    })
  })

  it("filtra los ejercicios por grupo muscular", async () => {
    render(
      <ChakraProvider value={theme}>
        <EjerciciosPage />
      </ChakraProvider>
    )

    await waitFor(() => screen.getByText("Press Banca"))

    const pechoButton = screen.getByRole("button", { name: "Pecho" })

    await act(async () => {
      fireEvent.click(pechoButton)
    })

    expect(screen.getByText("Press Banca")).toBeDefined()
    expect(screen.queryByText("Curl Bíceps")).toBeNull()
  })

  it("abre el diálogo de eliminar al pulsar el botón eliminar", async () => {
    render(
      <ChakraProvider value={theme}>
        <EjerciciosPage />
      </ChakraProvider>
    )

    await waitFor(() => screen.getByText("Press Banca"))

    const deleteButtons = screen.getAllByRole("button", { name: "Eliminar" })
    
    await act(async () => {
      fireEvent.click(deleteButtons[0])
    })

    expect(screen.getByText(/¿Seguro que quieres eliminar "Press Banca"/)).toBeDefined()
  })
})
