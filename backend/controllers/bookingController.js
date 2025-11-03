import Booking from "../models/bookingModel.js";
import Flight from "../models/flightModel.js";
import crypto from "crypto";


const addBooking = async (req, res) => {
  try {
    const {
      flightId,
      userId,
      passengerName,
      seatsBooked,
      seatNumbers = [],
      seatClass,
      foodOptions,
      paymentMethod,
    } = req.body;

    // 1️⃣ Find the flight
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ success: false, message: "Flight not found" });
    }

    // 2️⃣ Validate seat count
    if (seatsBooked > 5) {
      return res.status(400).json({
        success: false,
        message: "You can book a maximum of 5 seats per booking.",
      });
    }

    // 3️⃣ Check for mismatch between seatsBooked and seatNumbers
    if (seatNumbers.length > 0 && seatNumbers.length !== seatsBooked) {
      return res.status(400).json({
        success: false,
        message: `Seat count mismatch — You specified ${seatsBooked} seats but provided ${seatNumbers.length} seat numbers.`,
      });
    }

    // 4️⃣ Prevent duplicate seat numbers in user input
    const uniqueSeatNumbers = [...new Set(seatNumbers)];
    if (uniqueSeatNumbers.length !== seatNumbers.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate seat numbers are not allowed.",
      });
    }

    // 5️⃣ Check if seat numbers are already taken
    const bookedSeatNumbers = flight.bookedSeats || [];
    const alreadyTaken = uniqueSeatNumbers.filter((s) => bookedSeatNumbers.includes(s));

    if (alreadyTaken.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seat(s) ${alreadyTaken.join(", ")} already booked.`,
      });
    }

    // 6️⃣ Auto-allocate if no seat numbers provided
    let finalSeatNumbers = [...uniqueSeatNumbers];
    if (finalSeatNumbers.length === 0) {
      const prefix = seatClass === "economy" ? "E" : seatClass === "business" ? "B" : "F";
      const totalSeats = flight.seats[seatClass].total;

      const availableSeats = Array.from({ length: totalSeats }, (_, i) => `${prefix}${i + 1}`).filter(
        (seat) => !bookedSeatNumbers.includes(seat)
      );

      if (availableSeats.length < seatsBooked) {
        return res.status(400).json({
          success: false,
          message: "Not enough available seats for auto-allocation.",
        });
      }

      finalSeatNumbers = availableSeats.slice(0, seatsBooked);
    }

    // 7️⃣ Update seat availability and bookedSeats
    flight.seats[seatClass].available -= seatsBooked;
    flight.bookedSeats.push(...finalSeatNumbers);
    await flight.save();

    // 8️⃣ Calculate total fare
    const seatFare = flight.fare[seatClass] * seatsBooked;
    const foodTotal = (foodOptions || []).reduce((sum, item) => sum + (item.price || 0), 0);
    const totalAmount = seatFare + foodTotal;

    // 9️⃣ Create booking record
    const booking = new Booking({
      flightId,
      userId,
      passengerName,
      seatsBooked,
      seatNumbers: finalSeatNumbers,
      seatClass,
      foodOptions,
      payment: {
        amount: totalAmount,
        method: paymentMethod || "UPI",
        status: "Paid",
        transactionId: `TXN${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
      },
      status: "Booked",
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: "Booking successful!",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Booking failed",
      error: error.message,
    });
  }
};

// ✈️ Cancel Booking
const cancelBooking = async (req, res) => {
  try {
    const { bookingId, userId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.json({ success: false, message: "Booking not found" });

    if (booking.userId.toString() !== userId)
      return res.json({ success: false, message: "Unauthorized cancellation." });

    if (booking.status === "Cancelled")
      return res.json({ success: false, message: "Already cancelled." });

    const flight = await Flight.findById(booking.flightId);
    if (!flight) return res.json({ success: false, message: "Associated flight not found." });

    // Restore seats
    flight.seats[booking.seatClass].available += booking.seatsBooked;
    flight.bookedSeats = flight.bookedSeats.filter(
      (seat) => !booking.seatNumbers.includes(seat)
    );

    await flight.save();

    booking.status = "Cancelled";
    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled and seats restored.",
      data: booking,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Cancellation failed.",
      error: error.message,
    });
  }
};



const simulatePayment = (fare, seatCount) => {
  const totalAmount = fare * seatCount;
  const paymentSuccess = Math.random() > 0.1; 
  return {
    amount: totalAmount,
    method: "UPI",
    status: paymentSuccess ? "Paid" : "Failed",
    transactionId: "TXN-" + crypto.randomBytes(6).toString("hex").toUpperCase(),
  };
};


const getBookingByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { paymentStatus, status } = req.query; 

    // Build dynamic filter object
    const filter = { userId };

    if (status) filter.status = status; 
    if (paymentStatus) filter["payment.status"] = paymentStatus; 

    // Fetch bookings and populate flight info
    const bookings = await Booking.find(filter)
      .populate("flightId", "flightNumber airline source destination date")
      .sort({ bookingDate: -1 });

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found for this user",
      });
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user bookings",
      error: error.message,
    });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { flightId, userId, status, paymentStatus } = req.query;

    // Build filter dynamically
    const filter = {};

    if (flightId) filter.flightId = flightId;
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (paymentStatus) filter["payment.status"] = paymentStatus;

    // Fetch bookings with flight and user info populated
    const bookings = await Booking.find(filter)
      .populate("flightId", "flightNumber airline source destination date departureTime arrivalTime")
      .populate("userId", "name email")
      .sort({ bookingDate: -1 });

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found for the given filter.",
      });
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

export { addBooking, cancelBooking, simulatePayment, getBookingByUser, getAllBookings};
