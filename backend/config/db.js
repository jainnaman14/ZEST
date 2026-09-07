import mongoose from "mongoose"

const connectDb = async () => {
    try {
        if (!process.env.MONGODB_URL) {
            console.error("MONGODB_URL is not defined in environment variables");
            return;
        }
        await mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            retryWrites: true,
        });
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection error:", error.message);
    }
};

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
});

mongoose.connection.on("connected", () => {
    console.log("MongoDB connected");
});

export default connectDb;
