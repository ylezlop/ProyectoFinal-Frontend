import { writable } from "svelte/store";

// Define las vistas posibles de la aplicación
export const VISTAS = {
    MENU: 'menu',
    LOGIN: 'login',
    JUEGO: 'juego',
    CONFIG: 'config' 
};

// Estado para controlar la vista actual
export const vistaActual = writable(VISTAS.MENU);

// Estado del jugador loggeado (su id, nombre de usuario y su puntuación máxima)
export const jugadorActivo = writable(null);

// Estado de la configuración del juego
export const sonidoActivo = writable(true);

// IMPORTANTE
// Variable para la URL del backend en Railway (actualizar después del despliegue)
// Cuando cambiemos a Railway, actualizar esto: export const BACKEND_URL = 'https://proyectofinal-backend-production-91d7.up.railway.app/';
export const BACKEND_URL = 'http://localhost:8080';