import Flight from "../models/flightModel.js";

const addFlight = async(req,res)=>{

    try {

        const flight =  new Flight(req.body);
        await flight.save()

        res.status(201).json({success:true,message:"Flight Added Successfully",data:flight});
        
    } catch (error) {
        res.status(400).json({success:false,message:"Error Adding Flight",error:error.message})
    }

};

const getAllFlights = async(req,res)=>{

    try {

        const flights = await Flight.find()
        res.status(201).json({success:true, flights})
        
    } catch (error) {
        res.status(400).json({success:false,message:"Error fetching data", error:error.message})
    }
}

const getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ success: false, message: "Flight not found" });
    res.status(200).json({ success: true, data: flight });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching flight", error: error.message });
  }
};

const searchFlights = async (req, res) => {
  try {
    const { source, destination, date } = req.params;
    let query = { source, destination };

    if (date) query.date = date; // optional filter

    const flights = await Flight.find(query);
    if (flights.length === 0)
      return res.status(404).json({ success: false, message: "No matching flights found" });

    res.status(200).json({ success: true, data: flights });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error searching flights", error: error.message });
  }
};


const updateFlight = async (req, res) => {
  try {
    const updatedFlight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedFlight) return res.status(404).json({ success: false, message: "Flight not found" });
    res.status(200).json({ success: true, message: "Flight updated", data: updatedFlight });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update flight", error: error.message });
  }
};



const deleteFlight = async (req, res) => {

    try {
        const { id } = req.params;
        await Flight.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Flight deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete flight", error:error.message });
    }
}


const updateFlightStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: "Status is required" });
    const allowed = ["Scheduled", "On Time", "Delayed", "Cancelled", "Completed"];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

    const flight = await Flight.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!flight) return res.status(404).json({ success: false, message: "Flight not found" });
    res.json({ success: true, message: "Status updated", flight });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update status", error: error.message });
  }
};


export {addFlight, getAllFlights, updateFlight, getFlightById, searchFlights, deleteFlight, updateFlightStatus};  