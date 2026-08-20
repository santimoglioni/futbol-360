// ==========================================
// CONEXIÓN SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://sxouqngithkiflbhdcii.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_izftRBeVdu2h_AKkfhaGOA_XJpY1PKH";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// ELEMENTOS
// ==========================================

const filtrosContainer =
    document.getElementById(
        "filtros-mercado"
    );

const mercadoLista =
    document.getElementById(
        "mercado-lista"
    );


// ==========================================
// VARIABLES
// ==========================================

let equipos = [];

let equipoSeleccionado =
    "todos";

let tipoSeleccionado =
    "todos";


// ==========================================
// CARGAR EQUIPOS
// ==========================================

async function cargarEquipos() {

    filtrosContainer.innerHTML = `
        <div class="cargando-filtros">
            Cargando escudos...
        </div>
    `;

    const {
        data,
        error
    } =
        await supabaseClient
            .from("equipos")
            .select(`
                id,
                nombre,
                nombre_api,
                api_team_id,
                logo_url
            `)
            .order(
                "nombre",
                {
                    ascending: true
                }
            );

    if (error) {

        console.error(
            "Error cargando equipos:",
            error
        );

        filtrosContainer.innerHTML = `
            <div class="error-mercado">
                No se pudieron cargar los equipos.
            </div>
        `;

        return;
    }

    equipos =
        data || [];

    crearFiltrosEquipos();
}


// ==========================================
// CREAR FILTROS DE EQUIPOS
// ==========================================

function crearFiltrosEquipos() {

    filtrosContainer.innerHTML = "";


    // ======================================
    // TODOS
    // ======================================

    const botonTodos =
        document.createElement(
            "button"
        );

    botonTodos.type =
        "button";

    botonTodos.className =
        "filtro-equipo filtro-todos activo";

    botonTodos.textContent =
        "TODOS";

    filtrosContainer.appendChild(
        botonTodos
    );


    botonTodos.addEventListener(
        "click",
        function() {

            equipoSeleccionado =
                "todos";

            document
                .querySelectorAll(
                    ".filtro-equipo"
                )
                .forEach(
                    function(
                        boton
                    ) {

                        boton.classList.remove(
                            "activo"
                        );

                    }
                );

            botonTodos.classList.add(
                "activo"
            );

            cargarMercado();

        }
    );


    // ======================================
    // CLUBES
    // ======================================

    equipos.forEach(
        function(equipo) {

            const boton =
                document.createElement(
                    "button"
                );

            boton.type =
                "button";

            boton.className =
                "filtro-equipo";

            boton.title =
                equipo.nombre;


            const imagen =
                document.createElement(
                    "img"
                );

            imagen.className =
                "logo-filtro";

            imagen.alt =
                equipo.nombre;

            imagen.loading =
                "lazy";

            imagen.src =
                equipo.logo_url ||
                `https://media.api-sports.io/football/teams/${equipo.api_team_id}.png`;


            imagen.onerror =
                function() {

                    this.remove();

                    boton.textContent =
                        obtenerIniciales(
                            equipo.nombre
                        );

                };


            boton.appendChild(
                imagen
            );

            filtrosContainer.appendChild(
                boton
            );


            boton.addEventListener(
                "click",
                function() {

                    equipoSeleccionado =
                        equipo.nombre;


                    document
                        .querySelectorAll(
                            ".filtro-equipo"
                        )
                        .forEach(
                            function(
                                elemento
                            ) {

                                elemento.classList.remove(
                                    "activo"
                                );

                            }
                        );


                    boton.classList.add(
                        "activo"
                    );


                    cargarMercado();

                }
            );

        }
    );

}


// ==========================================
// CARGAR MERCADO
// ==========================================

async function cargarMercado() {

    mercadoLista.innerHTML = `
        <div class="cargando-mercado">
            Cargando mercado de pases...
        </div>
    `;


    let consulta =
        supabaseClient
            .from("mercado_pases")
            .select(`
                id,
                api_player_id,
                jugador,
                foto_url,
                fecha,
                tipo,
                club_origen,
                club_origen_id,
                club_destino,
                club_destino_id,
                fuente
            `)
            .gte(
                "fecha",
                "2026-01-01"
            )
            .lte(
                "fecha",
                "2026-12-31"
            )
            .order(
                "fecha",
                {
                    ascending: false
                }
            );


    // ======================================
    // FILTRO CLUB
    // ======================================

    if (
        equipoSeleccionado !==
        "todos"
    ) {

        consulta =
            consulta.or(
                `club_origen.eq.${equipoSeleccionado},club_destino.eq.${equipoSeleccionado}`
            );

    }


    const {
        data,
        error
    } =
        await consulta;


    if (error) {

        console.error(
            "Error cargando mercado:",
            error
        );

        mercadoLista.innerHTML = `
            <div class="error-mercado">
                No se pudo cargar el mercado de pases.
            </div>
        `;

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        mercadoLista.innerHTML = `
            <div class="sin-mercado">
                No hay movimientos registrados.
            </div>
        `;

        return;
    }


    mercadoLista.innerHTML = "";


    let cantidad =
        0;


    data.forEach(
        function(movimiento) {

            const tipo =
                obtenerTipoMovimiento(
                    movimiento
                );


            if (
                tipoSeleccionado !==
                    "todos" &&
                tipo.clave !==
                    tipoSeleccionado
            ) {

                return;

            }


            const tarjeta =
                crearTarjeta(
                    movimiento,
                    tipo
                );


            mercadoLista.appendChild(
                tarjeta
            );


            cantidad++;

        }
    );


    if (
        cantidad === 0
    ) {

        mercadoLista.innerHTML = `
            <div class="sin-mercado">
                No hay movimientos de este tipo.
            </div>
        `;

    }

}


// ==========================================
// TIPO DE MOVIMIENTO
// ==========================================

function obtenerTipoMovimiento(
    movimiento
) {

    const tipoOriginal =
        String(
            movimiento.tipo || ""
        )
        .toLowerCase()
        .trim();


    if (
        tipoOriginal.includes("loan") ||
        tipoOriginal.includes("prestamo") ||
        tipoOriginal.includes("préstamo")
    ) {

        return {
            clave: "prestamo",
            nombre: "PRÉSTAMO",
            clase: "tipo-prestamo"
        };

    }


    if (
        tipoOriginal.includes("free") ||
        tipoOriginal.includes("libre")
    ) {

        return {
            clave: "libre",
            nombre: "LIBRE",
            clase: "tipo-libre"
        };

    }


    if (
        equipoSeleccionado !==
            "todos" &&
        normalizarClub(
            movimiento.club_origen
        ) ===
        normalizarClub(
            equipoSeleccionado
        )
    ) {

        return {
            clave: "baja",
            nombre: "BAJA",
            clase: "tipo-baja"
        };

    }


    if (
        equipoSeleccionado !==
            "todos" &&
        normalizarClub(
            movimiento.club_destino
        ) ===
        normalizarClub(
            equipoSeleccionado
        )
    ) {

        return {
            clave: "alta",
            nombre: "ALTA",
            clase: "tipo-alta"
        };

    }


    return {
        clave: "transfer",
        nombre: "TRANSFER",
        clase: "tipo-transfer"
    };

}


// ==========================================
// CREAR TARJETA
// ==========================================

function crearTarjeta(
    movimiento,
    tipo
) {

    const tarjeta =
        document.createElement(
            "article"
        );

    tarjeta.className =
        "transferencia";


    const jugador =
        movimiento.jugador ||
        "Jugador";


    const origen =
        movimiento.club_origen ||
        "Libre";


    const destino =
        movimiento.club_destino ||
        "Sin destino";


    // ======================================
    // FOTO
    // ======================================

    let fotoHTML = `
        <div class="jugador-foto">

            <div class="foto-jugador-placeholder">
                F360
            </div>

        </div>
    `;


    if (
        movimiento.foto_url
    ) {

        fotoHTML = `
            <div class="jugador-foto">

                <img
                    src="${escapeHTML(
                        movimiento.foto_url
                    )}"
                    alt="${escapeHTML(
                        jugador
                    )}"
                    class="foto-jugador"
                    loading="lazy"
                >

            </div>
        `;

    }


    // ======================================
    // ESCUDOS
    // ======================================

    const escudoOrigen =
        crearEscudo(
            movimiento.club_origen_id,
            origen
        );


    const escudoDestino =
        crearEscudo(
            movimiento.club_destino_id,
            destino
        );


    // ======================================
    // EQUIPO PRINCIPAL
    // ======================================

    let equipoPrincipal =
        destino;


    if (
        equipoSeleccionado !==
        "todos"
    ) {

        equipoPrincipal =
            equipoSeleccionado;

    }


    // ======================================
    // TARJETA
    // ======================================

    tarjeta.innerHTML = `

        <div class="jugador-info">

            ${fotoHTML}


            <div class="jugador-datos">

                <div class="transferencia-equipo">

                    ${escapeHTML(
                        equipoPrincipal
                    )}

                </div>


                <h2 class="jugador-link">

                    <a
                        href="jugador.html?id=${encodeURIComponent(
                            movimiento.api_player_id
                        )}"
                    >

                        ${escapeHTML(
                            jugador
                        )}

                    </a>

                </h2>


                <div class="ruta-transferencia">

                    <div class="club-transferencia">

                        ${escudoOrigen}

                        <span>

                            ${escapeHTML(
                                origen
                            )}

                        </span>

                    </div>


                    <div class="flecha-transferencia">

                        →

                    </div>


                    <div class="club-transferencia">

                        ${escudoDestino}

                        <span>

                            ${escapeHTML(
                                destino
                            )}

                        </span>

                    </div>

                </div>

            </div>

        </div>


        <div class="transferencia-info">

            <span
                class="tipo-movimiento ${tipo.clase}"
            >

                ${tipo.nombre}

            </span>


            <div class="fecha-transferencia">

                ${formatearFecha(
                    movimiento.fecha
                )}

            </div>

        </div>

    `;


    return tarjeta;

}


// ==========================================
// ESCUDO
// ==========================================

function crearEscudo(
    clubId,
    clubNombre
) {

    if (!clubId) {

        return `
            <div class="escudo-contenedor">

                <div class="escudo-placeholder">
                    ⚽
                </div>

            </div>
        `;

    }


    return `
        <div class="escudo-contenedor">

            <img
                src="https://media.api-sports.io/football/teams/${clubId}.png"
                alt="${escapeHTML(
                    clubNombre
                )}"
                class="escudo-club"
                loading="lazy"
            >

        </div>
    `;

}


// ==========================================
// FECHA
// ==========================================

function formatearFecha(
    fecha
) {

    if (!fecha) {

        return "Fecha desconocida";

    }


    const partes =
        String(
            fecha
        ).split("-");


    if (
        partes.length === 3
    ) {

        return (
            partes[2] +
            "/" +
            partes[1] +
            "/" +
            partes[0]
        );

    }


    return fecha;

}


// ==========================================
// NORMALIZAR
// ==========================================

function normalizarClub(
    texto
) {

    return String(
        texto || ""
    )
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
        /[\u0300-\u036f]/g,
        ""
    )
    .replace(
        /[^a-z0-9]/g,
        "");

}


// ==========================================
// INICIALES
// ==========================================

function obtenerIniciales(
    nombre
) {

    const palabras =
        String(
            nombre
        )
        .trim()
        .split(/\s+/);


    if (
        palabras.length === 1
    ) {

        return palabras[0]
            .substring(
                0,
                3
            )
            .toUpperCase();

    }


    return palabras
        .slice(
            0,
            2
        )
        .map(
            function(
                palabra
            ) {

                return palabra[0];

            }
        )
        .join("")
        .toUpperCase();

}


// ==========================================
// ESCAPAR HTML
// ==========================================

function escapeHTML(
    texto
) {

    if (
        texto === null ||
        texto === undefined
    ) {

        return "";

    }


    return String(
        texto
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


// ==========================================
// FILTROS DE TIPO
// ==========================================

function configurarFiltrosTipo() {

    const botones =
        document.querySelectorAll(
            ".filtro-tipo"
        );


    botones.forEach(
        function(boton) {

            boton.addEventListener(
                "click",
                function() {

                    botones.forEach(
                        function(
                            otro
                        ) {

                            otro.classList.remove(
                                "activo"
                            );

                        }
                    );


                    boton.classList.add(
                        "activo"
                    );


                    tipoSeleccionado =
                        boton.dataset.tipo ||
                        "todos";


                    cargarMercado();

                }
            );

        }
    );

}


// ==========================================
// INICIAR
// ==========================================

configurarFiltrosTipo();

cargarEquipos();

cargarMercado();