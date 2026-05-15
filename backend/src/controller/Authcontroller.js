const User = require('../models/user');
const validate = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');


const register = async (req, res) => {
    try{

        // validate the user data
        validate(req.body);

        const {firstName, emailId, password}  = req.body;
        // check if user already exists
        const existingUser = await User.findOne({emailId});
        if(existingUser){
            return res.status(400).json({message: 'User already exists'});
        }
        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // create a new user
        const newUser = await User.create({firstName, emailId, password: hashedPassword});
        // generate a token
        const token = jwt.sign({_id:newUser._id , emailId:newUser.emailId, role:'user'}, process.env.JWT_SECRET, {expiresIn: 60*60});
        res.cookie('token',token,{maxAge: 60*60*1000});
        
        res.status(201).json({message: 'User created successfully'});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

const login = async (req, res) => {
    const {emailId, password} = req.body;

    try{
        if(!emailId || !password){
            return res.status(400).json({message: 'Email and password are required'});
        }
        const user = await User.findOne({emailId});
        const match = await bcrypt.compare(password,user.password);

        if(!match)
            throw new Error("Invalid Credentials");


        const token = jwt.sign({_id:user._id , emailId:user.emailId, role:user.role}, process.env.JWT_SECRET, {expiresIn: 60*60});
        res.cookie('token',token,{maxAge: 60*60*1000});
        res.status(200).json({message: 'Login successful'});
    }
    catch(err){
        console.error(err);
        res.status(401).json("Error:"+err.message);
    }
}

const logout = async(req,res) => {
    try{
        const {token} = req.cookies;
        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`,'Blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp);
    
        res.cookie("token",null,{expires: new Date(Date.now())});
        res.send("Logged Out Succesfully");

    }
    catch(err){
       res.status(500).send("Error: "+err);
    }
}


const adminRegister = async (req, res) => {
    try {

        // Validate request body
        validate(req.body);

        const { firstName, emailId, password } = req.body;

        // Check existing user
        const existingUser = await User.findOne({ emailId });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            ...req.body,
            password: hashedPassword
        });

        // Generate JWT
        const token = jwt.sign(
            {
                _id: user._id,
                emailId: user.emailId,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // true in production (HTTPS)
            sameSite: "strict",
            maxAge: 60 * 60 * 1000
        });

        return res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            user: {
                _id: user._id,
                firstName: user.firstName,
                emailId: user.emailId,
                role: user.role
            }
        });

    } catch (err) {

        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    adminRegister
}