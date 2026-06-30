const canvas = document.getElementById("canvasJuego");
const ctx = canvas.getContext("2d");

// 1. Objeto para rastrear qué teclas están presionadas
const teclas = {
    ArrowUp: false,
    ArrowLeft: false,
    ArrowRight: false,
    " ": false // barra espaciadora
};

//Menu de inicio
let estadoJuego = "MENU";
const botonPlay = {
    x: 325,
    y: 350,
    ancho: 150,
    alto: 50,
};

function iniciarPartida() {
    // 1. Mandamos la nave al centro de la pantalla
    nave.x = canvas.width / 2;
    nave.y = canvas.height / 2;
    nave.vx = 0;
    nave.vy = 0;
    nave.angulo = 0;

    // 2. Vaciamos los arreglos para que no haya cosas de la partida anterior
    laseres = [];
    // asteroides = []; // Si tienes un arreglo de asteroides, vacíalo aquí también
    
    // 3. Cambiamos el estado para que el bucle principal dibuje el juego
    estadoJuego = "JUGANDO";
}

// 2. CONFIGURACIÓN DE LA NAVE CON FÍSICA ESPACIAL
let nave = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    angulo: 0,        // En radianes. 0 significa apuntando a la derecha.
    rotacion: 0.05,   // Qué tan rápido va a girar
    vx: 0,            // Velocidad en el eje X
    vy: 0,            // Velocidad en el eje Y
    empuje: 0.15,     // Qué tanta potencia tiene el motor
    friccion: 0.99    // Para que se vaya frenando poco a poco en el espacio
};
let laseres = [];
let asteroides = [];
let score = 0;
let vidas = 3;

function dibujarPantallaInicio() {
    // Pintamos el fondo negro del menú
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Título principal: BLAST-RAID
    ctx.fillStyle = "#00ffcc"; // Cian neón
    ctx.font = "bold 45px 'Courier New', Courier, monospace";
    ctx.textAlign = "center";
    ctx.fillText("BLAST-RAID", canvas.width / 2, 220);

    // Subtítulo
    ctx.fillStyle = "white";
    ctx.font = "16px 'Courier New', Courier, monospace";
    ctx.fillText("DESTROZA LAS ROCAS Y ALIENÍGENAS", canvas.width / 2, 280);

    // Dibujar el botón amarillo de PLAY
    ctx.fillStyle = "#ffcc00"; 
    ctx.fillRect(botonPlay.x, botonPlay.y, botonPlay.ancho, botonPlay.alto);

    // Texto del botón
    ctx.fillStyle = "black";
    ctx.font = "bold 22px 'Courier New', Courier, monospace";
    ctx.fillText("PLAY", canvas.width / 2, botonPlay.y + 33);
}

// Función para crear un asteroide aleatorio
function crearAsteroide() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 3, // Velocidad aleatoria en X
        vy: (Math.random() - 0.5) * 3, // Velocidad aleatoria en Y
        radio: 30 // Tamaño del asteroide
    };
}

// Generamos 5 asteroides para empezar la partida
for (let i = 0; i < 5; i++) {
    asteroides.push(crearAsteroide());
}
let canShoot = true;

// 3. Escuchadores de eventos para el teclado
window.addEventListener("keydown", (evento) => {
    if (evento.key in teclas) {
        teclas[evento.key] = true;
    }
});

window.addEventListener("keyup", (evento) => {
    if (evento.key in teclas) {
        teclas[evento.key] = false;}
});
// --- CONFIGURACIÓN DE CONTROLES TÁCTILES REFORZADA ---
const btnIzq = document.getElementById("btn-izq");
const btnArriba = document.getElementById("btn-arriba");
const btnDer = document.getElementById("btn-der");
const btnDisparo = document.getElementById("btn-disparo");

// Función para asignar eventos dobles (Celular y Mouse)
function activarBoton(boton, teclaPropiedad) {
    // Para celular
    boton.addEventListener("touchstart", (e) => { e.preventDefault(); teclas[teclaPropiedad] = true; });
    boton.addEventListener("touchend", (e) => { e.preventDefault(); teclas[teclaPropiedad] = false; });
    // Por si acaso estás probando en modo responsivo en compu o navegadores raros
    boton.addEventListener("mousedown", (e) => { teclas[teclaPropiedad] = true; });
    boton.addEventListener("mouseup", (e) => { teclas[teclaPropiedad] = false; });
}

// Los vinculamos a las variables que ya lee tu física
activarBoton(btnIzq, "ArrowLeft");
activarBoton(btnDer, "ArrowRight");
activarBoton(btnArriba, "ArrowUp");
activarBoton(btnDisparo, " ");

// Bucle principal del juego (Se ejecuta 60 veces por segundo)
function actualizarJuego() {
    // A. Limpiar la pantalla
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Evaluamos en que pantalla estamos
    if (estadoJuego === "MENU") {
        //Lamamos a la uncion que pinta el titulo y el boton de play
        dibujarPantallaInicio();

    } else if(estadoJuego === "JUGANDO") 

    // B. ACTUALIZAR LÓGICA DE MOVIMIENTO Y ROTACIÓN
    if (teclas.ArrowLeft) {
        nave.angulo -= nave.rotacion; // Gira a la izquierda
    }
    if (teclas.ArrowRight) {
        nave.angulo += nave.rotacion; // Gira a la derecha
    }

    if (teclas.ArrowUp) {
        // Acelerar hacia adelante usando trigonometría (Seno y Coseno)
        nave.vx += Math.cos(nave.angulo) * nave.empuje;
        nave.vy += Math.sin(nave.angulo) * nave.empuje;
    }

    // Aplicar fricción para que no se deslice infinitamente
    nave.vx *= nave.friccion;
    nave.vy *= nave.friccion;

    // Actualizar la posición de la nave sumando la velocidad
    nave.x += nave.vx;
    nave.y += nave.vy;

    // --- LÓGICA DE ASTEROIDES ---
    asteroides.forEach((ast) => {
        ast.x += ast.vx;
        ast.y += ast.vy;

        // Pantalla infinita para los asteroides
        if (ast.x > canvas.width + ast.radio) ast.x = -ast.radio;
        else if (ast.x < -ast.radio) ast.x = canvas.width + ast.radio;

        if (ast.y > canvas.height + ast.radio) ast.y = -ast.radio;
        else if (ast.y < -ast.radio) ast.y = canvas.height + ast.radio;
    });
    // --- DETECCIÓN DE COLISIONES (LÁSER VS ASTEROIDE) ---
    // Usamos bucles invertidos (de atrás para adelante) para poder borrar objetos sin romper el conteo
    for (let i = laseres.length - 1; i >= 0; i--) {
        for (let j = asteroides.length - 1; j >= 0; j--) {
            let l = laseres[i];
            let ast = asteroides[j];

            // Teorema de Pitágoras para calcular la distancia entre el láser y el asteroide
            let dx = l.x - ast.x;
            let dy = l.y - ast.y;
            let distancia = Math.sqrt(dx * dx + dy * dy);

            // ¡Hubo impacto!
            if (distancia < ast.radio) {
                // 1. Borramos el láser y el asteroide que chocaron
                laseres.splice(i, 1);
                asteroides.splice(j, 1);
                score += 10; 

                // 2. Si el asteroide era grande, lo dividimos en 2 más chicos
                if (ast.radio > 15) {
                    for (let k = 0; k < 2; k++) {
                        asteroides.push({x: ast.x,
                            y: ast.y,
                            vx: (Math.random() - 0.5) * 4,
                            vy: (Math.random() - 0.5) * 4,
                            radio: ast.radio / 2 // La mitad de tamaño
                        });
                    }
                }
                
                // Salimos del bucle del asteroide porque este láser ya no existe
                break; 
            }
        }
    }

    // --- DETECCIÓN DE COLISIONES (ASTEROIDE VS NAVE) ---
    asteroides.forEach((ast) => {
        let dx = nave.x - ast.x;
        let dy = nave.y - ast.y;
        let distancia = Math.sqrt(dx * dx + dy * dy);

        if (distancia < ast.radio + 10) { 
            vidas--; // Te quitamos una vida

            // Regresamos la nave al centro a salvo
            nave.x = canvas.width / 2;
            nave.y = canvas.height / 2;
            nave.vx = 0;
            nave.vy = 0;
            nave.angulo = 0;

            // Si ya no te quedan vidas... ¡GAME OVER!
            if (vidas <= 0) {
                alert("¡GAME OVER! Conseguiste " + score + " puntos.");
                // Reiniciamos todo a los valores iniciales
                score = 0;
                vidas = 3;
                asteroides = [];
                for (let i = 0; i < 5; i++) {
                    asteroides.push(crearAsteroide());
                }
            }
        }
    });

    // EFECTO PANTALLA INFINITA (SCREEN WRAPPING)
    if (nave.x > canvas.width) {
        nave.x = 0;} else if (nave.x < 0) {
        nave.x = canvas.width;
    }

    if (nave.y > canvas.height) {
        nave.y = 0;
    } else if (nave.y < 0) {
        nave.y = canvas.height;
    }
    // --- LÓGICA DE DISPAROS ---
    
    // Si presiona espacio y puede disparar, creamos un láser
    if (teclas[" "] && canShoot) {
        laseres.push({
            x: nave.x + Math.cos(nave.angulo) * 15, // Sale de la punta de la nave
            y: nave.y + Math.sin(nave.angulo) * 15,
            vx: Math.cos(nave.angulo) * 7,          // Velocidad del láser en X
            vy: Math.sin(nave.angulo) * 7,          // Velocidad del láser en Y
            vida: 60                                // Cuántos frames va a durar vivo
        });
        canShoot = false; // Bloqueamos el disparo hasta que suelte la tecla o pase un tiempo
        
        // Cooldown para no disparar tan rápido (200 milisegundos)
        setTimeout(() => { canShoot = true; }, 200);
    }

    // Mover los láseres y borrar los que ya estén viejos
    for (let i = laseres.length - 1; i >= 0; i--) {
        let l = laseres[i];
        l.x += l.vx;
        l.y += l.vy;
        l.vida--;// Si el láser se sale de la pantalla o se le acaba la vida, lo borramos de la lista
        if (l.vida <= 0 || l.x < 0 || l.x > canvas.width || l.y < 0 || l.y > canvas.height) {
            laseres.splice(i, 1);
        }
    }

    // C. RENDERIZAR (Dibujar la nave triangular rotada)
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    ctx.save(); // Guarda el estado limpio del lienzo
    ctx.translate(nave.x, nave.y); // Mueve el centro del lienzo a donde está la nave
    ctx.rotate(nave.angulo); // Rota el lienzo según el ángulo

    // Dibuja las líneas del triángulo
    ctx.beginPath();
    ctx.moveTo(15, 0);       // Punta de la nave
    ctx.lineTo(-10, -10);    // Esquina trasera izquierda
    ctx.lineTo(-10, 10);     // Esquina trasera derecha
    ctx.closePath();         // Cierra el triángulo regresando a la punta
    ctx.stroke();            // Pinta el contorno blanco

    ctx.restore(); // Restaura el lienzo para el siguiente frame// Volver a llamar a esta función en el próximo cuadro
    // Dibujar los láseres
    ctx.fillStyle = "white";
    laseres.forEach((l) => {
        ctx.beginPath();
        ctx.arc(l.x, l.y, 2, 0, Math.PI * 2); // Un círculo chiquito de radio 2
        ctx.fill();
    });
    // Dibujar los asteroides
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    asteroides.forEach((ast) => {
        ctx.beginPath();
        ctx.arc(ast.x, ast.y, ast.radio, 0, Math.PI * 2);
        ctx.stroke();
    });
    // Score y vidas
    ctx.fillStyle = "white";
    ctx.font = "20 px 'Courier New'";
    ctx.fillText("SCORE: " + score, 20, 30);
    ctx.fillText("VIDAS: " + vidas, 20, 60);
   requestAnimationFrame(actualizarJuego);
}

// Función para verificar si la coordenada del clic está dentro del botón amarillo
function verificarClicBoton(clickX, clickY) {
    if (clickX >= botonPlay.x && clickX <= botonPlay.x + botonPlay.ancho &&
        clickY >= botonPlay.y && clickY <= botonPlay.y + botonPlay.alto) {
        
        // Si le atinó al botón, iniciamos la partida
        iniciarPartida();
    }
}
// ─── EVENTO PARA MOUSE (PC) ──────────────────────────────────────────
canvas.addEventListener("click", function(evento) {
    if (estadoJuego === "MENU") {
        const rect = canvas.getBoundingClientRect();
        
        // FÓRMULA MÁGICA DE ESCALADO:
        // Convierte el clic físico a la coordenada interna de tu canvas (800x600)
        const mouseX = (evento.clientX - rect.left) * (canvas.width / rect.width);
        const mouseY = (evento.clientY - rect.top) * (canvas.height / rect.height);
        
        verificarClicBoton(mouseX, mouseY);
    }
});

// ─── EVENTO PARA PANTALLA TÁCTIL (CELULAR) ───────────────────────────
canvas.addEventListener("touchstart", function(evento) {
    if (estadoJuego === "MENU") {
        const rect = canvas.getBoundingClientRect();
// FÓRMULA MÁGICA DE ESCALADO PARA TOUCH:
        const touchX = (evento.touches[0].clientX - rect.left) * (canvas.width / rect.width);
        const touchY = (evento.touches[0].clientY - rect.top) * (canvas.height / rect.height);
        
        verificarClicBoton(touchX, touchY);
    }
});        
// Arrancar el motor del juego por primera vez
requestAnimationFrame(actualizarJuego);
