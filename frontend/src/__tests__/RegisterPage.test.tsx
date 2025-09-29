import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RegisterPage } from "../components/pages/RegisterPage";
import * as authService from "../services/auth";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "../styles/theme";

// Mock de useNavigate
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("calls registerUser, loginUser, getCurrentUser and navigates on submit", async () => {
    // Mocks
    const registerUserMock = vi.spyOn(authService, "registerUser").mockResolvedValue({});
    const loginUserMock = vi.spyOn(authService, "loginUser").mockResolvedValue({
      access: "fakeAccessToken",
      refresh: "fakeRefreshToken",
    });
    const getCurrentUserMock = vi.spyOn(authService, "getCurrentUser").mockResolvedValue({
      id: 1,
      username: "juan",
    });

    render(
      <ChakraProvider value={theme}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </ChakraProvider>
    );

    // Rellenar formulario
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: "juan" } });
    fireEvent.change(screen.getByPlaceholderText(/nombre/i), { target: { value: "Juan" } });
    fireEvent.change(screen.getByPlaceholderText(/apellidos/i), { target: { value: "Pérez" } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "juan@test.com" } });
    fireEvent.change(screen.getByPlaceholderText(/^contraseña$/i), { target: { value: "123456" } });
    fireEvent.change(screen.getByPlaceholderText(/repite la contraseña/i), { target: { value: "123456" } });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /registrarse/i }));

    await waitFor(() => {
      expect(registerUserMock).toHaveBeenCalledWith({
        username: "juan",
        nombre: "Juan",
        apellidos: "Pérez",
        email: "juan@test.com",
        password: "123456",
        password2: "123456",
      });
      expect(loginUserMock).toHaveBeenCalledWith("juan@test.com", "123456");
      expect(getCurrentUserMock).toHaveBeenCalledWith("fakeAccessToken");
      expect(localStorage.getItem("authToken")).toBe(
        JSON.stringify({ access: "fakeAccessToken", refresh: "fakeRefreshToken" })
      );
      expect(localStorage.getItem("user")).toBe(
        JSON.stringify({ id: 1, username: "juan" })
      );
      expect(mockedNavigate).toHaveBeenCalledWith("/rutinas");
    });
  });
});