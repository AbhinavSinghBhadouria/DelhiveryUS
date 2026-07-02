import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// createRoot - React 18 ka naya way hai DOM mein app mount karne ka
// 'root' div index.html mein hai - wahan pe poora React app render hoga
createRoot(document.getElementById('root')).render(
  // StrictMode development mein extra warnings aur double renders karta hai
  // production build mein iska koi effect nahi hota
  <StrictMode>
    <App />
  </StrictMode>,
)
