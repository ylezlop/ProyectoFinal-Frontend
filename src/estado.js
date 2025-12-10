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

// Estado del jugador loggeado
// { id: number, usuario: string, maxPuntuacion: number }
export const jugadorActivo = writable(null);

// Estado de la configuración del juego
export const sonidoActivo = writable(true);

// IMPORTANTE
// Variable para la URL de tu backend en Railway (actualizar después del despliegue)
// Cuando uses Railway, actualiza esto: export const BACKEND_URL = 'https://[TU-URL-RAILWAY]';
export const BACKEND_URL = 'proyectofinal-backend-production-91d7.up.railway.app';