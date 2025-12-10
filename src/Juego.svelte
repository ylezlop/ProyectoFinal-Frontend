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

    // modificaciones para implementar niveles -k

    // probabilidad de que aparezca un ítem en un fotograma dado.
    // Base 0.05 (5%) y sube hasta 0.2 (20%).
    function getProbabilidadAparicion() {
        // La dificultad máxima se alcanza después de 90 segundos
        const maxTiempo = 90; 
        const minProb = 0.005; // Al inicio, solo 0.5% de probabilidad por frame
        const maxProb = 0.05; // Máximo 5% de probabilidad por frame 

        if (tiempo >= maxTiempo) {
            return maxProb;
        }
        
        return minProb + (maxProb - minProb) * (tiempo / maxTiempo);
    }
    
    // probabilidad de que el ítem sea una trampa (manzana podrida)
    function getProbabilidadTrampa() {
        const tiempoIntroduccion = 10; // Las trampas aparecen a partir del segundo 10
        const tiempoMaximo = 45;      // Alcanza la probabilidad máxima a los 45 segundos
        const maxProbTrampa = 0.4;    // Máximo 40% de probabilidad de ser trampa

        if (tiempo < tiempoIntroduccion) {
            return 0; // Nivel 1: 0% de trampas
        }
        if (tiempo >= tiempoMaximo) {
            return maxProbTrampa; // Nivel Máximo: 40% de trampas
        }
        
        // Calcular la probabilidad entre 10s y 45s (0% a 40%)
        const tiempoProgresion = tiempo - tiempoIntroduccion;
        const duracionProgresion = tiempoMaximo - tiempoIntroduccion;
        
        return maxProbTrampa * (tiempoProgresion / duracionProgresion);
    }

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
        // Usamos la nueva función para determinar la probabilidad de trampa
        const probTrampa = getProbabilidadTrampa();
        
        // El ítem es trampa si el número aleatorio es menor que la probabilidad calculada
        const tipo = Math.random() < probTrampa ? 'trampa' : 'fruta';
        items.push({
            x: Math.random() * (WIDTH - FRUTA_R * 2) + FRUTA_R,
            y: -FRUTA_R,
            tipo: tipo,
            velocidad: Math.random() * (1 + tiempo / 45) + 1 // Velocidad de caída
        });
    }

    function actualizarJuego() {
        if (pausa) return;

        // Limpiar Canvas
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        // Mover Items y Colisiones
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
            
            // Si el item cae fuera también se elimina
            if (item.y > HEIGHT + FRUTA_R) {
                // Podríamos penalizar si pierdes una fruta, o no hacer nada si pierdes una trampa.
                return false;
            }

            return true;
        });

        // Dibujar
        dibujarCanasta();
        items.forEach(dibujarItem);

        // Generar nuevo item de forma periódica AHORA BASADO EN LA DIFICULTAD!
        const probAparicion = getProbabilidadAparicion();

        if (Math.random() < probAparicion) {
            generarItem();
        }

        // Loop
        animacionFrame = requestAnimationFrame(actualizarJuego);
    }

    // --- Control de Movimiento (Teclado y Mouse) ---
    function manejarMovimiento(e) {
        if (pausa) return;
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            canastaX = Math.max(0, canastaX - 15);
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            canastaX = Math.min(WIDTH - CANASTA_W, canastaX + 15);
        }
    }

    function manejarMovimientoMouse(e) {
        if (pausa) return;

        // Obtiene la posición del canvas con respecto a la ventana
        const rect = canvas.getBoundingClientRect();
        
        // Calcula la posición X del mouse relativa al canvas
        const mouseX = e.clientX - rect.left;

        // Centra la canasta alrededor de la posición del mouse
        canastaX = Math.min(
            WIDTH - CANASTA_W,
            Math.max(0, mouseX - CANASTA_W / 2)
        );
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

    // --- Ciclo de Vida Svelte (Conflicto Resuelto y Carga de Imágenes) ---
    onMount(async () => {
        ctx = canvas.getContext('2d');
        
        // 1. ESPERA A QUE LAS IMÁGENES CARGUEN ANTES DE INICIAR EL JUEGO
        await cargarImagenes(); 
        
        // 2. INICIA LA LÓGICA DEL JUEGO
        iniciarTimer();
        actualizarJuego(); // Inicia el loop del juego

        // 3. AGREGA LISTENERS
        window.addEventListener('keydown', manejarMovimiento); 
        canvas.addEventListener('mousemove', manejarMovimientoMouse);
    });

    onDestroy(() => {
        cancelAnimationFrame(animacionFrame);
        clearInterval(timerInterval);
        
        // Remueve listeners al salir
        window.removeEventListener('keydown', manejarMovimiento);
        canvas.removeEventListener('mousemove', manejarMovimientoMouse);
    });

</script>