import axios from "axios";
import type { EjercicioRutina } from "./routine-exercises";

export interface Rutina {
  id: number;
  nombre: string;
  usuario: number;
  dia: string; // lunes, martes, miércoles...
  ejercicios?: EjercicioRutina[];
}

const API_URL = "http://localhost:8000/api/auth/rutinas/";

const getAuthHeaders = () => {
  const data = localStorage.getItem("authToken");
  const token = data ? JSON.parse(data).access : null;
  if (!token) throw new Error("No se encontró token de autenticación.");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Obtener todas las rutinas del usuario
export const getRutinas = async (): Promise<Rutina[]> => {
  const response = await axios.get(API_URL, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Crear una nueva rutina
export const createRutina = async (
  rutina: Omit<Rutina, "id">
): Promise<Rutina> => {
  const response = await axios.post(API_URL, rutina, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  return response.data;
};

// Eliminar rutina por ID
export const deleteRutina = async (id: number): Promise<void> => {
  console.log("Deleting rutina with id:", id);
  await axios.delete(`${API_URL}${id}/`, {
    headers: getAuthHeaders(),
  });
};

// Actualizar rutina
export const updateRutina = async (
  id: number,
  rutina: Partial<Omit<Rutina, "id">>
): Promise<Rutina> => {
  const response = await axios.put(`${API_URL}${id}/`, rutina, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  return response.data;
};

export const reorderEjerciciosRutina = async (
  rutinaId: number,
  ejercicios: { id: number; orden: number }[]
): Promise<void> => {
  await axios.put(
    `${API_URL}${rutinaId}/reorder-ejercicios/`,
    { ejercicios }, // el backend espera un objeto con la clave "ejercicios"
    {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    }
  );
};