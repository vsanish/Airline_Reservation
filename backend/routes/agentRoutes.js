import express from "express";
import { registerAgent, loginAgent, getAllAgents, addAgent } from "../controllers/agentController.js";
import authAgent from "../middlewares/authAgent.js";

const agentRouter = express.Router();

agentRouter.post("/register", registerAgent);
agentRouter.post("/login", loginAgent);
agentRouter.get("/all", getAllAgents);
agentRouter.post("/add",addAgent);

export default agentRouter;
