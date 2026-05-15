const express = require('express');
const app = express();
require('dotenv').config({ quiet: true });
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const router = require('./routes/Authroutes');
const { default: mongoose } = require('mongoose');
const redisClient = require('./config/redis');


app.use(express.json());
app.use(cookieParser());

app.use('/user',router);


const initializeConnection = async () => {
    try{
        await Promise.all([connectDB(),redisClient.connect()]);
        console.log("Connected to DB and Redis");

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });

    } catch (error) {
        console.error("Failed to connect to DB or Redis", error);
        process.exit(1);
    }
};

initializeConnection();

// connectDB()
// .then(() => {
//     console.log("conneted DB",mongoose.connection.name);
//     app.listen(process.env.PORT, () => {
//     console.log(`Server is running on port ${process.env.PORT}`);
// });
// })
// .catch((err) => {
//     console.error('Failed to connect to the database',+err);
//     process.exit(1);
// });




