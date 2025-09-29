import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginPage } from "../components/pages/LoginPage";
import * as authService from "../services/auth";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ChakraProvider } from "@chakra-ui/react"
import { theme } from "../styles/theme"

// Mock de useNavigate
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("calls loginUser and getCurrentUser on submit and navigates", async () => {
    // Aquí tipamos correctamente los mocks
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
        <LoginPage />
      </MemoryRouter>
      </ChakraProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "juan@test.com" } });
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /acceder/i }));

    await waitFor(() => {
      expect(loginUserMock).toHaveBeenCalledWith("juan@test.com", "123456");
      expect(getCurrentUserMock).toHaveBeenCalledWith("fakeAccessToken");
      expect(localStorage.getItem("authToken")).toBe(JSON.stringify({
        access: "fakeAccessToken",
        refresh: "fakeRefreshToken",
      }));
      expect(localStorage.getItem("user")).toBe(JSON.stringify({ id: 1, username: "juan" }));
      expect(mockedNavigate).toHaveBeenCalledWith("/rutinas");
    });
  });
});