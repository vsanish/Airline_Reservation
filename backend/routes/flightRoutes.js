import express from 'express'
import {addFlight, getAllFlights, updateFlight, getFlightById, searchFlights, deleteFlight, updateFlightStatus} from '../controllers/flightController.js'

const flightRouter = express.Router()

flightRouter.get('/',(req,res)=>{
    res.send("Flight routing working")
})
flightRouter.post('/add',addFlight)
flightRouter.get("/all", getAllFlights);
flightRouter.get('/search/:source/:destination/:date', searchFlights);
flightRouter.put('/status/:id', updateFlightStatus);
flightRouter.get("/:id", getFlightById);
flightRouter.put("/update/:id", updateFlight);
flightRouter.delete("/delete/:id", deleteFlight);



export default flightRouter;