<script>
    import { VISTAS, vistaActual, jugadorActivo, sonidoActivo, BACKEND_URL } from './estado.js';
    import { onMount, onDestroy } from 'svelte';


    // rutas imagenes
    const RUTA_MANZANA_BUENA = '/manzana-roja.png'; 
    const RUTA_MANZANA_PODRIDA = '/manzana.png';
    const RUTA_CANASTA = '/canasta.png'; 
    
    // Objetos Image para Canvas
    let imgCanasta;
    let imgManzanaBuena;
    let imgManzanaPodrida;

    // Variables de estado del juego
    let puntuacion = 0;
    let tiempo = 0;
    let pausa = false;
    
    // El jugador es reactivo desde el estado global
    let jugador;
    jugadorActivo.subscribe(j => { jugador = j; });

    // Referencia al elemento Canvas
    let canvas;
    let ctx;
    let animacionFrame; // Para controlar el loop del juego

    // Dimensiones y lógica
    const WIDTH = 400;
    const HEIGHT = 600;
    const CANASTA_W = 80;
    const CANASTA_H = 40;
    const FRUTA_R = 15;
    let canastaX = WIDTH / 2 - CANASTA_W / 2;
    let items = [];
    let timerInterval;

    // --- Funciones del Juego ---

    function iniciarTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (!pausa) {
                tiempo++;
            }
        }, 1000);
    }

    //modifiqué para agregar la imagen de la canasta -k
    function dibujarCanasta() {
        if (imgCanasta && imgCanasta.complete) {
            // Dibuja la imagen de la canasta
            // Posición: Usamos HEIGHT - CANASTA_H para que el fondo sea la línea del suelo
            ctx.drawImage(imgCanasta, canastaX, HEIGHT - CANASTA_H, CANASTA_W, CANASTA_H);
        } else {
        ctx.fillStyle = 'blue';
        // Semicírculo (Arco: empieza en 0 grados (derecha), termina en Math.PI (izquierda))
        ctx.beginPath();
        ctx.arc(canastaX + CANASTA_W / 2, HEIGHT - 20, CANASTA_W / 2, Math.PI, 0, false);
        ctx.lineTo(canastaX + CANASTA_W, HEIGHT);
        ctx.lineTo(canastaX, HEIGHT);
        ctx.fill();
        }
    }

    //otra modificacion para agregar las imagenes de las frutas -k
    function dibujarItem(item) {
        let img;
        if (item.tipo === 'fruta') {
            img = imgManzanaBuena; // Manzana buena (roja original)
        } else {
            img = imgManzanaPodrida; // Manzana podrida (negra original)
        }
        
        // El tamaño de la fruta 
        const size = FRUTA_R * 2;
        const x_pos = item.x - FRUTA_R; // Ajusta a la esquina superior izquierda
        const y_pos = item.y - FRUTA_R;
        
        if (img && img.complete) {
            ctx.drawImage(img, x_pos, y_pos, size, size);
        } else {
            // dibujar círculo si la imagen no está lista)
            ctx.fillStyle = item.tipo === 'fruta' ? 'red' : 'black';
            ctx.beginPath();
            ctx.arc(item.x, item.y, FRUTA_R, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function generarItem() {
        const tipo = Math.random() < 0.7 ? 'fruta' : 'trampa'; // 70% fruta, 30% trampa
        items.push({
            x: Math.random() * (WIDTH - FRUTA_R * 2) + FRUTA_R,
            y: -FRUTA_R,
            tipo: tipo,
            velocidad: Math.random() * 1 + 1 // Velocidad de caída
        });
    }

    function actualizarJuego() {
        if (pausa) return;

        // 1. Limpiar Canvas
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        // 2. Mover Items y Colisiones
        items = items.filter(item => {
            item.y += item.velocidad;

            // Colisión con la Canasta (zona semicírculo)
            if (item.y > HEIGHT - 20 - FRUTA_R && item.y < HEIGHT) {
                const distanciaX = item.x - (canastaX + CANASTA_W / 2);
                if (Math.abs(distanciaX) < CANASTA_W / 2) {
                    
                    if (item.tipo === 'fruta') {
                        puntuacion += 10;
                        if ($sonidoActivo) { /* Tocar sonido de punto */ }
                    } else {
                        puntuacion = Math.max(0, puntuacion - 20); // Penalización
                        if ($sonidoActivo) { /* Tocar sonido de error */ }
                    }
                    return false; // Elimina el item atrapado
                }
            }
            
            // Si el item cae fuera (lo pierdes), también se elimina
            if (item.y > HEIGHT + FRUTA_R) {
                // Podríamos penalizar si pierdes una fruta, o no hacer nada si pierdes una trampa.
                return false;
            }

            return true;
        });

        // 3. Dibujar
        dibujarCanasta();
        items.forEach(dibujarItem);

        // 4. Generar nuevo item de forma periódica (cada 60 frames)
        if (tiempo % 1 === 0 && Math.random() < 0.1) {
            generarItem();
        }

        // 5. Loop
        animacionFrame = requestAnimationFrame(actualizarJuego);
    }

    // --- Control de Teclado (Canasta) ---
    function manejarMovimiento(e) {
        if (pausa) return;
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            canastaX = Math.max(0, canastaX - 15);
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            canastaX = Math.min(WIDTH - CANASTA_W, canastaX + 15);
        }
    }

    // --- Control de Pausa y Salida ---

    function togglePausa() {
        pausa = !pausa;
        if (!pausa) {
            actualizarJuego(); // Reanuda el loop de animación
            iniciarTimer(); // Reanuda el tiempo
        } else {
            cancelAnimationFrame(animacionFrame);
            clearInterval(timerInterval);
        }
    }

    async function cargarImagenes() {
        // Promesa para esperar a que todas las imágenes carguen
        return new Promise(resolve => {
            let loadedCount = 0;
            const totalImages = 3;

            const onImageLoad = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    resolve();
                }
            };
            
            imgCanasta = new Image();
            imgCanasta.onload = onImageLoad;
            imgCanasta.src = RUTA_CANASTA;

            imgManzanaBuena = new Image();
            imgManzanaBuena.onload = onImageLoad;
            imgManzanaBuena.src = RUTA_MANZANA_BUENA;

            imgManzanaPodrida = new Image();
            imgManzanaPodrida.onload = onImageLoad;
            imgManzanaPodrida.src = RUTA_MANZANA_PODRIDA;
        });
    }

    async function regresarAlMenu() {
        // 1. Detener el juego
        cancelAnimationFrame(animacionFrame);
        clearInterval(timerInterval);

        // 2. Guardar Puntuación (CRUD: UPDATE)
        if (jugador && puntuacion > jugador.maxPuntuacion) {
            await fetch(`${BACKEND_URL}/puntaje`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    usuario: jugador.usuario, 
                    maxPuntuacion: puntuacion 
                })
            });
            // Actualiza el store para reflejar el nuevo récord
            jugadorActivo.update(j => ({ ...j, maxPuntuacion: puntuacion }));
        }

        // 3. Resetear el estado del juego (para nueva partida)
        puntuacion = 0;
        tiempo = 0;
        items = [];
        pausa = false;

        // 4. Regresar
        vistaActual.set(VISTAS.MENU);
    }

    // --- Ciclo de Vida Svelte ---
    onMount(() => {
        ctx = canvas.getContext('2d');
        // ESPERAR A QUE LAS IMÁGENES CARGUEN ANTES DE INICIAR EL JUEGO
        cargarImagenes();
        iniciarTimer();
        actualizarJuego();
        window.addEventListener('keydown', manejarMovimiento);
    });

    onDestroy(() => {
        cancelAnimationFrame(animacionFrame);
        clearInterval(timerInterval);
        window.removeEventListener('keydown', manejarMovimiento);
    });

</script>

<div>
    <h2>🕹️ Game On!</h2>
    <p>
        Puntuación: <strong>{puntuacion}</strong> | 
        Tiempo: <strong>{tiempo}s</strong> | 
        Mejor Récord: <strong>{jugador ? jugador.maxPuntuacion : 'N/A'}</strong>
    </p>

    <div class="canvas-container">
        <canvas bind:this={canvas} width={WIDTH} height={HEIGHT}></canvas>
        {#if pausa}
            <div class="pausa-overlay">
                <h3>Juego Pausado</h3>
                <button on:click={togglePausa}>Reanudar</button>
                <button on:click={regresarAlMenu}>Regresar al Menú Principal</button>
            </div>
        {/if}
    </div>

    <button on:click={togglePausa}>{pausa ? 'Reanudar' : 'Pausar'}</button>
    
    {#if !pausa}
        <p class="instrucciones">Usa ← y → (o A y D) para mover la canasta.</p>
    {/if}
</div>

<style>
    .canvas-container {
        position: relative;
        display: inline-block;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }
    canvas {
        background-color: #aaf; /* Cielo */
        display: block;
    }
    .pausa-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10;
    }
    .pausa-overlay button {
        margin: 10px;
        padding: 10px 30px;
    }
</style>