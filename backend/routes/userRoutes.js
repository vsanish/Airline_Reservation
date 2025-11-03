import express from 'express'
import {registerUser, loginUser} from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js'

const userRouter = express.Router();

userRouter.get('/',(req,res)=>{
    res.send("Connected to UseRouter")
})

userRouter.get('/profile',authUser,(req,res)=>{
    res.json({message:"Welcome, authenticated User!",User:req.User});
})

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)


export default userRouter;