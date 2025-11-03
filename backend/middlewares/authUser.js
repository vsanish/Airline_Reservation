import jwt from 'jsonwebtoken'

const authUser = async(req,res,next)=>{

    try {

        const token = req.header("Authorization");
        if(!token){
         return res.status(400).json({message:"Access denied.No token is Provided"})   
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
        
    } catch (error) {
        res.status(400).json({message:"Invalid token"})
    }
}

export default authUser;