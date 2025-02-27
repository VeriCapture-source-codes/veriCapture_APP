import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`connection to mongodb successfull: ${conn.connection.host}`);
    } catch (error) {
        console.log('failed to connect to mongodb' ,error);
        process.exit(1);
    } 
}

export default connectDB;