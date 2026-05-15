const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis")

const adminMiddleware = async (req,res,next)=>{

    try{
       
        const {token} = req.cookies;
        if(!token)
            throw new Error("Token is not present");

        const payload = jwt.verify(token,process.env.JWT_SECRET);
        
        const {_id} = payload;

        if(!_id){
            throw new Error("Invalid token");
        }

        const result = await User.findById(_id);

        // check if the user is admin or not

        if(payload.role!='admin')
            throw new Error("Invalid Token");

        if(!result){
            throw new Error("User Doesn't Exist");
        }

        // Redis ke blockList mein present toh nahi hai

        const IsBlocked = await redisClient.exists(`token:${token}`);

        if(IsBlocked)
            throw new Error("Invalid Token");

        req.result = result;


        next();
    }
    catch(err){
        res.status(401).send("Error: "+ err.message)
    }

}


module.exports = adminMiddleware;
