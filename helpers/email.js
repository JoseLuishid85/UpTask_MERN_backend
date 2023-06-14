import nodemailer from 'nodemailer';

export const emailRegistro = async (datos) => {
    const { email, nombre, token } = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    //Informacion del Email

    const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Comprueba tu Cuenta",
        text: "Comprueba tu cuenta en Uptask",
        html: `<p>Hola: ${nombre} comprueba tu cuenta en UpTask</p>
        <p>
            Tu cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace:
            <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>
        </p>
        <br />
        <p>
            Si tuno creaste esta cuenta, puedes ignorar el mensaje
        </p>
        `,
    })
}

export const emailOlvidePassword = async (datos) => {
    const { email, nombre, token } = datos;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    //Informacion del Email

    const info = await transport.sendMail({
        from: '"UpTask - Administrador de Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: "UpTask - Restablece tu password",
        text: "Restablece tu password tu cuenta en Uptask",
        html: `<p>Hola: ${nombre} has solicitado Restablece tu password en UpTask</p>
        <p>
            Sigue en siguiente enlace para generar un nuevo password:
            <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Restablecer Password</a>
        </p>
        <br />
        <p>
            Si tu no solicitaste este email, puedes ignorar el mensaje
        </p>
        `,
    })
}

