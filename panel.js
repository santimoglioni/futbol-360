// ==========================================
// CONFIGURACIÓN SUPABASE
// ==========================================

const SUPABASE_URL = "https://sxouqngithkiflbhdcii.supabase.co";

const SUPABASE_KEY = "sb_publishable_izftRBeVdu2h_AKkfhaGOA_XJpY1PKH";


const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// ELEMENTOS
// ==========================================

const loginSection =
    document.getElementById("login-section");

const panelSection =
    document.getElementById("panel-section");

const loginForm =
    document.getElementById("login-form");

const loginMessage =
    document.getElementById("login-message");

const notaForm =
    document.getElementById("nota-form");

const notaMessage =
    document.getElementById("nota-message");

const logoutButton =
    document.getElementById("logout-button");

const usuarioEmail =
    document.getElementById("usuario-email");

const imagenInput =
    document.getElementById("imagen");

const previewContainer =
    document.getElementById("preview-container");

const previewImagen =
    document.getElementById("preview-imagen");


// ==========================================
// VISTA PREVIA DE IMAGEN
// ==========================================

imagenInput.addEventListener("change", function () {

    const archivo = imagenInput.files[0];

    if (!archivo) {

        previewContainer.classList.add("hidden");

        return;
    }


    const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (!tiposPermitidos.includes(archivo.type)) {

        alert(
            "Solo se permiten imágenes JPG, PNG o WEBP."
        );

        imagenInput.value = "";

        previewContainer.classList.add("hidden");

        return;
    }


    if (archivo.size > 5 * 1024 * 1024) {

        alert(
            "La imagen no puede superar los 5 MB."
        );

        imagenInput.value = "";

        previewContainer.classList.add("hidden");

        return;
    }


    const url =
        URL.createObjectURL(archivo);

    previewImagen.src = url;

    previewContainer.classList.remove("hidden");

});


// ==========================================
// COMPROBAR SESIÓN
// ==========================================

async function comprobarSesion() {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    if (session) {

        mostrarPanel(session.user);

    } else {

        mostrarLogin();

    }
}


// ==========================================
// MOSTRAR LOGIN
// ==========================================

function mostrarLogin() {

    loginSection.classList.remove("hidden");

    panelSection.classList.add("hidden");

}


// ==========================================
// MOSTRAR PANEL
// ==========================================

function mostrarPanel(user) {

    loginSection.classList.add("hidden");

    panelSection.classList.remove("hidden");

    usuarioEmail.textContent =
        user.email;

}


// ==========================================
// INICIAR SESIÓN
// ==========================================

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document.getElementById("email")
                .value
                .trim();

        const password =
            document.getElementById("password")
                .value;


        loginMessage.textContent =
            "Iniciando sesión...";


        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({

                    email: email,

                    password: password

                });


        if (error) {

            console.error(error);

            loginMessage.textContent =
                "No se pudo iniciar sesión: " +
                error.message;

            return;
        }


        loginMessage.textContent = "";

        mostrarPanel(data.user);

    }
);


// ==========================================
// CERRAR SESIÓN
// ==========================================

logoutButton.addEventListener(
    "click",
    async function () {

        await supabaseClient.auth.signOut();

        mostrarLogin();

    }
);


// ==========================================
// PUBLICAR NOTA
// ==========================================

notaForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // ------------------------------
        // USUARIO
        // ------------------------------

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth
                .getUser();


        if (!user) {

            notaMessage.textContent =
                "Tenés que iniciar sesión.";

            return;
        }


        // ------------------------------
        // DATOS DE LA NOTA
        // ------------------------------

        const titulo =
            document.getElementById("titulo")
                .value
                .trim();

        const bajada =
            document.getElementById("bajada")
                .value
                .trim();

        const categoria =
            document.getElementById("categoria")
                .value;

        const contenido =
            document.getElementById("contenido")
                .value
                .trim();

        const imagenArchivo =
            document.getElementById("imagen")
                .files[0];


        // ------------------------------
        // VALIDACIONES
        // ------------------------------

        if (
            !titulo ||
            !categoria ||
            !contenido
        ) {

            notaMessage.textContent =
                "Completá el título, categoría y contenido.";

            return;
        }


        // ------------------------------
        // VARIABLE PARA LA URL
        // ------------------------------

        let imagenUrl = null;


        // ------------------------------
        // SUBIR IMAGEN
        // ------------------------------

        if (imagenArchivo) {

            notaMessage.textContent =
                "Subiendo imagen...";


            const extension =
                imagenArchivo.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            const nombreArchivo =
                `${user.id}/${Date.now()}.${extension}`;


            const {
                error: uploadError
            } =
                await supabaseClient.storage
                    .from("imagenes-noticias")
                    .upload(
                        nombreArchivo,
                        imagenArchivo,
                        {
                            contentType:
                                imagenArchivo.type,

                            upsert: false
                        }
                    );


            if (uploadError) {

                console.error(
                    "ERROR AL SUBIR IMAGEN:",
                    uploadError
                );

                notaMessage.textContent =
                    "No se pudo subir la imagen: " +
                    uploadError.message;

                return;
            }


            // ------------------------------
            // OBTENER URL PÚBLICA
            // ------------------------------

            const {
                data: publicUrlData
            } =
                supabaseClient.storage
                    .from("imagenes-noticias")
                    .getPublicUrl(
                        nombreArchivo
                    );


            imagenUrl =
                publicUrlData.publicUrl;

        }


        // ------------------------------
        // GUARDAR NOTA
        // ------------------------------

        notaMessage.textContent =
            "Publicando nota...";


        const {
            error
        } =
            await supabaseClient
                .from("noticias")
                .insert({

                    titulo: titulo,

                    bajada: bajada,

                    contenido: contenido,

                    categoria: categoria,

                    imagen_url: imagenUrl,

                    autor: "F360",

                    autor_id: user.id,

                    publicada: true

                });


        // ------------------------------
        // ERROR
        // ------------------------------

        if (error) {

            console.error(
                "ERROR AL GUARDAR NOTA:",
                error
            );

            notaMessage.textContent =
                "No se pudo publicar la nota: " +
                error.message;

            return;
        }


        // ------------------------------
        // ÉXITO
        // ------------------------------

        notaMessage.textContent =
            "¡Nota publicada correctamente!";


        notaForm.reset();


        previewContainer
            .classList
            .add("hidden");


        previewImagen.src = "";

    }
);


// ==========================================
// INICIAR
// ==========================================

comprobarSesion();