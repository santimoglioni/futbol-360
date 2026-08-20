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

    tituloCategoria.textContent =
        "Categoría no encontrada";


    descripcionCategoria.textContent =
        "La sección que buscás no existe.";


    noticiasContainer.innerHTML = `

        <p class="error-noticias">

            No encontramos esta categoría.

        </p>

    `;

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
    // INFORMACIÓN
    // ======================================

    tituloCategoria.textContent =
        informacion.titulo;


    descripcionCategoria.textContent =
        informacion.descripcion;


    document.title =
        `F360 | ${informacion.titulo}`;


    // ======================================
    // ESTADO DE CARGA
    // ======================================

    noticiasContainer.innerHTML = `

        <p class="cargando">

            Cargando noticias...

        </p>

    `;


    // ======================================
    // CONSULTA
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


        return;

    }


    // ======================================
    // LIMPIAR
    // ======================================

    noticiasContainer.innerHTML =
        "";


    // ======================================
    // MARCAR MENU ACTIVO
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
                >

                    LEER NOTA →

                </a>


            </div>


        </div>

    `;


    return card;

}


// ==========================================
// MARCAR MENU ACTIVO
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