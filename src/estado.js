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

// Estado del jugador loggeado (su id, nombre de usuario y su puntuación máxima).
export const jugadorActivo = writable(null);

// Estado de la configuración del juego
export const sonidoActivo = writable(true);

// Variable para la URL de tu backend en Railway
export const BACKEND_URL = 'https://proyectofinal-backend-production-91d7.up.railway.app';