<script>
    // Importamos los componentes necesarios
    import { VISTAS, vistaActual, jugadorActivo, BACKEND_URL } from './estado.js';
    import { onMount } from 'svelte';

    let topJugadores = [];

    // Función para obtener el Scoreboard (CRUD: READ)
    async function cargarScoreboard() {
        const response = await fetch(`${BACKEND_URL}/scoreboard`);
        if (response.ok) {
            topJugadores = await response.json();
        } else {
            console.error("Error al cargar el scoreboard.");
        }
    }

    onMount(cargarScoreboard);

    // Navegación
    function iniciarJuego() {
        // Si no hay jugador logeado, vamos al login, sino al juego
        jugadorActivo.subscribe(j => {
            if (j) {
                vistaActual.set(VISTAS.JUEGO);
            } else {
                vistaActual.set(VISTAS.LOGIN);
            }
        })(); // El () final ejecuta la suscripción inmediatamente.
    }
</script>

<div>
    <h2>Menú Principal</h2>
    <button on:click={iniciarJuego}>Jugar</button>
    <button on:click={() => vistaActual.set(VISTAS.CONFIG)}>Configuración</button>

    <h2>Las 5 mejores puntuaciones </h2>
    
    {#if topJugadores.length === 0}
        <p>Cargando el ranking...</p>
    {:else}
        <table>
            <thead>
                <tr><th>#</th><th>Usuario</th><th>Máxima Puntuación</th></tr>
            </thead>
            <tbody>
                {#each topJugadores as jugador, i}
                    <tr>
                        <td>{i + 1}</td>
                        <td>{jugador.usuario}</td>
                        <td>{jugador.maxPuntuacion}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>

<style>
    div {
        /* Fondo semitransparente estilo "Glassmorphism" (lo sauqé de internet :/) */
        background-color: rgba(255, 255, 255, 0.05); 
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); /* Sombra difusa */
        backdrop-filter: blur(4px); /* Difumina lo de atrás */
        max-width: 600px;
        margin: 0 auto; /* Centrado horizontal */
    }

    h2, h3 {
        margin-bottom: 1rem;
    }

    /* Tabla de puntuaciones */
    table {
        width: 100%;
        margin-top: 20px;
        border-collapse: collapse; /* Para que las celdas estén pegadas */
        background-color: rgba(0,0,0,0.2);
        border-radius: 8px;
        overflow: hidden; /* Recorta las esquinas cuadradas */
    }

    th, td {
        padding: 12px;
        text-align: center;
        /* Línea sutil para separar filas */
        border-bottom: 1px solid rgba(255,255,255,0.1); 
    }

    th {
        background-color: #0f3460;
        color: white;
        text-transform: uppercase; /* Encabezados en mayúsculas */
        font-size: 0.9em;
    }

    tr:hover {
        /* Resalta la fila donde pones el mouse */
        background-color: rgba(255,255,255,0.05); 
    }
</style>