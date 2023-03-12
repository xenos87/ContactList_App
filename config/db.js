const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');


const connectDB = () => {

    try {
        mongoose
        .createConnection(db)
        .asPromise() ;
        connectDB.readyState // 1;
        console.log('MongoDB Connected...')
    } catch (error) {
        console.error(err.message);
        process.exit
    }
    
        
}

module.exports = connectDB;