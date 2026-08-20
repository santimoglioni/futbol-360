const SUPABASE_URL =
    "https://sxouqngithkiflbhdcii.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_izftRBeVdu2h_AKkfhaGOA_XJpY1PKH";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


const noticiaContainer =
    document.getElementById(
        "noticia-container"
    );


const parametros =
    new URLSearchParams(
        window.location.search
    );


const noticiaId =
    parametros.get("id");


cargarNoticia();


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
            ? new Date(noticia.created_at)
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


    document.title =
        `${titulo} | F360`;


    const metaDescription =
        document.querySelector(
            'meta[name="description"]'
        );


    if (metaDescription) {

        metaDescription.setAttribute(
            "content",
            descripcion
        );

    }


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


    const ogTitle =
        document.getElementById(
            "og-title"
        );


    const ogDescription =
        document.getElementById(
            "og-description"
        );


    const ogImage =
        document.getElementById(
            "og-image"
        );


    const ogImageAlt =
        document.getElementById(
            "og-image-alt"
        );


    const ogUrl =
        document.getElementById(
            "og-url"
        );


    const ogSection =
        document.getElementById(
            "og-section"
        );


    const ogPublishedTime =
        document.getElementById(
            "og-published-time"
        );


    const ogModifiedTime =
        document.getElementById(
            "og-modified-time"
        );


    if (ogTitle) {

        ogTitle.setAttribute(
            "content",
            titulo
        );

    }


    if (ogDescription) {

        ogDescription.setAttribute(
            "content",
            descripcion
        );

    }


    if (
        ogImage &&
        noticia.imagen_url
    ) {

        ogImage.setAttribute(
            "content",
            noticia.imagen_url
        );

    }


    if (ogImageAlt) {

        ogImageAlt.setAttribute(
            "content",
            titulo
        );

    }


    if (ogUrl) {

        ogUrl.setAttribute(
            "content",
            urlActual
        );

    }


    if (ogSection) {

        ogSection.setAttribute(
            "content",
            categoria
        );

    }


    if (ogPublishedTime) {

        ogPublishedTime.setAttribute(
            "content",
            fechaISO
        );

    }


    if (ogModifiedTime) {

        ogModifiedTime.setAttribute(
            "content",
            fechaISO
        );

    }


    const twitterTitle =
        document.getElementById(
            "twitter-title"
        );


    const twitterDescription =
        document.getElementById(
            "twitter-description"
        );


    const twitterImage =
        document.getElementById(
            "twitter-image"
        );


    const twitterImageAlt =
        document.getElementById(
            "twitter-image-alt"
        );


    if (twitterTitle) {

        twitterTitle.setAttribute(
            "content",
            titulo
        );

    }


    if (twitterDescription) {

        twitterDescription.setAttribute(
            "content",
            descripcion
        );

    }


    if (
        twitterImage &&
        noticia.imagen_url
    ) {

        twitterImage.setAttribute(
            "content",
            noticia.imagen_url
        );

    }


    if (twitterImageAlt) {

        twitterImageAlt.setAttribute(
            "content",
            titulo
        );

    }


    let imagenHTML = "";


    if (noticia.imagen_url) {

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
                >

            </div>

        `;

    }


    const textoWhatsApp =
        encodeURIComponent(
            `${titulo} - F360 ${urlActual}`
        );


    noticiaContainer.innerHTML = `

        <div class="noticia-navegacion">

            <a
                href="index.html"
                class="volver"
            >

                ← VOLVER A F360

            </a>

        </div>


        <article class="noticia">


            <div class="noticia-categoria">

                ${escapeHTML(
                    categoria
                )}

            </div>


            <h1>

                ${escapeHTML(
                    titulo
                )}

            </h1>


            <p class="noticia-bajada">

                ${escapeHTML(
                    descripcion
                )}

            </p>


            <div class="noticia-meta">

                <span>

                    Por
                    <strong>
                        F360
                    </strong>

                </span>


                <span class="noticia-meta-separador">

                    •

                </span>


                <span>

                    ${fechaVisible}

                </span>


                <span class="noticia-meta-separador">

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


            <div class="noticia-contenido">

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


    await cargarRelacionadas(
        noticia
    );

}


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


    if (noticia.categoria) {

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
                .limit(3);

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
                .limit(3);

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


function crearRelacionada(
    noticia
) {

    let imagenHTML = `

        <div class="relacionada-placeholder">

            F360

        </div>

    `;


    if (noticia.imagen_url) {

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
                    href="noticia.html?id=${noticia.id}"
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


    if (datos.imagen) {

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


function mostrarError(
    mensaje
) {

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
