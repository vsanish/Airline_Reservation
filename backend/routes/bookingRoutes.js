import express from 'express'
import {  addBooking, cancelBooking, getBookingByUser,getAllBookings } from '../controllers/bookingController.js'
// import {createBooking, getAllBookings} from '../controllers/bookingController.js'
import authUser from '../middlewares/authUser.js'
const bookingRouter = express.Router()


bookingRouter.get('/',(req,res)=>{
    res.send("Booking Routing Working")
})

// bookingRouter.post('/book',authUser,bookFlight);
// bookingRouter.get('/my-bookings',authUser,getMyBookings);
// bookingRouter.put('/cancel/:id',authUser,cancelBookings) 

bookingRouter.post('/add',addBooking);
bookingRouter.put('/cancel',cancelBooking)
bookingRouter.get("/all", getAllBookings);
bookingRouter.get("/user/:userId", getBookingByUser);


export default bookingRouter;