import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './App.tsx'
import { ChakraProvider } from "@chakra-ui/react"
import { theme } from "./styles/theme"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>,
)
