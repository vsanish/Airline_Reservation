import User from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const registerUser = async(req,res)=>{

    try {

        const {name, email, password} = req.body;

        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({success:false,message:"User Already Exits"})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({name, email, password:hashedPassword});
        await newUser.save()
         
        res.status(201).json({success:true,message:"User Register Successfully"})
    } catch (error) {
        res.status(500).json({success:false,message:"Exit Register User",error})
    }

}


const loginUser = async(req,res)=>{

    try {

        const {email,password} =req.body;
        // console.log("Received login request:", { email, password });

        const user = await User.findOne({email}) 

        if(!user){
            return res.status(400).json({message:"User is not Valid "})
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if(!validPassword){
            return res.status(400).json({message:"Invalid PAssword"})
        }

        const token = jwt.sign({id: user._id},process.env.JWT_SECRET);

        res.status(201).json({success:true,message:"login Successfully",token})
    } catch (error) {
        res.status(500).json({success:false,message:"Exit login User",error})
    }
}

export  {registerUser, loginUser};      