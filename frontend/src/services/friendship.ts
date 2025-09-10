import axios from "axios";

const API_URL = "http://localhost:8000/api/auth"; // ajusta si usas otro prefijo

export interface Amistad {
  id: number;
  usuario: number;
  amigo: number;
  amigo_username: string;
  usuario_username: string;
  usuario_email: string;
  tipo: string;
  status: "pendiente" | "aceptada" | "rechazada";
}

// Listar amistades del usuario
export const getAmistades = async (token: string): Promise<Amistad[]> => {
  const res = await axios.get(`${API_URL}/amistades/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Enviar solicitud
export const crearAmistad = async (amigo: string, token: string) => {
    console.log("Creating friendship with:", amigo);
  const res = await axios.post(
    `${API_URL}/amistades/crear/`,
    { amigo_input: amigo }, 
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

// Eliminar amistad
export const eliminarAmistad = async (amistadId: number, token: string) => {
  await axios.delete(`${API_URL}/amistades/${amistadId}/eliminar/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const actualizarAmistad = async (
  amistadId: number,
  status: "aceptada" | "rechazada",
  token: string
) => {
  const res = await axios.patch(
    `${API_URL}/amistades/${amistadId}/actualizar/`,
    { status },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};