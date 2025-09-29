import { render, screen, fireEvent, waitFor, within, act } from "@testing-library/react";
import { PerfilPage } from "../components/pages/PerfilPage";
import * as authService from "../services/auth";
import * as friendshipService from "../services/friendship";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "../styles/theme";

describe("PerfilPage", () => {
  const tokenMock = { access: "fakeAccessToken" };

  const userMock = {
    id: 1,
    username: "juan",
    email: "juan@test.com",
    nombre: "Juan",
    apellidos: "Pérez",
  };

  const amistadesMock: friendshipService.Amistad[] = [
    { id: 1, usuario: 1, amigo: 2, usuario_username: "juan", usuario_email: "juan@test.com", amigo_username: "maria", tipo: "enviada", status: "aceptada" },
    { id: 2, usuario: 3, amigo: 1, usuario_username: "ana", usuario_email: "ana@test.com", amigo_username: "juan", tipo: "recibida", status: "pendiente" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("authToken", JSON.stringify(tokenMock));
    localStorage.setItem("user", JSON.stringify(userMock));

    vi.spyOn(authService, "getCurrentUser").mockResolvedValue(userMock);
    vi.spyOn(friendshipService, "getAmistades").mockResolvedValue(amistadesMock);
  });

  const renderComponent = () =>
    render(
      <ChakraProvider value={theme}>
        <PerfilPage />
      </ChakraProvider>
    );

  it("carga el perfil del usuario correctamente", async () => {
    renderComponent();

    // Hacer click en la pestaña perfil para asegurarnos que está visible
    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /Perfil/i }));
    });

    const perfilPanel = await screen.findByRole("tabpanel", { hidden: false });

    await waitFor(() => {
      expect(within(perfilPanel).getByDisplayValue("Juan")).toBeInTheDocument();
      expect(within(perfilPanel).getByDisplayValue("Pérez")).toBeInTheDocument();
    });
  });

  it("actualiza el perfil correctamente", async () => {
    const updateCurrentUserMock = vi
      .spyOn(authService, "updateCurrentUser")
      .mockResolvedValue({ ...userMock, nombre: "JuanActualizado" });

    renderComponent();

    // Click en la pestaña perfil antes de interactuar con el formulario
    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /Perfil/i }));
    });

    const perfilPanel = await screen.findByRole("tabpanel", { hidden: false });

    await act(async () => {
      fireEvent.change(within(perfilPanel).getByDisplayValue("Juan"), { target: { value: "JuanActualizado" } });
      fireEvent.click(within(perfilPanel).getByRole("button", { name: /guardar cambios/i }));
    });

    await waitFor(() => {
      expect(updateCurrentUserMock).toHaveBeenCalledWith("fakeAccessToken", {
        nombre: "JuanActualizado",
        apellidos: "Pérez",
      });
      expect(JSON.parse(localStorage.getItem("user")!)).toEqual({
        ...userMock,
        nombre: "JuanActualizado",
      });
    });
  });

  it("agrega un nuevo amigo correctamente", async () => {
    const crearAmistadMock = vi
      .spyOn(friendshipService, "crearAmistad")
      .mockResolvedValue({ id: 3, usuario_username: "juan", amigo_username: "ana", status: "pendiente", tipo: "enviada" });

    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /Amistades/i }));
    });

    const amistadesPanel = await screen.findByRole("tabpanel", { hidden: false });
    const inputAgregar = within(amistadesPanel).getByTestId("input-agregar-amigo");
    const btnAgregar = within(amistadesPanel).getByTestId("btn-agregar-amigo");

    await act(async () => {
      fireEvent.change(inputAgregar, { target: { value: "ana" } });
      fireEvent.click(btnAgregar);
    });

    await waitFor(() => {
      expect(crearAmistadMock).toHaveBeenCalledWith("ana", "fakeAccessToken");
      expect(inputAgregar).toHaveValue("");
    });
  });

  it("acepta una solicitud de amistad pendiente correctamente", async () => {
    const actualizarAmistadMock = vi
      .spyOn(friendshipService, "actualizarAmistad")
      .mockImplementation(async (id, status) => ({ ...amistadesMock.find((a) => a.id === id)!, status }));

    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /Amistades/i }));
    });

    const amistadesPanel = await screen.findByRole("tabpanel", { hidden: false });
    const aceptarBtn = await within(amistadesPanel).findByTestId("btn-aceptar-2");

    await act(async () => {
      fireEvent.click(aceptarBtn);
    });

    await waitFor(() => {
      expect(actualizarAmistadMock).toHaveBeenCalledWith(2, "aceptada", "fakeAccessToken");
    });
  });

  it("rechaza una solicitud de amistad correctamente", async () => {
    const actualizarAmistadMock = vi
      .spyOn(friendshipService, "actualizarAmistad")
      .mockResolvedValue({ ...amistadesMock[1], status: "rechazada" });

    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /Amistades/i }));
    });

    const amistadesPanel = await screen.findByRole("tabpanel", { hidden: false });
    const rechazarBtn = await within(amistadesPanel).findByTestId("btn-rechazar-2");

    await act(async () => {
      fireEvent.click(rechazarBtn);
    });

    await waitFor(() => {
      expect(actualizarAmistadMock).toHaveBeenCalledWith(2, "rechazada", "fakeAccessToken");
    });
  });

  it("elimina una amistad correctamente", async () => {
    const eliminarAmistadMock = vi
      .spyOn(friendshipService, "eliminarAmistad")
      .mockResolvedValue(undefined);

    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByTestId("tab-amistades"));
    });

    const amistadesPanel = await screen.findByRole("tabpanel", { hidden: false });
    const eliminarBtn = await within(amistadesPanel).findByTestId("btn-eliminar-1");

    await act(async () => {
      fireEvent.click(eliminarBtn);
    });

    await waitFor(() => {
      expect(eliminarAmistadMock).toHaveBeenCalledWith(1, "fakeAccessToken");
    });
  });
});