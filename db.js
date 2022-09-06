// Import Mongoose package  
const mongoose = require('mongoose');

// MongoDB URL
const mongoURL = process.env.MONGO_URL;

// Connect to MongoDB
const connectToMongo = () => {
    mongoose.connect(mongoURL, () => { 
        console.log('Connected to MongoDB!');
    });
}

// Export the connectToMongo functionuser
module.exports = connectToMongo