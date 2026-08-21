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
// ELEMENTOS
// ==========================================

const tituloCategoria =
    document.getElementById(
        "titulo-categoria"
    );


const descripcionCategoria =
    document.getElementById(
        "descripcion-categoria"
    );


const noticiasContainer =
    document.getElementById(
        "noticias-container"
    );


// ==========================================
// OBTENER CATEGORÍA
// ==========================================

const parametros =
    new URLSearchParams(
        window.location.search
    );


const categoria =
    parametros.get(
        "categoria"
    );


// ==========================================
// INFORMACIÓN DE CATEGORÍAS
// ==========================================

const informacionCategorias = {

    "Fútbol Argentino": {

        titulo:
            "Fútbol Argentino",

        descripcion:
            "Toda la actualidad de los clubes y protagonistas del fútbol argentino."

    },


    "Selección": {

        titulo:
            "Selección Argentina",

        descripcion:
            "Las últimas noticias de la Selección Argentina y sus protagonistas."

    },


    "Mercado de Pases": {

        titulo:
            "Mercado de Pases",

        descripcion:
            "Altas, bajas y todos los movimientos del fútbol argentino."

    }

};


// ==========================================
// COMPROBAR CATEGORÍA
// ==========================================

if (
    !categoria ||
    !informacionCategorias[
        categoria
    ]
) {

    mostrarErrorCategoria();

} else {

    cargarCategoria();

}


// ==========================================
// CARGAR CATEGORÍA
// ==========================================

async function cargarCategoria() {

    const informacion =
        informacionCategorias[
            categoria
        ];


    // ======================================
    // INFORMACIÓN VISIBLE
    // ======================================

    tituloCategoria.textContent =
        informacion.titulo;


    descripcionCategoria.textContent =
        informacion.descripcion;


    // ======================================
    // SEO
    // ======================================

    actualizarSEO(
        informacion
    );


    // ======================================
    // ESTADO DE CARGA
    // ======================================

    noticiasContainer.innerHTML = `

        <p class="cargando">

            Cargando noticias...

        </p>

    `;


    // ======================================
    // CONSULTA SUPABASE
    // ======================================

    const {
        data,
        error
    } =
        await supabaseClient

            .from("noticias")

            .select("*")

            .eq(
                "categoria",
                categoria
            )

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


    // ======================================
    // ERROR
    // ======================================

    if (error) {

        console.error(
            "Error cargando categoría:",
            error
        );


        noticiasContainer.innerHTML = `

            <p class="error-noticias">

                No se pudieron cargar
                las noticias.

            </p>

        `;


        return;

    }


    // ======================================
    // SIN NOTICIAS
    // ======================================

    if (
        !data ||
        data.length === 0
    ) {

        noticiasContainer.innerHTML = `

            <p class="cargando">

                Todavía no hay noticias
                en esta categoría.

            </p>

        `;


        marcarMenuActivo();

        return;

    }


    // ======================================
    // LIMPIAR
    // ======================================

    noticiasContainer.innerHTML =
        "";


    // ======================================
    // MARCAR MENÚ ACTIVO
    // ======================================

    marcarMenuActivo();


    // ======================================
    // CREAR TARJETAS
    // ======================================

    data.forEach(
        function(noticia) {

            const card =
                crearTarjeta(
                    noticia
                );


            noticiasContainer.appendChild(
                card
            );

        }
    );

}


// ==========================================
// SEO DINÁMICO
// ==========================================

function actualizarSEO(
    informacion
) {

    const dominio =
        "https://futbol-360.vercel.app";


    const urlActual =
        window.location.href;


    const tituloSEO =
        `F360 | ${informacion.titulo}`;


    const descripcionSEO =
        informacion.descripcion;


    // ======================================
    // TITLE
    // ======================================

    document.title =
        tituloSEO;


    // ======================================
    // META DESCRIPTION
    // ======================================

    const metaDescription =
        document.getElementById(
            "meta-description"
        );


    if (metaDescription) {

        metaDescription.setAttribute(
            "content",
            descripcionSEO
        );

    }


    // ======================================
    // CANONICAL
    // ======================================

    const canonical =
        document.getElementById(
            "canonical-url"
        );


    if (canonical) {

        canonical.setAttribute(
            "href",
            urlActual
        );

    }


    // ======================================
    // OPEN GRAPH
    // ======================================

    const ogTitle =
        document.getElementById(
            "og-title"
        );


    const ogDescription =
        document.getElementById(
            "og-description"
        );


    const ogUrl =
        document.getElementById(
            "og-url"
        );


    if (ogTitle) {

        ogTitle.setAttribute(
            "content",
            tituloSEO
        );

    }


    if (ogDescription) {

        ogDescription.setAttribute(
            "content",
            descripcionSEO
        );

    }


    if (ogUrl) {

        ogUrl.setAttribute(
            "content",
            urlActual
        );

    }


    // ======================================
    // TWITTER / X
    // ======================================

    const twitterTitle =
        document.getElementById(
            "twitter-title"
        );


    const twitterDescription =
        document.getElementById(
            "twitter-description"
        );


    if (twitterTitle) {

        twitterTitle.setAttribute(
            "content",
            tituloSEO
        );

    }


    if (twitterDescription) {

        twitterDescription.setAttribute(
            "content",
            descripcionSEO
        );

    }


    // ======================================
    // DATOS ESTRUCTURADOS
    // ======================================

    agregarDatosEstructurados(
        informacion,
        dominio,
        urlActual
    );

}


// ==========================================
// DATOS ESTRUCTURADOS
// ==========================================

function agregarDatosEstructurados(
    informacion,
    dominio,
    urlActual
) {

    const schemaExistente =
        document.getElementById(
            "categoria-schema"
        );


    if (schemaExistente) {

        schemaExistente.remove();

    }


    const datos =
        {

            "@context":
                "https://schema.org",

            "@type":
                "CollectionPage",

            "name":
                `F360 | ${informacion.titulo}`,

            "description":
                informacion.descripcion,

            "url":
                urlActual,

            "isPartOf":
                {

                    "@type":
                        "WebSite",

                    "name":
                        "F360",

                    "url":
                        `${dominio}/`

                }

        };


    const script =
        document.createElement(
            "script"
        );


    script.id =
        "categoria-schema";


    script.type =
        "application/ld+json";


    script.textContent =
        JSON.stringify(
            datos
        );


    document.head.appendChild(
        script
    );

}


// ==========================================
// MOSTRAR ERROR DE CATEGORÍA
// ==========================================

function mostrarErrorCategoria() {

    tituloCategoria.textContent =
        "Categoría no encontrada";


    descripcionCategoria.textContent =
        "La sección que buscás no existe.";


    document.title =
        "F360 | Categoría no encontrada";


    const metaDescription =
        document.getElementById(
            "meta-description"
        );


    if (metaDescription) {

        metaDescription.setAttribute(
            "content",
            "La categoría que buscás no existe en F360."
        );

    }


    noticiasContainer.innerHTML = `

        <p class="error-noticias">

            No encontramos esta categoría.

        </p>

    `;

}


// ==========================================
// CREAR TARJETA
// ==========================================

function crearTarjeta(
    noticia
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "card";


    // ======================================
    // IMAGEN
    // ======================================

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


    // ======================================
    // FECHA
    // ======================================

    const fecha =
        formatearFecha(
            noticia.created_at
        );


    // ======================================
    // CONTENIDO
    // ======================================

    card.innerHTML = `

        ${imagenHTML}


        <div class="card-contenido">


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


            <div class="card-footer">


                <span class="fecha-noticia">

                    ${fecha}

                </span>


                <a
                    href="noticia.html?id=${encodeURIComponent(
                        noticia.id
                    )}"
                    class="leer-nota"
                    aria-label="Leer noticia: ${escapeHTML(
                        noticia.titulo
                    )}"
                >

                    LEER NOTA →

                </a>


            </div>


        </div>

    `;


    return card;

}


// ==========================================
// MARCAR MENÚ ACTIVO
// ==========================================

function marcarMenuActivo() {

    const menuArgentino =
        document.getElementById(
            "menu-argentino"
        );


    const menuSeleccion =
        document.getElementById(
            "menu-seleccion"
        );


    const menuMercado =
        document.getElementById(
            "menu-mercado"
        );


    // ======================================
    // LIMPIAR ACTIVOS
    // ======================================

    if (
        menuArgentino
    ) {

        menuArgentino.classList.remove(
            "activo"
        );

    }


    if (
        menuSeleccion
    ) {

        menuSeleccion.classList.remove(
            "activo"
        );

    }


    if (
        menuMercado
    ) {

        menuMercado.classList.remove(
            "activo"
        );

    }


    // ======================================
    // ACTIVAR CATEGORÍA
    // ======================================

    if (
        categoria ===
        "Fútbol Argentino"
    ) {

        menuArgentino?.classList.add(
            "activo"
        );

    }


    if (
        categoria ===
        "Selección"
    ) {

        menuSeleccion?.classList.add(
            "activo"
        );

    }


    if (
        categoria ===
        "Mercado de Pases"
    ) {

        menuMercado?.classList.add(
            "activo"
        );

    }

}


// ==========================================
// FORMATEAR FECHA
// ==========================================

function formatearFecha(
    fecha
) {

    if (!fecha) {

        return "";

    }


    const fechaObjeto =
        new Date(
            fecha
        );


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
