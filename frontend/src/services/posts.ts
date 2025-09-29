import axios from "axios";

export interface Publicacion {
  id: number;
  usuario: string;
  contenido: string;
  tipo: string;
  fecha_creacion: string;
  likes_count: number;
  liked_by_user: boolean;
}

const API_URL = "http://localhost:8000/api/auth"; 

// Obtener todas las publicaciones (usuario + amigos)
export const getPublicaciones = async (): Promise<Publicacion[]> => {
  const token = JSON.parse(localStorage.getItem("authToken") || "{}")?.access;
  const res = await axios.get(`${API_URL}/publicaciones/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Crear una nueva publicación
export const createPublicacion = async (
  contenido: string,
  tipo: string = "general"
): Promise<Publicacion> => {
  const token = JSON.parse(localStorage.getItem("authToken") || "{}")?.access;
  const res = await axios.post(
    `${API_URL}/publicaciones/`,
    { contenido, tipo },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const likePost = async (id: number) => {
    const token = JSON.parse(localStorage.getItem("authToken") || "{}")?.access;
  const res = await axios.post(
    `${API_URL}/publicaciones/${id}/like/`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const unlikePost = async (id: number) => {
    const token = JSON.parse(localStorage.getItem("authToken") || "{}")?.access;
  const res = await axios.delete(`${API_URL}/publicaciones/${id}/unlike/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};