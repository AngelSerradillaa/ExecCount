import 'devextreme/dist/css/dx.light.css';
import { Routes, Route } from "react-router-dom";
import { LoginPage } from "./components/pages/LoginPage";
import { RegisterPage } from "./components/pages/RegisterPage";
import { EjerciciosPage } from "./components/pages/EjerciciosPage";
import { RutinasPage } from "./components/pages/RutinasPage";
import { SocialPage } from "./components/pages/SocialPage";
import { PerfilPage } from "./components/pages/PerfilPage";
import { Flex, Box } from "@chakra-ui/react";
import { Navbar } from "./components/molecules/NavBar"; 
import { ProtectedRoute } from "./components/atoms/ProtectedRoute";
import { Outlet } from "react-router-dom";
import { Toaster } from "./components/ui/toaster"

// Layout que incluye la navbar
function AppLayout() {
  return (
    <Flex direction="column" minH="100vh" >
      <Navbar />
      <Box flex="1" p={4}>
        <Outlet />
      </Box>
    </Flex>
  );
}

function App() {
  return (
    <Flex direction="column" minH="100vh" position="relative"
  bg="#242424" 
  _before={{
    content: '""',
    position: "absolute",
    inset: 0,
    bgImage: "url('/fondo_tfm.png')",
    bgSize: "cover",
    bgPos: "center",
    bgRepeat: "no-repeat",
    bgAttachment: "fixed",
    opacity: 0.40, 
  }}>
    <Box flex="1" position="relative" zIndex={1}>
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          
          <Route path="/ejercicios" element={<EjerciciosPage />} />
          <Route path="/rutinas" element={<RutinasPage />} />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
        </Route>
      </Route>
    </Routes>
    <Toaster />
    </Box>
    </Flex>
  );
}

export default App;
