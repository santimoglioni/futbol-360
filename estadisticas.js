// ==========================================
// F360 - ESTADÍSTICAS
// ==========================================


// ==========================================
// SUPABASE
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
// ELEMENTO PRINCIPAL
// ==========================================

const app =
    document.getElementById(
        "app"
    );


// ==========================================
// INICIAR
// ==========================================

comprobarAcceso();


// ==========================================
// COMPROBAR ACCESO
// ==========================================

async function comprobarAcceso() {

    const {
        data: {
            session
        }
    } =
        await supabaseClient.auth.getSession();


    // --------------------------------------
    // SIN SESIÓN
    // --------------------------------------

    if (!session) {

        mostrarLogin();

        return;
    }


    // --------------------------------------
    // COMPROBAR ADMIN
    // --------------------------------------

    const {
        data: esAdmin,
        error
    } =
        await supabaseClient.rpc(
            "es_admin"
        );


    if (
        error ||
        !esAdmin
    ) {

        mostrarNoAutorizado();

        return;
    }


    // --------------------------------------
    // CARGAR ESTADÍSTICAS
    // --------------------------------------

    cargarEstadisticas(
        session.user
    );
}


// ==========================================
// LOGIN
// ==========================================

function mostrarLogin() {

    app.innerHTML = `

        <section class="login">

            <div class="login-box">

                <div class="logo">

                    <span>F</span>360

                </div>


                <h1>
                    Estadísticas F360
                </h1>


                <p>
                    Iniciá sesión para acceder.
                </p>


                <form
                    id="login-form"
                >

                    <label>
                        Correo electrónico
                    </label>


                    <input
                        type="email"
                        id="email"
                        required
                    >


                    <label>
                        Contraseña
                    </label>


                    <input
                        type="password"
                        id="password"
                        required
                    >


                    <button
                        type="submit"
                    >

                        INICIAR SESIÓN

                    </button>


                    <p
                        id="login-message"
                    ></p>

                </form>

            </div>

        </section>

    `;


    document
        .getElementById(
            "login-form"
        )
        .addEventListener(
            "submit",
            iniciarSesion
        );
}


// ==========================================
// INICIAR SESIÓN
// ==========================================

async function iniciarSesion(
    event
) {

    event.preventDefault();


    const email =
        document
            .getElementById(
                "email"
            )
            .value
            .trim();


    const password =
        document
            .getElementById(
                "password"
            )
            .value;


    const mensaje =
        document.getElementById(
            "login-message"
        );


    mensaje.textContent =
        "Iniciando sesión...";


    const {
        data,
        error
    } =
        await supabaseClient.auth
            .signInWithPassword({

                email:
                    email,

                password:
                    password

            });


    if (error) {

        mensaje.textContent =
            "No se pudo iniciar sesión.";

        console.error(
            error
        );

        return;
    }


    // Comprobar nuevamente
    // que sea administrador.

    const {
        data: esAdmin
    } =
        await supabaseClient.rpc(
            "es_admin"
        );


    if (!esAdmin) {

        await supabaseClient.auth
            .signOut();


        mensaje.textContent =
            "No tenés permisos para ver estas estadísticas.";

        return;
    }


    cargarEstadisticas(
        data.user
    );
}


// ==========================================
// CARGAR ESTADÍSTICAS
// ==========================================

async function cargarEstadisticas(
    user
) {

    app.innerHTML = `

        <div class="dashboard">

            <header class="dashboard-header">

                <div>

                    <div class="logo">

                        <span>F</span>360

                    </div>

                    <p>
                        PANEL DE ESTADÍSTICAS
                    </p>

                </div>


                <div class="usuario">

                    <span>
                        ${escapeHTML(
                            user.email
                        )}
                    </span>


                    <button
                        id="logout"
                    >

                        CERRAR SESIÓN

                    </button>

                </div>

            </header>


            <div
                id="estadisticas-contenido"
            >

                <div class="cargando">

                    Cargando datos...

                </div>

            </div>

        </div>

    `;


    document
        .getElementById(
            "logout"
        )
        .addEventListener(
            "click",
            cerrarSesion
        );


    const {
        data,
        error
    } =
        await supabaseClient.rpc(
            "obtener_estadisticas_f360"
        );


    if (error) {

        console.error(
            error
        );


        document
            .getElementById(
                "estadisticas-contenido"
            )
            .innerHTML = `

                <div class="error">

                    No se pudieron cargar
                    las estadísticas.

                </div>

            `;

        return;
    }


    mostrarEstadisticas(
        data
    );
}


// ==========================================
// MOSTRAR ESTADÍSTICAS
// ==========================================

function mostrarEstadisticas(
    datos
) {

    const contenedor =
        document.getElementById(
            "estadisticas-contenido"
        );


    const visitasTotales =
        Number(
            datos.visitas_totales || 0
        );


    const visitasHoy =
        Number(
            datos.visitas_hoy || 0
        );


    const noticiasPublicadas =
        Number(
            datos.noticias_publicadas || 0
        );


    const noticias =
        datos.noticias_mas_vistas || [];


    const visitasDias =
        datos.visitas_ultimos_7_dias || [];


    contenedor.innerHTML = `

        <!-- =================================
             RESUMEN
        ================================== -->

        <section class="resumen">

            <div class="estadistica">

                <span>
                    VISITAS TOTALES
                </span>

                <strong>
                    ${visitasTotales}
                </strong>

            </div>


            <div class="estadistica">

                <span>
                    VISITAS HOY
                </span>

                <strong>
                    ${visitasHoy}
                </strong>

            </div>


            <div class="estadistica">

                <span>
                    NOTICIAS PUBLICADAS
                </span>

                <strong>
                    ${noticiasPublicadas}
                </strong>

            </div>

        </section>


        <!-- =================================
             GRÁFICO
        ================================== -->

        <section class="bloque">

            <div class="bloque-titulo">

                <span>
                    ACTIVIDAD
                </span>

                <h2>
                    Visitas de los últimos 7 días
                </h2>

            </div>


            <div class="grafico">

                ${crearGrafico(
                    visitasDias
                )}

            </div>

        </section>


        <!-- =================================
             MÁS VISTAS
        ================================== -->

        <section class="bloque">

            <div class="bloque-titulo">

                <span>
                    RANKING
                </span>

                <h2>
                    Noticias más vistas
                </h2>

            </div>


            <div class="ranking-estadisticas">

                ${
                    crearRanking(
                        noticias
                    )
                }

            </div>

        </section>


        <div class="volver">

            <a href="panel.html">

                ← VOLVER AL PANEL

            </a>

        </div>

    `;
}


// ==========================================
// CREAR RANKING
// ==========================================

function crearRanking(
    noticias
) {

    if (
        !noticias ||
        noticias.length === 0
    ) {

        return `

            <div class="sin-datos">

                Todavía no hay visitas registradas.

            </div>

        `;
    }


    return noticias
        .map(
            function(
                noticia,
                indice
            ) {

                return `

                    <article
                        class="ranking-item"
                    >

                        <div
                            class="ranking-numero"
                        >

                            ${String(
                                indice + 1
                            ).padStart(
                                2,
                                "0"
                            )}

                        </div>


                        <div
                            class="ranking-info"
                        >

                            <span>
                                ${escapeHTML(
                                    noticia.categoria ||
                                    "F360"
                                )}
                            </span>


                            <h3>

                                ${escapeHTML(
                                    noticia.titulo
                                )}

                            </h3>

                        </div>


                        <strong
                            class="ranking-visitas"
                        >

                            ${Number(
                                noticia.visitas || 0
                            )}

                            <small>
                                visitas
                            </small>

                        </strong>

                    </article>

                `;

            }
        )
        .join("");
}


// ==========================================
// GRÁFICO
// ==========================================

function crearGrafico(
    dias
) {

    if (
        !dias ||
        dias.length === 0
    ) {

        return `

            <div class="sin-datos">

                Todavía no hay datos.

            </div>

        `;
    }


    const maximo =
        Math.max(
            ...dias.map(
                dia =>
                    Number(
                        dia.visitas || 0
                    )
            ),
            1
        );


    return dias
        .map(
            function(dia) {

                const visitas =
                    Number(
                        dia.visitas || 0
                    );


                const porcentaje =
                    Math.max(
                        5,
                        (
                            visitas /
                            maximo
                        ) * 100
                    );


                const partes =
                    dia.dia.split(
                        "-"
                    );


                const etiqueta =
                    `${partes[2]}/${partes[1]}`;


                return `

                    <div
                        class="barra-contenedor"
                    >

                        <div
                            class="barra-valor"
                        >

                            ${visitas}

                        </div>


                        <div
                            class="barra"
                            style="
                                height:
                                ${porcentaje}%;
                            "
                        ></div>


                        <div
                            class="barra-fecha"
                        >

                            ${etiqueta}

                        </div>

                    </div>

                `;

            }
        )
        .join("");
}


// ==========================================
// CERRAR SESIÓN
// ==========================================

async function cerrarSesion() {

    await supabaseClient.auth
        .signOut();


    mostrarLogin();
}


// ==========================================
// NO AUTORIZADO
// ==========================================

function mostrarNoAutorizado() {

    app.innerHTML = `

        <section class="no-autorizado">

            <div>

                <div class="logo">

                    <span>F</span>360

                </div>


                <h1>
                    Acceso restringido
                </h1>


                <p>
                    Esta sección es solamente
                    para el administrador de F360.
                </p>


                <a href="panel.html">

                    VOLVER AL PANEL

                </a>

            </div>

        </section>

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