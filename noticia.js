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

const noticiaContainer =
    document.getElementById(
        "noticia-container"
    );


// ==========================================
// OBTENER ID
// ==========================================

const parametros =
    new URLSearchParams(
        window.location.search
    );


const noticiaId =
    parametros.get(
        "id"
    );


// ==========================================
// CARGAR NOTICIA
// ==========================================

cargarNoticia();


// ==========================================
// FUNCIÓN PRINCIPAL
// ==========================================

async function cargarNoticia() {

    if (!noticiaId) {

        mostrarError(
            "No se encontró la noticia."
        );

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient

            .from("noticias")

            .select("*")

            .eq(
                "id",
                noticiaId
            )

            .eq(
                "publicada",
                true
            )

            .single();


    if (error) {

        console.error(
            "Error cargando noticia:",
            error
        );


        mostrarError(
            "No pudimos encontrar esta noticia."
        );

        return;

    }


    mostrarNoticia(
        data
    );

}


// ==========================================
// MOSTRAR NOTICIA
// ==========================================

async function mostrarNoticia(
    noticia
) {

    const titulo =
        noticia.titulo ||
        "F360";


    const descripcion =
        noticia.bajada ||
        "Todo el fútbol argentino y la Selección en un solo lugar.";


    const categoria =
        noticia.categoria ||
        "F360";


    const fecha =
        noticia.created_at
            ? new Date(
                noticia.created_at
            )
            : new Date();


    const fechaISO =
        fecha.toISOString();


    const fechaVisible =
        fecha.toLocaleDateString(
            "es-AR",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );


    const horaVisible =
        fecha.toLocaleTimeString(
            "es-AR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    const urlActual =
        window.location.href;


    // ======================================
    // SEO PRINCIPAL
    // ======================================

    const tituloSEO =
        `${titulo} | F360`;


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
            limitarDescripcion(
                descripcion
            )
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

    actualizarMeta(
        "og-title",
        "content",
        tituloSEO
    );


    actualizarMeta(
        "og-description",
        "content",
        descripcion
    );


    actualizarMeta(
        "og-url",
        "content",
        urlActual
    );


    actualizarMeta(
        "og-section",
        "content",
        categoria
    );


    actualizarMeta(
        "og-published-time",
        "content",
        fechaISO
    );


    actualizarMeta(
        "og-modified-time",
        "content",
        fechaISO
    );


    if (
        noticia.imagen_url
    ) {

        actualizarMeta(
            "og-image",
            "content",
            noticia.imagen_url
        );


        actualizarMeta(
            "og-image-alt",
            "content",
            titulo
        );

    }


    // ======================================
    // TWITTER / X
    // ======================================

    actualizarMeta(
        "twitter-title",
        "content",
        tituloSEO
    );


    actualizarMeta(
        "twitter-description",
        "content",
        descripcion
    );


    if (
        noticia.imagen_url
    ) {

        actualizarMeta(
            "twitter-image",
            "content",
            noticia.imagen_url
        );


        actualizarMeta(
            "twitter-image-alt",
            "content",
            titulo
        );

    }


    // ======================================
    // IMAGEN
    // ======================================

    let imagenHTML =
        "";


    if (
        noticia.imagen_url
    ) {

        imagenHTML = `

            <div class="noticia-imagen-contenedor">

                <img
                    class="noticia-imagen"
                    src="${escapeHTML(
                        noticia.imagen_url
                    )}"
                    alt="${escapeHTML(
                        titulo
                    )}"
                    loading="eager"
                >

            </div>

        `;

    }


    // ======================================
    // WHATSAPP
    // ======================================

    const textoWhatsApp =
        encodeURIComponent(
            `${titulo} - F360 ${urlActual}`
        );


    // ======================================
    // CONTENIDO
    // ======================================

    noticiaContainer.innerHTML = `

        <div class="noticia-navegacion">

            <a
                href="index.html"
                class="volver"
            >

                ← VOLVER A F360

            </a>

        </div>


        <article
            class="noticia"
            itemscope
            itemtype="https://schema.org/NewsArticle"
        >


            <meta
                itemprop="mainEntityOfPage"
                content="${escapeHTML(
                    urlActual
                )}"
            >


            <div
                class="noticia-categoria"
                itemprop="articleSection"
            >

                ${escapeHTML(
                    categoria
                )}

            </div>


            <h1
                itemprop="headline"
            >

                ${escapeHTML(
                    titulo
                )}

            </h1>


            <p
                class="noticia-bajada"
                itemprop="description"
            >

                ${escapeHTML(
                    descripcion
                )}

            </p>


            <div class="noticia-meta">


                <span>

                    Por

                    <strong
                        itemprop="author"
                    >

                        F360

                    </strong>

                </span>


                <span
                    class="noticia-meta-separador"
                >

                    •

                </span>


                <time
                    itemprop="datePublished"
                    datetime="${escapeHTML(
                        fechaISO
                    )}"
                >

                    ${fechaVisible}

                </time>


                <span
                    class="noticia-meta-separador"
                >

                    •

                </span>


                <span>

                    ${horaVisible}

                </span>


            </div>


            <div class="noticia-acciones">


                <button
                    type="button"
                    class="accion-noticia whatsapp"
                    onclick='compartirWhatsApp(
                        ${JSON.stringify(
                            textoWhatsApp
                        )}
                    )'
                >

                    WHATSAPP

                </button>


                <button
                    type="button"
                    class="accion-noticia"
                    onclick="copiarEnlace()"
                >

                    COPIAR ENLACE

                </button>


            </div>


            ${imagenHTML}


            <div
                class="noticia-contenido"
                itemprop="articleBody"
            >

                ${formatearContenido(
                    noticia.contenido
                )}

            </div>


        </article>


        <section
            class="noticias-relacionadas"
            id="noticias-relacionadas"
        >

        </section>

    `;


    // ======================================
    // SCHEMA NEWSARTICLE
    // ======================================

    crearSchemaNoticia({

        titulo:
            titulo,

        descripcion:
            descripcion,

        imagen:
            noticia.imagen_url ||
            "",

        fechaPublicacion:
            fechaISO,

        categoria:
            categoria,

        url:
            urlActual

    });


    // ======================================
    // NOTICIAS RELACIONADAS
    // ======================================

    await cargarRelacionadas(
        noticia
    );

}


// ==========================================
// ACTUALIZAR META
// ==========================================

function actualizarMeta(
    id,
    atributo,
    valor
) {

    const elemento =
        document.getElementById(
            id
        );


    if (!elemento) {

        return;

    }


    elemento.setAttribute(
        atributo,
        valor
    );

}


// ==========================================
// LIMITAR DESCRIPCIÓN
// ==========================================

function limitarDescripcion(
    texto
) {

    if (!texto) {

        return "";

    }


    const limpio =
        String(texto)
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    if (
        limpio.length <= 160
    ) {

        return limpio;

    }


    return
        limpio.substring(
            0,
            157
        ) + "...";

}


// ==========================================
// NOTICIAS RELACIONADAS
// ==========================================

async function cargarRelacionadas(
    noticia
) {

    const contenedor =
        document.getElementById(
            "noticias-relacionadas"
        );


    if (!contenedor) {

        return;

    }


    let consulta;


    if (
        noticia.categoria
    ) {

        consulta =
            supabaseClient

                .from("noticias")

                .select(`
                    id,
                    titulo,
                    categoria,
                    imagen_url,
                    created_at
                `)

                .eq(
                    "publicada",
                    true
                )

                .eq(
                    "categoria",
                    noticia.categoria
                )

                .neq(
                    "id",
                    noticia.id
                )

                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )

                .limit(
                    3
                );

    } else {

        consulta =
            supabaseClient

                .from("noticias")

                .select(`
                    id,
                    titulo,
                    categoria,
                    imagen_url,
                    created_at
                `)

                .eq(
                    "publicada",
                    true
                )

                .neq(
                    "id",
                    noticia.id
                )

                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )

                .limit(
                    3
                );

    }


    const {
        data,
        error
    } =
        await consulta;


    if (error) {

        console.error(
            "Error cargando relacionadas:",
            error
        );

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        contenedor.innerHTML =
            "";

        return;

    }


    contenedor.innerHTML = `

        <h2 class="relacionadas-titulo">

            También te puede interesar

        </h2>


        <div class="relacionadas-grid">

            ${data
                .map(
                    noticiaRelacionada =>
                        crearRelacionada(
                            noticiaRelacionada
                        )
                )
                .join("")
            }

        </div>

    `;

}


// ==========================================
// CREAR NOTICIA RELACIONADA
// ==========================================

function crearRelacionada(
    noticia
) {

    let imagenHTML = `

        <div class="relacionada-placeholder">

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


    return `

        <article class="relacionada-card">


            <div class="relacionada-imagen">

                ${imagenHTML}

            </div>


            <div class="relacionada-contenido">


                <span class="relacionada-categoria">

                    ${escapeHTML(
                        noticia.categoria ||
                        "F360"
                    )}

                </span>


                <a
                    href="noticia.html?id=${encodeURIComponent(
                        noticia.id
                    )}"
                    class="relacionada-titulo"
                >

                    ${escapeHTML(
                        noticia.titulo
                    )}

                </a>


            </div>


        </article>

    `;

}


// ==========================================
// WHATSAPP
// ==========================================

function compartirWhatsApp(
    texto
) {

    const url =
        `https://wa.me/?text=${texto}`;


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


// ==========================================
// COPIAR ENLACE
// ==========================================

async function copiarEnlace() {

    try {

        await navigator.clipboard.writeText(
            window.location.href
        );


        mostrarMensajeCopiado();

    } catch (error) {

        console.error(
            "No se pudo copiar:",
            error
        );


        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            window.location.href;


        document.body.appendChild(
            textarea
        );


        textarea.select();


        document.execCommand(
            "copy"
        );


        textarea.remove();


        mostrarMensajeCopiado();

    }

}


// ==========================================
// MENSAJE COPIADO
// ==========================================

function mostrarMensajeCopiado() {

    const boton =
        document.querySelector(
            '[onclick="copiarEnlace()"]'
        );


    if (!boton) {

        return;

    }


    const textoOriginal =
        boton.textContent;


    boton.textContent =
        "¡ENLACE COPIADO!";


    setTimeout(
        function() {

            boton.textContent =
                textoOriginal;

        },
        1800
    );

}


// ==========================================
// SCHEMA NEWSARTICLE
// ==========================================

function crearSchemaNoticia(
    datos
) {

    const schemaAnterior =
        document.getElementById(
            "schema-noticia"
        );


    if (schemaAnterior) {

        schemaAnterior.remove();

    }


    const schema = {

        "@context":
            "https://schema.org",

        "@type":
            "NewsArticle",

        "headline":
            datos.titulo,

        "description":
            datos.descripcion,

        "datePublished":
            datos.fechaPublicacion,

        "dateModified":
            datos.fechaPublicacion,

        "articleSection":
            datos.categoria,

        "inLanguage":
            "es-AR",


        "author": {

            "@type":
                "Organization",

            "name":
                "F360",

            "url":
                "https://futbol-360.vercel.app/"

        },


        "publisher": {

            "@type":
                "Organization",

            "name":
                "F360",

            "url":
                "https://futbol-360.vercel.app/"

        },


        "mainEntityOfPage": {

            "@type":
                "WebPage",

            "@id":
                datos.url

        }

    };


    if (
        datos.imagen
    ) {

        schema.image = [

            datos.imagen

        ];

    }


    const script =
        document.createElement(
            "script"
        );


    script.id =
        "schema-noticia";


    script.type =
        "application/ld+json";


    script.textContent =
        JSON.stringify(
            schema
        );


    document.head.appendChild(
        script
    );

}


// ==========================================
// FORMATEAR CONTENIDO
// ==========================================

function formatearContenido(
    contenido
) {

    if (!contenido) {

        return `

            <p>

                No hay contenido disponible
                para esta noticia.

            </p>

        `;

    }


    const parrafos =
        contenido

            .split(
                /\n\s*\n/
            )

            .filter(
                parrafo =>
                    parrafo.trim() !== ""
            );


    return parrafos

        .map(
            parrafo => `

                <p>

                    ${escapeHTML(
                        parrafo.trim()
                    )}

                </p>

            `
        )

        .join("");

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


// ==========================================
// ERROR
// ==========================================

function mostrarError(
    mensaje
) {

    // Cambiar título para una URL inválida
    document.title =
        "F360 | Noticia no encontrada";


    const metaDescription =
        document.getElementById(
            "meta-description"
        );


    if (metaDescription) {

        metaDescription.setAttribute(
            "content",
            "La noticia que buscás no está disponible en F360."
        );

    }


    noticiaContainer.innerHTML = `

        <div class="error-noticia">

            <h2>

                ${escapeHTML(
                    mensaje
                )}

            </h2>


            <br>


            <a
                href="index.html"
            >

                ← Volver a F360

            </a>

        </div>

    `;

}
