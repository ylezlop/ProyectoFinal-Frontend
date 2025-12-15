<script>
    // Importamos los componentes necesarios
    import MenuPrincipal from './Menu.svelte';
    import Login from './Login.svelte';
    import Juego from './Juego.svelte';
    import Configuracion from './Configuracion.svelte';
    import { VISTAS, vistaActual, jugadorActivo} from './estado.js';
    
    // Variables locales para suscribirse a los stores
    let vista;
    vistaActual.subscribe(v => { vista = v; });

    let jugador;
    jugadorActivo.subscribe(j => { jugador = j; });

</script>

<main>
    <div class="header">
        <h1>Apple & Basket</h1> <!-- Título del juego (nos quedamos sin ideas :c)-->
        {#if jugador}
            <p>Jugador: <strong>{jugador.usuario}</strong> | Récord: {jugador.maxPuntuacion}</p>
        {/if}
    </div>

    {#if vista === VISTAS.MENU}
        <MenuPrincipal />
    {:else if vista === VISTAS.LOGIN}
        <Login />
    {:else if vista === VISTAS.JUEGO}
        <Juego />
    {:else if vista === VISTAS.CONFIG}
        <Configuracion />
    {/if}
</main>

<style>
    /* Estilos para cenntrar el juego */
    main {
        text-align: center;
        padding: 1em;
        max-width: 800px;
        margin: 0 auto;
        font-family: sans-serif;
    }
    .header {
        margin-bottom: 20px;
        border-bottom: 2px solid #eee;
        padding-bottom: 10px;
    }
</style>