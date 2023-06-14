import Proyecto from "../models/Proyecto.js"
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res) => {
    const proyectos = await Proyecto.find({
        '$or' : [
            { 'colaboradores': { $in: req.usuario } },
            { 'creador': { $in: req.usuario } },
        ]
    })
        .select('-tareas');

    res.json(proyectos)
}

const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body);
    proyecto.creador = req.usuario._id

    try {
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado);
    } catch (error) {
        console.log(error)
    }
}

const obtenerProyecto = async (req, res) => {
    const { id } = req.params;
    const proyecto = await Proyecto.findById(id)
        .populate({ path: 'tareas', populate: { path: 'completado', select: 'nombre' } })
        .populate('colaboradores', 'nombre email')

    if (!proyecto) {
        const error = new Error('No encontrado');
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(
        (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )) {
        const error = new Error('Acción no valido');
        return res.status(401).json({ msg: error.message })
    }

    //Obtener las tareas del Proyecto
    res.json(proyecto)
}

const editarProyecto = async (req, res) => {

    const { id } = req.params;
    const proyecto = await Proyecto.findById(id)

    if (!proyecto) {
        const error = new Error('No encontrado');
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no valido');
        return res.status(401).json({ msg: error.message })
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
    proyecto.cliente = req.body.cliente || proyecto.cliente;

    try {
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }

}

const eliminarProyecto = async (req, res) => {

    const { id } = req.params;
    const proyecto = await Proyecto.findById(id);

    if (!proyecto) {
        const error = new Error('No encontrado');
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no valido');
        return res.status(401).json({ msg: error.message })
    }
    //console.log(proyecto.creador.toString() === req.usuario._id.toString())

    try {
        await proyecto.deleteOne();
        res.json({ msg: "Proyecto Eliminado" })
    } catch (error) {
        console.log(error)
    }
}

const buscarColaborador = async (req, res) => {

    try {
        const { email } = req.body;
        const usuario = await Usuario.findOne({ email }).select('-confirmado -createdAt -password -token -updatedAt -__v');

        if (!usuario) {
            const error = new Error('Usuario no encontrado');
            return res.status(404).json({ msg: error.message })
        }

        res.json(usuario)
    } catch (error) {
        console.log(error)
    }


}

const agregarColaborador = async (req, res) => {

    const proyecto = await Proyecto.findById(req.params.id);
    if (!proyecto) {
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no Valida');
        return res.status(404).json({ msg: error.message })
    }

    const { email } = req.body;
    const usuario = await Usuario.findOne({ email }).select('-confirmado -createdAt -password -token -updatedAt -__v');

    if (!usuario) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({ msg: error.message })
    }

    //El colabprador no es ele admin del proyecto
    if (proyecto.creador.toString() === usuario._id.toString()) {
        const error = new Error('El creador del Proyecto no puede ser colaborador');
        return res.status(404).json({ msg: error.message })
    }

    //Revisar que no este ya agregado al proyecto
    if(proyecto.colaboradores.includes(usuario._id)){
        const error = new Error('El usuario ya pertenece al proyecto');
        return res.status(404).json({ msg: error.message })
    }

    //Esta bien, se puede agregar
    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()
    res.json({ msg: 'Colaborador agregado correctamente' })
}

const eliminarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id);
    if (!proyecto) {
        const error = new Error('Proyecto no encontrado');
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error('Acción no Valida');
        return res.status(404).json({ msg: error.message })
    }

    //Esta bien, se puede Eliminar
    proyecto.colaboradores.pull(req.body.id)
    //console.log(proyecto)
    await proyecto.save()
    res.json({ msg: 'Colaborador Eliminado correctamente' })
    
}


export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador
}