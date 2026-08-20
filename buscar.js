// ==========================================
// F360 - BUSCADOR
// ==========================================


// ==========================================
// CONFIGURACIÓN SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://sxouqngithkiflbhdcii.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_izftRBeVdu2h_AKkfhaGOA_XJpY1PKH";


// ==========================================
// INICIAR CUANDO CARGA LA PÁGINA
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    iniciarBuscador
);


function iniciarBuscador() {


    // ======================================
    // SUPABASE
    // ======================================

    if (
        !window.supabase ||
        !window.supabase.createClient
    ) {

        console.error(
            "F360: Supabase no se pudo cargar."
        );

        return;

    }


    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );


    // ======================================
    // ELEMENTOS
    // ======================================

    const formulario =
        document.getElementById(
            "formulario-busqueda"
        );


    const input =
        document.getElementById(
            "input-busqueda"
        );


    const resultados =
        document.getElementById(
            "resultados-grid"
        );


    const contador =
        document.getElementById(
            "resultado-busqueda"
        );


    // ======================================
    // COMPROBAR ELEMENTOS
    // ======================================

    if (
        !formulario ||
        !input ||
        !resultados ||
        !contador
    ) {

        console.error(
            "F360: faltan elementos del buscador."
        );

        return;

    }


    // ======================================
    // FORMULARIO
    // ======================================

    formulario.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            buscarNoticias();

        }
    );


    // ======================================
    // FUNCIÓN DE BÚSQUEDA
    // ======================================

    async function buscarNoticias() {

        const termino =
            input.value.trim();


        // ----------------------------------
        // SIN TÉRMINO
        // ----------------------------------

        if (!termino) {

            contador.innerHTML =
                "";

            resultados.innerHTML = `

                <div class="sin-resultados">

                    Escribí algo para comenzar
                    la búsqueda.

                </div>

            `;

            return;

        }


        // ----------------------------------
        // CARGANDO
        // ----------------------------------

        contador.innerHTML =
            "Buscando...";


        resultados.innerHTML = `

            <div class="cargando-busqueda">

                Buscando noticias de F360...

            </div>

        `;


        try {

            const busqueda =
                `%${termino}%`;


            const respuesta =
                await supabaseClient

                    .from("noticias")

                    .select(`
                        id,
                        titulo,
                        bajada,
                        categoria,
                        imagen_url,
                        created_at,
                        publicada
                    `)

                    .eq(
                        "publicada",
                        true
                    )

                    .or(
                        `titulo.ilike.${busqueda},bajada.ilike.${busqueda}`
                    )

                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


            // ------------------------------
            // ERROR
            // ------------------------------

            if (
                respuesta.error
            ) {

                console.error(
                    "F360 - Error buscando:",
                    respuesta.error
                );


                contador.innerHTML =
                    "";


                resultados.innerHTML = `

                    <div class="sin-resultados">

                        No se pudo realizar
                        la búsqueda.

                    </div>

                `;

                return;

            }


            const data =
                respuesta.data || [];


            // ------------------------------
            // SIN RESULTADOS
            // ------------------------------

            if (
                data.length === 0
            ) {

                contador.innerHTML = `

                    No encontramos resultados
                    para
                    "<strong>${escapeHTML(
                        termino
                    )}</strong>".

                `;


                resultados.innerHTML = `

                    <div class="sin-resultados">

                        No encontramos noticias
                        relacionadas con tu búsqueda.

                    </div>

                `;

                return;

            }


            // ------------------------------
            // CONTADOR
            // ------------------------------

            contador.innerHTML = `

                Encontramos

                <strong>
                    ${data.length}
                </strong>

                resultado${
                    data.length === 1
                        ? ""
                        : "s"
                }

                para

                "<strong>${escapeHTML(
                    termino
                )}</strong>".

            `;


            // ------------------------------
            // MOSTRAR RESULTADOS
            // ------------------------------

            resultados.innerHTML =
                "";


            data.forEach(
                function(noticia) {

                    resultados.appendChild(
                        crearTarjeta(
                            noticia
                        )
                    );

                }
            );

        } catch (error) {

            console.error(
                "F360 - Error general:",
                error
            );


            contador.innerHTML =
                "";


            resultados.innerHTML = `

                <div class="sin-resultados">

                    Ocurrió un error al realizar
                    la búsqueda.

                </div>

            `;

        }

    }


    // ======================================
    // CREAR TARJETA
    // ======================================

    function crearTarjeta(
        noticia
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "resultado-card";


        // ----------------------------------
        // IMAGEN
        // ----------------------------------

        let imagenHTML = `

            <div class="resultado-placeholder">

                F360

            </div>

        `;


        if (
            noticia.imagen_url
        ) {

            imagenHTML = `

                <img
                    src="${escapeHTML(
                        noticia.imagen_url
                    )}"
                    alt="${escapeHTML(
                        noticia.titulo
                    )}"
                    loading="lazy"
                >

            `;

        }


        // ----------------------------------
        // FECHA
        // ----------------------------------

        const fecha =
            formatearFecha(
                noticia.created_at
            );


        // ----------------------------------
        // TARJETA
        // ----------------------------------

        card.innerHTML = `

            <div class="resultado-imagen">

                ${imagenHTML}

            </div>


            <div class="resultado-contenido">


                <span class="categoria">

                    ${escapeHTML(
                        noticia.categoria ||
                        "F360"
                    )}

                </span>


                <h2>

                    ${escapeHTML(
                        noticia.titulo
                    )}

                </h2>


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


                <small
                    style="
                        display:block;
                        color:#888;
                        margin-bottom:12px;
                        font-size:11px;
                    "
                >

                    ${fecha}

                </small>


                <a
                    href="./noticia.html?id=${encodeURIComponent(
                        noticia.id
                    )}"
                >

                    LEER NOTA →

                </a>


            </div>

        `;


        return card;

    }


    // ======================================
    // FECHA
    // ======================================

    function formatearFecha(
        fecha
    ) {

        if (!fecha) {

            return "";

        }


        const fechaObjeto =
            new Date(fecha);


        if (
            Number.isNaN(
                fechaObjeto.getTime()
            )
        ) {

            return "";

        }


        return fechaObjeto.toLocaleDateString(
            "es-AR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }


    // ======================================
    // ESCAPAR HTML
    // ======================================

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


    // ======================================
    // NAVEGACIÓN F360
    // ======================================

    // Evitamos que el buscador interfiera
    // con los enlaces del menú.

    const enlacesMenu =
        document.querySelectorAll(
            ".menu a"
        );


    enlacesMenu.forEach(
        function(enlace) {

            enlace.addEventListener(
                "click",
                function(event) {

                    const destino =
                        enlace.getAttribute(
                            "href"
                        );


                    if (
                        destino &&
                        destino !== "#"
                    ) {

                        event.preventDefault();

                        window.location.href =
                            destino;

                    }

                }
            );

        }
    );


    console.log(
        "F360: buscador iniciado correctamente."
    );

}