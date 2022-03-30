import express from "express"
import userRoutes from "./Routes/userRoutes.js"
import cartRoutes from "./Routes/cartRoutes.js"
import filesRoutes from "./Routes/filesRoutes.js"
import commandsRoutes from "./Routes/commandRoutes.mjs"
import mongoose from "mongoose"
import dotenv from 'dotenv'
import { Server } from "socket.io";
dotenv.config()
const app = express()

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_IP}/${process.env.DB_NAME}?retryWrites=true&w=majority`, {useNewUrlParser: true});

app.use(express.json())

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', ['*']);
    res.append('Access-Control-Allow-Headers', ['*']);
    next();
});

app.use('/users', userRoutes)
app.use('/cart', cartRoutes)
app.use('/files', filesRoutes)
app.use('/commands', commandsRoutes)

let httpServer = app.listen(process.env.APP_PORT, () => {
    console.log("API listening on port " + process.env.APP_PORT)
})

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost", "http://localhost:63342"],
        credentials: true
    }
});

app.set('socket.io', io);

io.on('connection', (socket) => {
    console.log('connection')
});