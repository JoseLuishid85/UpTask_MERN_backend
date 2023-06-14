//+srv://jose:.zfK_8E92UK4CvB@cluster0.qeb4srk.mongodb.net/cine

import mongoose from "mongoose";

const conectarDB = async () => {
    try {
        const connection = await mongoose.connect(
            process.env.MONGO_URI,{
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

        const url = `${connection.connection.host} : ${connection.connection.port}`;
        console.log(`MongoDB Conectado en: ${url}`)
    } catch (error) {
        console.log(`error: ${error.message}`)
        process.exit(1)
    }
}

export default conectarDB;