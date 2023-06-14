import Usuario from "../models/Usuario.js"
import generarId from "../helpers/generarId.js"
import generarJWT from "../helpers/generar_JWT.js"
import { emailRegistro, emailOlvidePassword } from "../helpers/email.js";

const crearUsuario = async (req,res) => {

    const { email } = req.body;
    const existeUsuario = await Usuario.findOne({email})

    if(existeUsuario){
        const error = new Error('Usuario ya registrado');
        return res.status(400).json({
            msg: error.message
        })
    }

    try {
        const usuario = new Usuario(req.body);
        usuario.token = generarId();
        await usuario.save();

        //Enviar el email de confirmacion
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        res.json({msg: "Usuario Creado con Exito"})

    } catch (error) {
        console.log(error)
    }
} 

const autenticar = async (req,res) =>{
    
    const { email, password } = req.body;
    //Comprobar si el usuario existe 
    const usuario = await Usuario.findOne({email})
    if(!usuario){
        const error = new Error("El usuario no existe");
        return res.status(404).json({ msg: error.message })
    }

    //Comprabar si el usuario esta confirmado
    if(!usuario.confirmado){
        const error = new Error("Tu cuenta no ha sido confirmada");
        return res.status(404).json({ msg: error.message })
    }

    //Comprobar su password
    if(await usuario.comprobarPassword(password)){
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id),
        })
        }else{
        const error = new Error("El password es Incorrecto");
        return res.status(404).json({ msg: error.message })
    }
    
}

const confirmar = async (req,res) =>{

    const { token } = req.params;
    const usuarioConfirmar = await Usuario.findOne({token})

    if(!usuarioConfirmar){
        const error = new Error("Token no Valido");
        return res.status(404).json({ msg: error.message })
    }

    try {
        usuarioConfirmar.confirmado = true;
        usuarioConfirmar.token = "";

        await usuarioConfirmar.save();

        res.json({
            msg: "Usuario Confirmado Correctamente"
        })
    } catch (error) {
        console.log(error)
    }
} 

const olvidePassword = async (req,res) =>{
    
    const { email } = req.body
    const usuario = await Usuario.findOne({email})

    if(!usuario){
        const error = new Error('Email no existe en la base de datos');
        return res.status(400).json({
            msg: error.message
        })
    }

    try {
        usuario.token = generarId();
        await usuario.save();

        //enviar Email
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        res.json({
            msg: "Hemos enviado un email con las instrucciones"
        })
    } catch (error) {
        console.log(error)
    }
}

const comprobarToken = async (req,res) =>{
    const { token } = req.params;

    const tokenvalido = await Usuario.findOne({token});
    
    if(tokenvalido){
            res.json({ msg: "Token valido y el usuario existe" })
        }else{
            const error = new Error('Token no valido');
            return res.status(400).json({ msg: error.message })
    }

}

const nuevoPassword = async (req,res) =>{
    const { token } = req.params;
    const { password } = req.body;

    const usuario = await Usuario.findOne({token});
    
    if(usuario){
            usuario.password = password;
            usuario.token = '';
            
            try {
                await usuario.save();
                res.json({ msg: "Password modificado con Exito" })  
            } catch (error) {
                console.log(error)
            }

        }else{
            const error = new Error('Token no valido');
            return res.status(400).json({ msg: error.message })
    }
}

const perfil = async(req,res) =>{
    const { usuario } = req;
    res.json(usuario)
}

export {
    crearUsuario,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil
}