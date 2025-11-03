import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import connectDB from './config/mongodb.js';
import userRoutes from './routes/userRoutes.js'
import flightRoutes from './routes/flightRoutes.js'
import bookingRouter from './routes/bookingRoutes.js'
import agentRouter from './routes/agentRoutes.js'


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/users',userRoutes)
app.use('/api/flights',flightRoutes)
app.use('/api/bookings',bookingRouter)
app.use('/api/agents',agentRouter)

app.get('/',(req,res)=>{
    res.send("Airline reservation system running...")
})

const PORT = process.env.PORT || 6000;

app.listen(PORT,()=>{
    console.log(`Server Connecting to ${PORT}`)
})