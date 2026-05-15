const mongoose = require('mongoose');

async function connectDB() {
    await mongoose.connect(process.env.DB_CONNECT_STRING)
}

module.exports = connectDB;