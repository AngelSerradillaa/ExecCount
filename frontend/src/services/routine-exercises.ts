import axios from "axios";

export interface EjercicioRutina {
  id: number;
  rutina: number; // id de la rutina
  tipo_ejercicio: number; // id del tipo de ejercicio
  nombre_ejercicio?: string; // nombre del ejercicio (campo adicional)
  sets: number;
  repeticiones: number;
  record_peso?: number | null;
  orden: number;
}

const API_URL = "http://localhost:8000/api/auth/ejercicio-rutinas/";

const getAuthHeaders = () => {
  const data = localStorage.getItem("authToken");
  const token = data ? JSON.parse(data).access : null;
  if (!token) throw new Error("No se encontró token de autenticación.");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Crear un ejercicio en una rutina
export const createEjercicioRutina = async (
  ejercicio: Omit<EjercicioRutina, "id">
): Promise<EjercicioRutina> => {
  console.log("Creating ejercicio:", ejercicio);
  const response = await axios.post(API_URL, ejercicio, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  return response.data;
};

// Obtener ejercicios de una rutina concreta
export const getEjerciciosByRutina = async (
  rutinaId: number
): Promise<EjercicioRutina[]> => {
  const response = await axios.get(`${API_URL}?rutina=${rutinaId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

// Eliminar ejercicio
export const deleteEjercicioRutina = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}${id}/`, {
    headers: getAuthHeaders(),
  });
};