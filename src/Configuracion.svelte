<script>
    // Importamos los stores necesarios
    import { VISTAS, vistaActual, jugadorActivo, sonidoActivo, BACKEND_URL } from './estado.js';

    let usuarioEliminar = '';
    let passwordEliminar = '';
    let mensajeEliminar = '';

    // Suscripción al store para el checkbox de sonido
    let sonido;
    sonidoActivo.subscribe(v => { sonido = v; });

    // Función para eliminar el usuario (CRUD: DELETE)
    async function eliminarCuenta() {
        mensajeEliminar = 'Procesando eliminación...';
        
        if (!usuarioEliminar || !passwordEliminar) {
            mensajeEliminar = 'Debes ingresar el usuario y contraseña.';
            return;
        }

        // Llamada al backend para eliminar la cuenta
        try {
            const response = await fetch(`${BACKEND_URL}/borrar`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    usuario: usuarioEliminar, 
                    password: passwordEliminar 
                })
            });

            // Esperamos true/false del backend
            const exito = await response.json(); // Esperamos true/false del backend

            if (response.ok && exito === true) {
                mensajeEliminar = 'Cuenta eliminada con éxito. Regresando al menú.'; // Nos contestó que sí :D
                jugadorActivo.set(null); // Desloguear
                setTimeout(() => vistaActual.set(VISTAS.MENU), 2000);
            } else {
                mensajeEliminar = 'Error: Usuario o contraseña incorrectos.'; // Se  equivocaron con el usuario o la contraseña xd
            }
        } catch (error) {
            mensajeEliminar = 'Error de conexión con el servidor.'; 
        }
    }
</script>


<div>
    <h2>Configuración</h2>

    <h3>Ajustes de Sonido</h3>
    <label>
        <input type="checkbox" bind:checked={sonido} on:change={() => sonidoActivo.set(sonido)}>
        Sonido del juego {sonido ? 'ACTIVO' : 'INACTIVO'}
    </label>

    <h3>Eliminar Cuenta</h3>
    <p>Para eliminar tu cuenta, ingresa tus credenciales:</p>
    <form on:submit|preventDefault={eliminarCuenta}>
        <input type="text" bind:value={usuarioEliminar} placeholder="Usuario a eliminar" required>
        <input type="password" bind:value={passwordEliminar} placeholder="Contraseña" required>
        <button type="submit" style="background-color: darkred;">Eliminar Mi Cuenta</button>
    </form>
    <p style="color: darkred; font-weight: bold;">{mensajeEliminar}</p>

    <button on:click={() => vistaActual.set(VISTAS.MENU)}>Regresar al Menú</button>
</div>