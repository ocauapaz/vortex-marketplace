import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// O pacote traz todos os subsets, mas cada um vem com unicode-range próprio —
// o navegador só baixa o latino.
import '@fontsource-variable/rubik'
import '@fontsource-variable/open-sans'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
