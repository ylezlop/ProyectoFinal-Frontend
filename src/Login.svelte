<script>
    import { VISTAS, vistaActual, jugadorActivo, BACKEND_URL } from './estado.js';

    let usuario = '';
    let password = '';
    let mensaje = '';

    async function handleSubmit() {
        mensaje = 'Procesando...';
        
        // Validación mínima de la rúbrica
        if (!usuario || !password) {
            mensaje = 'El usuario y la contraseña no pueden estar vacíos.';
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, password })
            });

            const data = await response.json();

            if (response.ok && data.usuario) {
                // Login o Registro exitoso
                jugadorActivo.set(data);
                vistaActual.set(VISTAS.JUEGO);
            } else if (!data) {
                // Falló el login (contraseña incorrecta)
                mensaje = 'Error de inicio de sesión: Contraseña incorrecta.';
            } else {
                mensaje = 'Ocurrió un error desconocido.';
            }

        } catch (error) {
            mensaje = 'Error de conexión con el servidor. Intenta más tarde.';
            console.error(error);
        }
    }
</script>

<div>
    <h2>Iniciar Sesión / Crear Cuenta</h2>
    <form on:submit|preventDefault={handleSubmit}>
        <input type="text" bind:value={usuario} placeholder="Nombre de Usuario" required>
        <input type="password" bind:value={password} placeholder="Contraseña" required>
        <button type="submit">Entrar o Registrar</button>
    </form>

    <p style="color: red;">{mensaje}</p>

    <button on:click={() => vistaActual.set(VISTAS.MENU)}>Regresar al Menú</button>
</div>

<style>
    input { display: block; margin: 10px auto; padding: 10px; width: 80%; max-width: 300px; }
    form button { margin-top: 20px; }
</style>