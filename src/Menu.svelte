<script>
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
        // Si no hay jugador logeado, vamos al login, sino al juego.
        jugadorActivo.subscribe(j => {
            if (j) {
                vistaActual.set(VISTAS.JUEGO);
            } else {
                vistaActual.set(VISTAS.LOGIN);
            }
        })(); // El () final ejecuta la suscripción inmediatamente
    }
</script>

<div>
    <h2>Menú Principal</h2>
    <button on:click={iniciarJuego}>Jugar</button>
    <button on:click={() => vistaActual.set(VISTAS.CONFIG)}>Configuración</button>

    <h3>🏆 Top 5 Scoreboard</h3>
    
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
    table {
        width: 100%;
        margin-top: 20px;
        border-collapse: collapse;
    }
    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }
    button { margin: 5px; padding: 10px 20px; }
</style>