import axios from "axios";

interface RegisterData {
  email: string;
  username: string;
  nombre: string;
  apellidos: string;
  password: string;
  password2: string;
}

export const loginUser = async (email: string, password: string) => {
  const response = await axios.post("http://localhost:8000/api/auth/login/", {
    email,
    password,
  });
  console.log("Login response:", response.data);
  if (!response.data?.access) {
    throw new Error("Token no recibido desde el servidor.");
  }

  return response.data;
};

export const getCurrentUser = async (token: string) => {
  const response = await axios.get("http://localhost:8000/api/auth/users/me/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const registerUser = async (data: RegisterData) => {
  const response = await axios.post("http://localhost:8000/api/auth/registro/", data);
  if (!response.data?.username) {
    throw new Error("No se pudo crear el usuario.");
  }
  return response.data;
};

export const logoutUser = async () => {
  const token = localStorage.getItem("authToken");
  console.log("Token para logout:", token);
  try {
    
    await axios.post(
      "http://localhost:8000/api/auth/logout/",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
  } catch (error) {
    console.error("Error al hacer logout en el backend:", error);
  }

  // Elimina el token del localStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};