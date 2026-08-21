// ==========================================
// F360 - SITEMAP DINÁMICO
// ==========================================


// ==========================================
// CONFIGURACIÓN SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://sxouqngithkiflbhdcii.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_izftRBeVdu2h_AKkfhaGOA_XJpY1PKH";


// ==========================================
// DOMINIO
// ==========================================

const DOMINIO =
    "https://futbol-360.vercel.app";


// ==========================================
// FUNCIÓN PRINCIPAL
// ==========================================

export default async function handler(
    request,
    response
) {

    try {

        // ======================================
        // CONSULTAR NOTICIAS PUBLICADAS
        // ======================================

        const resultado =
            await fetch(
                `${SUPABASE_URL}/rest/v1/noticias?select=id,created_at&publicada=eq.true&order=created_at.desc`,
                {
                    method: "GET",

                    headers: {
                        "apikey": SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`
                    }
                }
            );


        // ======================================
        // COMPROBAR RESPUESTA
        // ======================================

        if (!resultado.ok) {

            throw new Error(
                `Supabase respondió ${resultado.status}`
            );

        }


        // ======================================
        // OBTENER NOTICIAS
        // ======================================

        const noticias =
            await resultado.json();


        // ======================================
        // URLS FIJAS
        // ======================================

        const urls = [

            {
                loc:
                    `${DOMINIO}/`
            },

            {
                loc:
                    `${DOMINIO}/categoria.html?categoria=Fútbol%20Argentino`
            },

            {
                loc:
                    `${DOMINIO}/categoria.html?categoria=Selección`
            },

            {
                loc:
                    `${DOMINIO}/buscar.html`
            }

        ];


        // ======================================
        // AGREGAR NOTICIAS
        // ======================================

        noticias.forEach(
            function(noticia) {

                if (!noticia.id) {

                    return;

                }


                const id =
                    encodeURIComponent(
                        noticia.id
                    );


                let lastmod =
                    null;


                if (
                    noticia.created_at
                ) {

                    const fecha =
                        new Date(
                            noticia.created_at
                        );


                    if (
                        !Number.isNaN(
                            fecha.getTime()
                        )
                    ) {

                        lastmod =
                            fecha.toISOString();

                    }

                }


                urls.push({

                    loc:
                        `${DOMINIO}/noticia.html?id=${id}`,

                    lastmod:
                        lastmod

                });

            }
        );


        // ======================================
        // GENERAR XML
        // ======================================

        const contenidoURLs =
            urls
                .map(
                    function(url) {

                        let xml =

`    <url>
        <loc>${escaparXML(url.loc)}</loc>`;



                        if (
                            url.lastmod
                        ) {

                            xml +=
`
        <lastmod>${url.lastmod}</lastmod>`;

                        }


                        xml +=
`
    </url>`;


                        return xml;

                    }
                )
                .join("\n");


        const xml =

`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${contenidoURLs}
</urlset>`;


        // ======================================
        // HEADERS
        // ======================================

        response.setHeader(
            "Content-Type",
            "application/xml; charset=utf-8"
        );


        response.setHeader(
            "Cache-Control",
            "public, s-maxage=3600, stale-while-revalidate=86400"
        );


        // ======================================
        // RESPUESTA
        // ======================================

        response
            .status(200)
            .send(xml);


    } catch (error) {

        // ======================================
        // ERROR
        // ======================================

        console.error(
            "F360 - Error generando sitemap:",
            error
        );


        const xmlError =

`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${DOMINIO}/</loc>
    </url>
</urlset>`;


        response.setHeader(
            "Content-Type",
            "application/xml; charset=utf-8"
        );


        response
            .status(200)
            .send(xmlError);

    }

}


// ==========================================
// ESCAPAR XML
// ==========================================

function escaparXML(valor) {

    return String(valor)

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
            "&apos;"
        );

}
