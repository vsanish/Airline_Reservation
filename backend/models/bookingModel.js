import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  flightId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flight",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  passengerName: {
    type: String,
    required: true,
  },
  seatsBooked: {
    type: Number,
    required: true,
  },
  seatClass: {
    type: String,
    enum: ["economy", "business", "firstClass"],
    required: true,
  },
  
  seatNumbers: [{ 
    type: String , 
    required:false, 
    default:[],
  }],

  foodOptions: [
    {
      item: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
 
  payment: {
    amount: { type: Number, required: true },
    method: { type: String, enum: ["Credit Card", "Debit Card", "UPI", "Net Banking"], default: "UPI" },
    status: { type: String, enum: ["Paid", "Pending", "Failed"], default: "Pending" },
    transactionId: { type: String },
  },
  status: {
    type: String,
    enum: ["Booked", "Cancelled", "Completed"],
    default: "Booked",
  },
 
  bookingDate: {
    type: Date,
    default: Date.now,
  },
});

bookingSchema.pre("save", function (next) {
  if (!this.payment.amount) {
    const foodTotal = this.foodOptions?.reduce((acc, item) => acc + item.price, 0) || 0;
    this.payment.amount = foodTotal;
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
