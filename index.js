import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import conectarDB from './config/db.js';
import usuarioRoutes from './routes/usuarioRoutes.js'
import proyectoRoutes from './routes/proyectoRoutes.js'
import tareasRoutes from './routes/tareasRoutes.js'

const app = express();
app.use(express.json());

dotenv.config();

conectarDB();

//app.use(cors());

const whitelist = [process.env.FRONTEND_URL];
const corsOptions = {
    origin: function(origin, callback){
        if(whitelist.includes(origin)){
            //Puede Consultar la API
            callback(null,true);
            }else{
            //No esta permitido
            callback(new Error('Error de Cors'));
        }
    }
}
app.use(cors(corsOptions));

//ROUNTING 
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/tareas', tareasRoutes);

const PORT = process.env.PORT || 4000

const servidor = app.listen(PORT, () =>{
    console.log(`Servidor Corriendo en el puerto ${PORT}`);
})

//Socket.IO
import { Server } from 'socket.io'

const io = new Server(servidor,{
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    }
})

io.on('connection', (socket) => {
    console.log('Conectado a Socket.io')

    //Definir los eventos de Socket.IO
    socket.on('abrir proyecto', (proyecto) =>{
        socket.join(proyecto)

    })

    socket.on('nueva tarea', tarea =>{
        const proyecto  = tarea.proyecto;
        socket.to(proyecto).emit('tarea agregada', tarea)
    })

    socket.on('eliminar tarea', tarea => {
        const proyecto  = tarea.proyecto;
        socket.to(proyecto).emit('tarea eliminada', tarea)
    })

    socket.on('actualizar tarea', tarea =>{
        const proyecto  = tarea.proyecto._id;
        socket.to(proyecto).emit('tarea actualizada', tarea)
    })

    socket.on('cambiar estado', (tarea) =>{
        const proyecto  = tarea.proyecto._id;
        socket.to(proyecto).emit('nuevo estado', tarea)
    })
})