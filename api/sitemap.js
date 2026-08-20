const SUPABASE_URL =
    "https://sxouqngithkiflbhdcii.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_izftRBeVdu2h_AKkfhaGOA_XJpY1PKH";


export default async function handler(
    request,
    response
) {

    try {

        const resultado =
            await fetch(
                `${SUPABASE_URL}/rest/v1/noticias?select=id,created_at&publicada=eq.true&order=created_at.desc`,
                {
                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`
                    }
                }
            );


        if (!resultado.ok) {

            throw new Error(
                `Supabase respondió ${resultado.status}`
            );

        }


        const noticias =
            await resultado.json();


        const dominio =
            "https://futbol-360.vercel.app";


        const urls = [

            `
                <url>
                    <loc>${dominio}/</loc>
                </url>
            `,

            `
                <url>
                    <loc>${dominio}/categoria.html?categoria=Fútbol%20Argentino</loc>
                </url>
            `,

            `
                <url>
                    <loc>${dominio}/categoria.html?categoria=Selección</loc>
                </url>
            `,

            `
                <url>
                    <loc>${dominio}/buscar.html</loc>
                </url>
            `

        ];


        noticias.forEach(
            function(noticia) {

                const id =
                    encodeURIComponent(
                        noticia.id
                    );


                const fecha =
                    noticia.created_at
                        ? new Date(
                            noticia.created_at
                        ).toISOString()
                        : null;


                urls.push(`

                    <url>

                        <loc>
                            ${dominio}/noticia.html?id=${id}
                        </loc>

                        ${
                            fecha
                            ?
                            `
                                <lastmod>
                                    ${fecha}
                                </lastmod>
                            `
                            :
                            ""
                        }

                    </url>

                `);

            }
        );


        const xml = `

<?xml version="1.0" encoding="UTF-8"?>

<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>

    ${urls.join("\n")}

</urlset>

        `.trim();


        response.setHeader(
            "Content-Type",
            "application/xml; charset=utf-8"
        );


        response.setHeader(
            "Cache-Control",
            "public, s-maxage=3600, stale-while-revalidate=86400"
        );


        response.status(
            200
        ).send(
            xml
        );


    } catch (error) {

        console.error(
            "Error generando sitemap:",
            error
        );


        const dominio =
            "https://futbol-360.vercel.app";


        const sitemapError = `

<?xml version="1.0" encoding="UTF-8"?>

<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>

    <url>

        <loc>
            ${dominio}/
        </loc>

    </url>

</urlset>

        `.trim();


        response.setHeader(
            "Content-Type",
            "application/xml; charset=utf-8"
        );


        response.status(
            200
        ).send(
            sitemapError
        );

    }

}