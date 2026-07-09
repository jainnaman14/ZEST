import mongoose from "mongoose"

const connectDb=async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            retryWrites: true,
        })
        console.log("db connected")
    } catch (error) {
        console.log("db error:", error.message)
    }
}

export default connectDb