require('dotenv').config({}); 

// Import Mongoose package  
const mongoose = require('mongoose');

// MongoDB URL
// const mongoURL = process.env.MONGO_URL;
const mongoURL = "mongodb+srv://Harshu:test@cluster0.msyevpe.mongodb.net/web-notebook?retryWrites=true&w=majority";

// Connect to MongoDB
const connectToMongo = () => {
    mongoose.connect(mongoURL, () => { 
        console.log('Connected to MongoDB!');
    });
}

// Export the connectToMongo functionuser
module.exports = connectToMongo