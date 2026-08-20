// ==========================================
// CONFIGURACIÓN SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://sxouqngithkiflbhdcii.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_izftRBeVdu2h_AKkfhaGOA_XJpY1PKH";


// ==========================================
// ELEMENTOS
// ==========================================

const noticiaPrincipal =
    document.getElementById(
        "noticia-principal"
    );

const principalCategoria =
    document.getElementById(
        "principal-categoria"
    );

const principalTitulo =
    document.getElementById(
        "principal-titulo"
    );

const principalBajada =
    document.getElementById(
        "principal-bajada"
    );

const principalLink =
    document.getElementById(
        "principal-link"
    );

const noticiasContainer =
    document.getElementById(
        "noticias-container"
    );

const loUltimoContainer =
    document.getElementById(
        "lo-ultimo-container"
    );


// ==========================================
// VERIFICAR SUPABASE
// ==========================================

if (
    typeof window.supabase === "undefined"
) {

    console.error(
        "F360: no se pudo cargar Supabase."
    );

    mostrarError(
        "No se pudo conectar con el sistema de noticias."
    );

} else {

    cargarNoticias();

}


// ==========================================
// CARGAR NOTICIAS
// ==========================================

async function cargarNoticias() {

    console.log(
        "F360: iniciando carga..."
    );


    try {

        const supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );


        const respuesta =
            await supabaseClient

                .from("noticias")

                .select("*")

                .eq(
                    "publicada",
                    true
                )

                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (
            respuesta.error
        ) {

            console.error(
                "F360 - Error Supabase:",
                respuesta.error
            );

            mostrarError(
                "No se pudieron cargar las noticias."
            );

            return;

        }


        const noticias =
            respuesta.data;


        console.log(
            "F360 - Noticias:",
            noticias
        );


        if (
            !noticias ||
            noticias.length === 0
        ) {

            mostrarSinNoticias();

            return;

        }


        // ==================================
        // NOTICIA PRINCIPAL
        // ==================================

        const principal =
            noticias[0];


        principalCategoria.textContent =
            principal.categoria ||
            "F360";


        principalTitulo.textContent =
            principal.titulo ||
            "Última noticia";


        principalBajada.textContent =
            principal.bajada ||
            "";


        principalLink.href =
            "noticia.html?id=" +
            encodeURIComponent(
                principal.id
            );


        if (
            principal.imagen_url
        ) {

            noticiaPrincipal.style.backgroundImage =
                `
                linear-gradient(
                    to top,
                    rgba(0,0,0,0.90),
                    rgba(0,0,0,0.10)
                ),
                url("${principal.imagen_url}")
                `;

        }


        // ==================================
        // LO ÚLTIMO
        // ==================================

        mostrarLoUltimo(
            noticias.slice(
                1,
                5
            )
        );


        // ==================================
        // TARJETAS
        // ==================================

        mostrarTarjetas(
            noticias.slice(
                1,
                7
            )
        );


        console.log(
            "F360: carga terminada."
        );

    } catch (error) {

        console.error(
            "F360 - Error general:",
            error
        );


        mostrarError(
            "No se pudieron cargar las noticias."
        );

    }

}


// ==========================================
// LO ÚLTIMO
// ==========================================

function mostrarLoUltimo(
    noticias
) {

    loUltimoContainer.innerHTML =
        "";


    if (
        noticias.length === 0
    ) {

        loUltimoContainer.innerHTML = `

            <article class="ranking">

                <span>
                    —
                </span>

                <p>
                    Todavía no hay más noticias.
                </p>

            </article>

        `;

        return;

    }


    noticias.forEach(
        function(
            noticia,
            indice
        ) {

            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "ranking";


            article.innerHTML = `

                <span>

                    ${String(
                        indice + 1
                    ).padStart(
                        2,
                        "0"
                    )}

                </span>


                <p>

                    <a
                        href="noticia.html?id=${encodeURIComponent(
                            noticia.id
                        )}"
                        style="
                            color: inherit;
                            text-decoration: none;
                        "
                    >

                        ${escapeHTML(
                            noticia.titulo
                        )}

                    </a>

                </p>

            `;


            loUltimoContainer.appendChild(
                article
            );

        }
    );

}


// ==========================================
// TARJETAS
// ==========================================

function mostrarTarjetas(
    noticias
) {

    noticiasContainer.innerHTML =
        "";


    if (
        noticias.length === 0
    ) {

        noticiasContainer.innerHTML = `

            <p class="cargando">

                Todavía no hay más noticias.

            </p>

        `;

        return;

    }


    noticias.forEach(
        function(noticia) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "card";


            let imagenHTML = `

                <div class="foto-card">

                    <span>
                        F360
                    </span>

                </div>

            `;


            if (
                noticia.imagen_url
            ) {

                imagenHTML = `

                    <div class="foto-card">

                        <img
                            src="${escapeHTML(
                                noticia.imagen_url
                            )}"
                            alt="${escapeHTML(
                                noticia.titulo
                            )}"
                            loading="lazy"
                        >

                    </div>

                `;

            }


            card.innerHTML = `

                ${imagenHTML}


                <div class="card-contenido">


                    <span class="categoria">

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


                    <p>

                        ${
                            noticia.bajada
                            ?
                            escapeHTML(
                                noticia.bajada
                            )
                            :
                            "Leé toda la información en F360."
                        }

                    </p>


                    <a
                        href="noticia.html?id=${encodeURIComponent(
                            noticia.id
                        )}"
                        class="leer-nota"
                    >

                        LEER NOTA →

                    </a>


                </div>

            `;


            noticiasContainer.appendChild(
                card
            );

        }
    );

}


// ==========================================
// SIN NOTICIAS
// ==========================================

function mostrarSinNoticias() {

    principalCategoria.textContent =
        "F360";


    principalTitulo.textContent =
        "Bienvenidos a F360";


    principalBajada.textContent =
        "Todavía no hay noticias publicadas.";


    principalLink.style.display =
        "none";


    noticiaPrincipal.style.backgroundImage =
        "linear-gradient(135deg,#111,#333)";


    loUltimoContainer.innerHTML = `

        <article class="ranking">

            <span>—</span>

            <p>
                Todavía no hay noticias publicadas.
            </p>

        </article>

    `;


    noticiasContainer.innerHTML = `

        <p class="cargando">

            Todavía no hay noticias publicadas.

        </p>

    `;

}


// ==========================================
// ERROR
// ==========================================

function mostrarError(
    mensaje
) {

    if (
        noticiasContainer
    ) {

        noticiasContainer.innerHTML = `

            <p class="error-noticias">

                ${escapeHTML(
                    mensaje
                )}

            </p>

        `;

    }


    if (
        loUltimoContainer
    ) {

        loUltimoContainer.innerHTML = `

            <article class="ranking">

                <span>!</span>

                <p>

                    No pudimos conectar
                    con las noticias.

                </p>

            </article>

        `;

    }

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