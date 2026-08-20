// ==========================================
// CONEXIÓN CON SUPABASE
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
// CONTENEDOR
// ==========================================

const contenido =
    document.getElementById(
        "jugador-contenido"
    );


// ==========================================
// ID DEL JUGADOR
// ==========================================

const parametros =
    new URLSearchParams(
        window.location.search
    );

const jugadorId =
    parametros.get("id");


// ==========================================
// INICIAR
// ==========================================

cargarJugador();


// ==========================================
// CARGAR JUGADOR
// ==========================================

async function cargarJugador() {

    if (!jugadorId) {

        mostrarError(
            "No se encontró el ID del jugador."
        );

        return;
    }


    contenido.innerHTML = `

        <div class="jugador-cargando">

            Cargando información del jugador...

        </div>

    `;


    // ======================================
    // HISTORIAL
    // ======================================

    const {
        data: movimientos,
        error: historialError
    } = await supabaseClient
        .from("mercado_pases")
        .select(`
            api_player_id,
            jugador,
            foto_url,
            fecha,
            tipo,
            club_origen,
            club_origen_id,
            club_destino,
            club_destino_id
        `)
        .eq(
            "api_player_id",
            Number(jugadorId)
        )
        .order(
            "fecha",
            {
                ascending: false
            }
        );


    if (historialError) {

        console.error(
            "ERROR HISTORIAL:",
            historialError
        );

        mostrarError(
            "No se pudo cargar el historial del jugador."
        );

        return;
    }


    if (
        !movimientos ||
        movimientos.length === 0
    ) {

        mostrarError(
            "No encontramos movimientos para este jugador."
        );

        return;
    }


    // ======================================
    // OBTENER TODOS LOS CLUBES DEL HISTORIAL
    // ======================================

    const teamIds = [
        ...new Set(

            movimientos
                .flatMap(
                    movimiento => [

                        movimiento.club_destino_id,

                        movimiento.club_origen_id

                    ]
                )
                .filter(
                    id =>
                        id !== null &&
                        id !== undefined &&
                        Number(id) > 0
                )
                .map(
                    id => Number(id)
                )

        )
    ];


    console.log(
        "CLUBES DEL JUGADOR:",
        teamIds
    );


    // ======================================
    // API-FOOTBALL
    // ======================================

    let perfil = null;

    let errorPerfil = null;


    try {

        console.log(
            "Consultando player-service-v6..."
        );


        const resultado =
            await supabaseClient.functions.invoke(
                "player-service-v6",
                {
                    body: {

                        player_id:
                            Number(jugadorId),

                        team_ids:
                            teamIds

                    }
                }
            );


        console.log(
            "RESPUESTA PLAYER-SERVICE-V6:",
            resultado
        );


        // ==================================
        // ERROR
        // ==================================

        if (
            resultado.error
        ) {

            console.error(
                "ERROR PLAYER-SERVICE-V6:",
                resultado.error
            );


            errorPerfil =
                resultado.error.message ||
                "No se pudo conectar con API-Football.";

        }


        // ==================================
        // RESPUESTA CORRECTA
        // ==================================

        else if (
            resultado.data?.ok &&
            resultado.data?.player
        ) {

            perfil =
                resultado.data.player;


            console.log(
                "PERFIL RECIBIDO:",
                perfil
            );


            console.log(
                "TEMPORADA ELEGIDA:",
                resultado.data.source_season
            );


            console.log(
                "ESTADÍSTICAS:",
                resultado.data.statistics
            );

        }


        // ==================================
        // SIN DATOS
        // ==================================

        else {

            errorPerfil =
                resultado.data?.error ||
                resultado.data?.message ||
                "API-Football no devolvió información.";

        }


    } catch (error) {

        console.error(
            "ERROR API:",
            error
        );


        errorPerfil =
            error instanceof Error
                ? error.message
                : String(error);

    }


    // ======================================
    // MOSTRAR
    // ======================================

    mostrarJugador(
        movimientos[0],
        movimientos,
        perfil,
        errorPerfil
    );

}


// ==========================================
// MOSTRAR JUGADOR
// ==========================================

function mostrarJugador(
    movimientoPrincipal,
    movimientos,
    perfil,
    errorPerfil
) {

    const nombre =
        perfil?.name ||
        movimientoPrincipal.jugador ||
        "Jugador";


    const foto =
        perfil?.photo ||
        movimientoPrincipal.foto_url ||
        null;


    const clubActual =
        movimientoPrincipal.club_destino ||
        movimientoPrincipal.club_origen ||
        "Sin club";


    // ======================================
    // FOTO
    // ======================================

    let fotoHTML = `

        <div class="jugador-header-foto">

            <div class="jugador-header-placeholder">

                F360

            </div>

        </div>

    `;


    if (foto) {

        fotoHTML = `

            <div class="jugador-header-foto">

                <img
                    src="${escapeHTML(foto)}"
                    alt="${escapeHTML(nombre)}"
                >

            </div>

        `;

    }


    // ======================================
    // PERFIL
    // ======================================

    const perfilHTML =
        crearPerfil(
            perfil,
            errorPerfil
        );


    // ======================================
    // ESTADÍSTICAS
    // ======================================

    const estadisticasHTML =
        crearEstadisticas(
            perfil
        );


    // ======================================
    // HISTORIAL
    // ======================================

    const historialHTML =
        movimientos
            .map(
                movimiento =>
                    crearMovimiento(
                        movimiento
                    )
            )
            .join("");


    // ======================================
    // HTML
    // ======================================

    contenido.innerHTML = `

        <section class="jugador-header">


            ${fotoHTML}


            <div class="jugador-header-info">


                <div class="jugador-categoria">

                    JUGADOR

                </div>


                <h1>

                    ${escapeHTML(nombre)}

                </h1>


                <div class="jugador-datos">


                    <div class="dato-jugador">

                        <strong>
                            Club:
                        </strong>

                        ${escapeHTML(
                            clubActual
                        )}

                    </div>


                    <div class="dato-jugador">

                        <strong>
                            Movimientos:
                        </strong>

                        ${movimientos.length}

                    </div>


                    ${
                        perfil?.position
                            ?
                        `

                        <div class="dato-jugador">

                            <strong>
                                Posición:
                            </strong>

                            ${escapeHTML(
                                traducirPosicion(
                                    perfil.position
                                )
                            )}

                        </div>

                        `
                            :
                        ""
                    }


                </div>


            </div>

        </section>


        ${perfilHTML}


        ${estadisticasHTML}


        <h2 class="historial-titulo">

            Historial de movimientos

        </h2>


        <section class="historial">

            ${historialHTML}

        </section>

    `;

}


// ==========================================
// PERFIL
// ==========================================

function crearPerfil(
    perfil,
    errorPerfil
) {

    const nacionalidad =
        perfil?.nationality ||
        "No disponible";


    const edad =
        calcularEdad(
            perfil?.birth?.date
        );


    const nacimiento =
        perfil?.birth?.date
            ?
        formatearFecha(
            perfil.birth.date
        )
            :
        "No disponible";


    const posicion =
        perfil?.position
            ?
        traducirPosicion(
            perfil.position
        )
            :
        "No disponible";


    const altura =
        perfil?.height ||
        "No disponible";


    const peso =
        perfil?.weight ||
        "No disponible";


    let aviso = "";


    if (errorPerfil) {

        aviso = `

            <div class="perfil-aviso">

                <strong>
                    API-FOOTBALL
                </strong>

                No se pudieron cargar
                todos los datos externos.

                <small>

                    ${escapeHTML(
                        errorPerfil
                    )}

                </small>

            </div>

        `;

    }


    return `

        <section class="perfil-jugador">


            <div class="perfil-titulo">

                PERFIL DEL JUGADOR

            </div>


            ${aviso}


            <div class="perfil-grid">


                <div class="perfil-dato">

                    <span>
                        Nacionalidad
                    </span>

                    <strong>

                        ${escapeHTML(
                            nacionalidad
                        )}

                    </strong>

                </div>


                <div class="perfil-dato">

                    <span>
                        Edad
                    </span>

                    <strong>

                        ${escapeHTML(
                            edad
                        )}

                    </strong>

                </div>


                <div class="perfil-dato">

                    <span>
                        Fecha de nacimiento
                    </span>

                    <strong>

                        ${escapeHTML(
                            nacimiento
                        )}

                    </strong>

                </div>


                <div class="perfil-dato">

                    <span>
                        Posición
                    </span>

                    <strong>

                        ${escapeHTML(
                            posicion
                        )}

                    </strong>

                </div>


                <div class="perfil-dato">

                    <span>
                        Altura
                    </span>

                    <strong>

                        ${escapeHTML(
                            altura
                        )}

                    </strong>

                </div>


                <div class="perfil-dato">

                    <span>
                        Peso
                    </span>

                    <strong>

                        ${escapeHTML(
                            peso
                        )}

                    </strong>

                </div>


            </div>


        </section>

    `;

}


// ==========================================
// CALCULAR EDAD
// ==========================================

function calcularEdad(
    fechaNacimiento
) {

    if (!fechaNacimiento) {

        return "No disponible";

    }


    const nacimiento =
        new Date(
            `${fechaNacimiento}T00:00:00`
        );


    if (
        Number.isNaN(
            nacimiento.getTime()
        )
    ) {

        return "No disponible";

    }


    const hoy =
        new Date();


    let edad =
        hoy.getFullYear() -
        nacimiento.getFullYear();


    const mes =
        hoy.getMonth() -
        nacimiento.getMonth();


    if (
        mes < 0 ||
        (
            mes === 0 &&
            hoy.getDate() <
            nacimiento.getDate()
        )
    ) {

        edad--;

    }


    return `${edad} años`;

}


// ==========================================
// ESTADÍSTICAS
// ==========================================

function crearEstadisticas(
    perfil
) {

    if (!perfil) {

        return "";

    }


    const liga =
        perfil.league?.name ||
        "Sin competición";


    return `

        <section class="estadisticas-jugador">


            <div class="estadisticas-cabecera">


                <div>

                    <div class="estadisticas-label">

                        TEMPORADA
                        ${escapeHTML(
                            perfil.statisticsSeason ||
                            "2026"
                        )}

                    </div>


                    <h2>

                        Estadísticas

                    </h2>

                </div>


                <div class="liga-estadisticas">

                    ${escapeHTML(
                        liga
                    )}

                </div>


            </div>


            <div class="estadisticas-grid">


                ${crearEstadistica(
                    "Partidos",
                    perfil.appearances ?? 0
                )}


                ${crearEstadistica(
                    "Titular",
                    perfil.lineups ?? 0
                )}


                ${crearEstadistica(
                    "Minutos",
                    perfil.minutes ?? 0
                )}


                ${crearEstadistica(
                    "Goles",
                    perfil.goals ?? 0
                )}


                ${crearEstadistica(
                    "Asistencias",
                    perfil.assists ?? 0
                )}


                ${crearEstadistica(
                    "Tiros",
                    perfil.shots ?? 0
                )}


                ${crearEstadistica(
                    "Tiros al arco",
                    perfil.shotsOnTarget ?? 0
                )}


                ${crearEstadistica(
                    "Pases",
                    perfil.passes ?? 0
                )}


                ${crearEstadistica(
                    "Precisión de pase",
                    perfil.passAccuracy
                        ? `${perfil.passAccuracy}%`
                        : "0%"
                )}


                ${crearEstadistica(
                    "Entradas",
                    perfil.tackles ?? 0
                )}


                ${crearEstadistica(
                    "Intercepciones",
                    perfil.interceptions ?? 0
                )}


                ${crearEstadistica(
                    "Amarillas",
                    perfil.yellowCards ?? 0
                )}


                ${crearEstadistica(
                    "Rojas",
                    perfil.redCards ?? 0
                )}


                ${crearEstadistica(
                    "Rating",
                    perfil.rating || "—"
                )}


            </div>


        </section>

    `;

}


// ==========================================
// ESTADÍSTICA
// ==========================================

function crearEstadistica(
    nombre,
    valor
) {

    return `

        <div class="estadistica">

            <span>

                ${escapeHTML(
                    nombre
                )}

            </span>


            <strong>

                ${escapeHTML(
                    valor
                )}

            </strong>

        </div>

    `;

}


// ==========================================
// POSICIÓN
// ==========================================

function traducirPosicion(
    posicion
) {

    const posiciones = {

        "Goalkeeper":
            "Arquero",

        "Defender":
            "Defensor",

        "Midfielder":
            "Mediocampista",

        "Attacker":
            "Delantero"

    };


    return (
        posiciones[posicion] ||
        posicion
    );

}


// ==========================================
// MOVIMIENTO
// ==========================================

function crearMovimiento(
    movimiento
) {

    const origen =
        movimiento.club_origen ||
        "Libre";


    const destino =
        movimiento.club_destino ||
        "Sin destino";


    const tipo =
        movimiento.tipo ||
        "TRANSFER";


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


    return `

        <article class="movimiento-jugador">


            <div class="movimiento-ruta">


                <div class="club-jugador">

                    ${escudoOrigen}


                    <span>

                        ${escapeHTML(
                            origen
                        )}

                    </span>

                </div>


                <div class="flecha-jugador">

                    →

                </div>


                <div class="club-jugador">

                    ${escudoDestino}


                    <span>

                        ${escapeHTML(
                            destino
                        )}

                    </span>

                </div>


            </div>


            <div class="movimiento-meta">


                <div class="tipo-jugador">

                    ${escapeHTML(
                        tipo
                    )}

                </div>


                <div class="fecha-jugador">

                    ${formatearFecha(
                        movimiento.fecha
                    )}

                </div>


            </div>


        </article>

    `;

}


// ==========================================
// ESCUDO
// ==========================================

function crearEscudo(
    id,
    nombre
) {

    if (!id) {

        return `

            <div class="escudo-vacio">

                ⚽

            </div>

        `;

    }


    return `

        <img
            src="https://media.api-sports.io/football/teams/${id}.png"
            alt="${escapeHTML(nombre)}"
            loading="lazy"
        >

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
        String(fecha).split("-");


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
// ERROR
// ==========================================

function mostrarError(
    mensaje
) {

    contenido.innerHTML = `

        <div class="jugador-error">

            ${escapeHTML(
                mensaje
            )}

            <br>
            <br>

            <a
                href="mercado.html"
                class="volver-mercado"
            >

                ← VOLVER AL MERCADO

            </a>

        </div>

    `;

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


    return String(texto)

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