import { mount } from 'svelte'
import './app.css'
import App from './App.svelte' // Traemos el componente principal (donde se controla todo)

// Montamos la aplicación Svelte.
const app = mount(App, {
  // Le pedimos que inyecte todo el código de Svelte dentro del 
  // elemento HTML que tenga el id="app" (que está en index.html)
  target: document.getElementById('app'),
})

export default app
