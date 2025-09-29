import axios from "axios";

export interface TipoEjercicio {
  id: number;
  nombre: string;
  descripcion: string;
  grupo_muscular: string;
}

const API_URL = "http://localhost:8000/api/auth/tipo-ejercicios/";

const getAuthHeaders = () => {
  const data = localStorage.getItem("authToken");
  const token = data ? JSON.parse(data).access : null;
  if (!token) throw new Error("No se encontró token de autenticación.");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Obtener todos los tipos de ejercicios
export const getTipoEjercicios = async (): Promise<TipoEjercicio[]> => {
  const response = await axios.get(API_URL, {
    headers: getAuthHeaders(),
  });
  console.log(response.data);
  return response.data;
};

// Crear un nuevo tipo de ejercicio
export const createTipoEjercicio = async (
  ejercicio: Omit<TipoEjercicio, "id">
): Promise<TipoEjercicio> => {
  const response = await axios.post(API_URL, ejercicio, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });
  return response.data;
};

export const deleteTipoEjercicio = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}${id}/`, {
    headers: getAuthHeaders(),
  });
};