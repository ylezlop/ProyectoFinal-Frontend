<script>
    import { VISTAS, vistaActual, jugadorActivo, BACKEND_URL } from './estado.js';

    let usuario = '';
    let password = '';
    let mensaje = '';

    async function handleSubmit() {
        mensaje = 'Procesando...';
        
        // Validación básica
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
                // Login exitoso ^^
                jugadorActivo.set(data);
                vistaActual.set(VISTAS.JUEGO);
            } else if (!data) {
                // Falló el login (contraseña incorrecta lol)
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
    div {
        /* Tarjeta centrada con fondo oscuro */
        background-color: rgba(255, 255, 255, 0.05);
        padding: 3rem;
        border-radius: 15px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        max-width: 400px;
        margin: 0 auto; /* Importante para centrar */
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    form {
        display: flex;
        flex-direction: column;
        width: 100%;
        align-items: center; /* Centra los inputs y botones */
    }

    h2 {
        margin-bottom: 1.5rem;
        color: #e94560; /* Usamos el color de acento del tema */
    }
</style>