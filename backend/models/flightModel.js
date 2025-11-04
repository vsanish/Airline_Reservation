import mongoose from "mongoose";

const flightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: true,
    unique: true,
  },
  airline: {
    type: String,
    required:true,
  },
  model: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  departureTime: {
    type: String,
    required: true,
  },
  arrivalTime: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
  },
  date: {
    type: String,
    required: true,
  },

  // Fare details
  fare: {
    economy: { type: Number, required: true },
    business: { type: Number, required: true },
    firstClass: { type: Number, required: true },
  },

  //  Seat details by class
  seats: {
    economy: {
      total: { type: Number, required: true },
      available: { type: Number, required: true },
    },
    business: {
      total: { type: Number, required: true },
      available: { type: Number, required: true },
    },
    firstClass: {
      total: { type: Number, required: true },
      available: { type: Number, required: true },
    },
  },

  // seats: {
  // economy: { available: Number, total: Number },
  // business: { available: Number, total: Number },
  // firstClass: { available: Number, total: Number },
  // },

  
  bookedSeats: [String],

  // Crew details
  crew: {
    pilot: { type: String, default: "To be assigned" },
    coPilot: { type: String, default: "To be assigned" },
    airHostess: { type: [String], default: [] },
  },

  // Extra features
  features: {
    type: [String],
    default: [],
  },

},);

const Flight = mongoose.model("Flight", flightSchema);
export default Flight;
