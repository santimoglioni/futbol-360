// ==========================================
// F360 - NOTICIA
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
// ELEMENTOS
// ==========================================

const noticiaContainer =
    document.getElementById(
        "noticia-container"
    );


// ==========================================
// ID DE LA NOTICIA
// ==========================================

const parametros =
    new URLSearchParams(
        window.location.search
    );


const noticiaId =
    parametros.get("id");


// ==========================================
// INICIO
// ==========================================

cargarNoticia();


// ==========================================
// CARGAR NOTICIA
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


    if (!data) {

        mostrarError(
            "La noticia no existe."
        );


        return;
    }


    // ======================================
    // REGISTRAR VISITA
    // ======================================

    registrarVisita(
        data.id
    );


    // ======================================
    // MOSTRAR NOTICIA
    // ======================================

    mostrarNoticia(
        data
    );
}


// ==========================================
// REGISTRAR VISITA
// ==========================================

async function registrarVisita(
    idNoticia
) {

    if (!idNoticia) {

        return;
    }


    /*
        Evitamos contar varias veces
        la misma noticia durante 30 minutos
        desde el mismo navegador.
    */

    const clave =
        `f360_visita_${idNoticia}`;


    const ultimaVisita =
        localStorage.getItem(
            clave
        );


    const ahora =
        Date.now();


    if (
        ultimaVisita &&
        ahora -
        Number(
            ultimaVisita
        ) <
        30 * 60 * 1000
    ) {

        return;
    }


    localStorage.setItem(
        clave,
        String(
            ahora
        )
    );


    const {
        error
    } =
        await supabaseClient.rpc(
            "registrar_visita",
            {
                p_noticia_id:
                    idNoticia
            }
        );


    if (error) {

        console.error(
            "F360 - Error registrando visita:",
            error
        );

    }
}


// ==========================================
// MOSTRAR NOTICIA
// ==========================================

async function mostrarNoticia(
    noticia
) {


    // ======================================
    // DATOS
    // ======================================

    const titulo =
        noticia.titulo ||
        "F360";


    const descripcion =
        noticia.bajada ||
        "Todo el fútbol argentino y la Selección en un solo lugar.";


    const categoria =
        noticia.categoria ||
        "F360";


    // ======================================
    // FECHA
    // ======================================

    const fechaPublicacion =
        noticia.created_at
            ? new Date(
                noticia.created_at
            )
            : new Date();


    const fechaModificacion =
        noticia.updated_at
            ? new Date(
                noticia.updated_at
            )
            : fechaPublicacion;


    const fechaISO =
        fechaPublicacion.toISOString();


    const fechaModificacionISO =
        fechaModificacion.toISOString();


    const fechaVisible =
        fechaPublicacion.toLocaleDateString(
            "es-AR",
            {
                day:
                    "2-digit",

                month:
                    "long",

                year:
                    "numeric"
            }
        );


    const horaVisible =
        fechaPublicacion.toLocaleTimeString(
            "es-AR",
            {
                hour:
                    "2-digit",

                minute:
                    "2-digit"
            }
        );


    // ======================================
    // URL DE LA NOTICIA
    // ======================================

    const urlNoticia =
        `${window.location.origin}` +
        `${window.location.pathname}` +
        `?id=${encodeURIComponent(
            noticia.id
        )}`;


    // ======================================
    // IMAGEN
    // ======================================

    let imagenHTML = "";


    if (
        noticia.imagen_url
    ) {

        imagenHTML = `

            <div
                class="noticia-imagen-contenedor"
            >

                <img
                    class="noticia-imagen"
                    itemprop="image"
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
            `${titulo} - F360 ${urlNoticia}`
        );


    // ======================================
    // SEO
    // ======================================

    actualizarSEO({

        titulo:
            titulo,

        descripcion:
            descripcion,

        categoria:
            categoria,

        fechaISO:
            fechaISO,

        fechaModificacionISO:
            fechaModificacionISO,

        url:
            urlNoticia,

        imagen:
            noticia.imagen_url || ""

    });


    // ======================================
    // CONTENIDO
    // ======================================

    const contenidoHTML =
        formatearContenido(
            noticia.contenido
        );


    // ======================================
    // HTML DE LA NOTICIA
    // ======================================

    noticiaContainer.innerHTML = `

        <!-- =================================
             VOLVER
        ================================== -->

        <div
            class="noticia-navegacion"
        >

            <a
                href="index.html"
                class="volver"
            >

                ← VOLVER A F360

            </a>

        </div>



        <!-- =================================
             NOTICIA
        ================================== -->

        <article
            class="noticia"
            itemscope
            itemtype="https://schema.org/NewsArticle"
        >


            <!-- CATEGORÍA -->

            <div
                class="noticia-categoria"
                itemprop="articleSection"
            >

                ${escapeHTML(
                    categoria
                )}

            </div>



            <!-- TÍTULO -->

            <h1
                itemprop="headline"
            >

                ${escapeHTML(
                    titulo
                )}

            </h1>



            <!-- BAJADA -->

            <p
                class="noticia-bajada"
                itemprop="description"
            >

                ${escapeHTML(
                    descripcion
                )}

            </p>



            <!-- IMAGEN -->

            ${imagenHTML}



            <!-- AUTOR Y FECHA -->

            <div
                class="noticia-meta"
            >

                <span>

                    Por

                    <strong
                        itemprop="author"
                        itemscope
                        itemtype="https://schema.org/Organization"
                    >

                        <span
                            itemprop="name"
                        >

                            F360

                        </span>

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

                    ${escapeHTML(
                        fechaVisible
                    )}

                </time>


                <span
                    class="noticia-meta-separador"
                >

                    •

                </span>


                <span>

                    ${escapeHTML(
                        horaVisible
                    )}

                </span>


                <meta
                    itemprop="dateModified"
                    content="${escapeHTML(
                        fechaModificacionISO
                    )}"
                >

            </div>



            <!-- =================================
                 CONTENIDO
            ================================== -->

            <div
                class="noticia-contenido"
                itemprop="articleBody"
            >

                ${contenidoHTML}

            </div>



            <!-- =================================
                 BOTONES
            ================================== -->

            <div
                class="noticia-acciones"
            >

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


        </article>



        <!-- =================================
             RELACIONADAS
        ================================== -->

        <section
            class="noticias-relacionadas"
            id="noticias-relacionadas"
        >

        </section>

    `;


    // ======================================
    // SCHEMA
    // ======================================

    crearSchemaNoticia({

        titulo:
            titulo,

        descripcion:
            descripcion,

        imagen:
            noticia.imagen_url || "",

        fechaPublicacion:
            fechaISO,

        fechaModificacion:
            fechaModificacionISO,

        categoria:
            categoria,

        url:
            urlNoticia

    });


    // ======================================
    // RELACIONADAS
    // ======================================

    await cargarRelacionadas(
        noticia
    );
}


// ==========================================
// SEO
// ==========================================

function actualizarSEO(
    datos
) {

    document.title =
        `${datos.titulo} | F360`;


    actualizarMeta(
        "meta-description",
        "content",
        limitarDescripcion(
            datos.descripcion
        )
    );


    actualizarMeta(
        "canonical-url",
        "href",
        datos.url
    );


    actualizarMeta(
        "og-title",
        "content",
        `${datos.titulo} | F360`
    );


    actualizarMeta(
        "og-description",
        "content",
        datos.descripcion
    );


    actualizarMeta(
        "og-url",
        "content",
        datos.url
    );


    actualizarMeta(
        "og-section",
        "content",
        datos.categoria
    );


    actualizarMeta(
        "og-published-time",
        "content",
        datos.fechaISO
    );


    actualizarMeta(
        "og-modified-time",
        "content",
        datos.fechaModificacionISO
    );


    actualizarMeta(
        "twitter-title",
        "content",
        `${datos.titulo} | F360`
    );


    actualizarMeta(
        "twitter-description",
        "content",
        datos.descripcion
    );


    if (
        datos.imagen
    ) {

        actualizarMeta(
            "og-image",
            "content",
            datos.imagen
        );


        actualizarMeta(
            "og-image-alt",
            "content",
            datos.titulo
        );


        actualizarMeta(
            "twitter-image",
            "content",
            datos.imagen
        );


        actualizarMeta(
            "twitter-image-alt",
            "content",
            datos.titulo
        );

    }
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
// LIMITAR DESCRIPTION
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


    return (
        limpio.substring(
            0,
            157
        ) +
        "..."
    );
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
                        ascending:
                            false
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
                        ascending:
                            false
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

        <h2
            class="relacionadas-titulo"
        >

            También te puede interesar

        </h2>


        <div
            class="relacionadas-grid"
        >

            ${
                data
                    .map(
                        crearRelacionada
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

        <div
            class="relacionada-placeholder"
        >

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

        <article
            class="relacionada-card"
        >


            <div
                class="relacionada-imagen"
            >

                ${imagenHTML}

            </div>


            <div
                class="relacionada-contenido"
            >

                <span
                    class="relacionada-categoria"
                >

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

    const url =
        `${window.location.origin}` +
        `${window.location.pathname}` +
        `?id=${encodeURIComponent(
            noticiaId
        )}`;


    try {

        await navigator.clipboard.writeText(
            url
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
            url;


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
            ".accion-noticia:not(.whatsapp)"
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

    const anterior =
        document.getElementById(
            "schema-noticia"
        );


    if (anterior) {

        anterior.remove();
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
            datos.fechaModificacion,

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
                "https://futbol-360.vercel.app/",

            "logo": {

                "@type":
                    "ImageObject",

                "url":
                    "https://futbol-360.vercel.app/apple-touch-icon.png"

            }

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


    /*
        Cada Enter que hagas en el panel
        genera un párrafo nuevo.

        También funciona si dejás una
        línea en blanco entre párrafos.
    */

    const parrafos =
        String(contenido)
            .split(
                /\r?\n+/
            )
            .map(
                function(parrafo) {

                    return parrafo.trim();

                }
            )
            .filter(
                function(parrafo) {

                    return (
                        parrafo !== ""
                    );

                }
            );


    return parrafos
        .map(
            function(parrafo) {

                return `

                    <p>

                        ${escapeHTML(
                            parrafo
                        )}

                    </p>

                `;

            }
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

    document.title =
        "F360 | Noticia no encontrada";


    actualizarMeta(
        "meta-description",
        "content",
        "La noticia que buscás no está disponible en F360."
    );


    noticiaContainer.innerHTML = `

        <div
            class="error-noticia"
        >

            <h2>

                ${escapeHTML(
                    mensaje
                )}

            </h2>


            <a
                href="index.html"
            >

                ← Volver a F360

            </a>

        </div>

    `;
}
