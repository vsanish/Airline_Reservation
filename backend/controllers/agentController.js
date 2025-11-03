import Agent from "../models/agentModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 🔹 Register Agent
const registerAgent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({ success: false, message: "Agent already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAgent = new Agent({
      name,
      email,
      password: hashedPassword,
    });

    await newAgent.save();
    res.status(201).json({
      success: true,
      message: "Agent registered successfully.",
      agent: { id: newAgent._id, name: newAgent.name, email: newAgent.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Registration failed", error: error.message });
  }
};

// 🔹 Login Agent
const loginAgent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const agent = await Agent.findOne({ email });
    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found." });
    }

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid password." });
    }

    const token = jwt.sign({ id: agent._id, email: agent.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      agent: { id: agent._id, name: agent.name, email: agent.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};

// 🔹 Get all agents (admin use)
const getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find().sort({ dateJoined: -1 });
    res.status(200).json({ success: true, agents });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch agents", error: error.message });
  }
};

// ADD Agent (admin use)
const addAgent = async (req, res) => {
  try {
    const { name, email, phone, password, agencyName } = req.body;

    if (!name || !email || !phone || !password || !agencyName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existing = await Agent.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Agent with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAgent = new Agent({
      name,
      email,
      phone,
      password: hashedPassword,
      agencyName,
    });

    await newAgent.save();

    res.status(201).json({
      success: true,
      message: "Agent added successfully",
      agent: {
        _id: newAgent._id,
        name: newAgent.name,
        email: newAgent.email,
        phone: newAgent.phone,
        agencyName: newAgent.agencyName,
        totalCommission: newAgent.totalCommission,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding agent",
      error: error.message,
    });
  }
};


export { registerAgent, loginAgent, getAllAgents, addAgent};
