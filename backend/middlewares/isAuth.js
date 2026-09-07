import jwt from "jsonwebtoken"

const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers?.authorization?.replace("Bearer ", "")
        if (!token) {
            return res.status(401).json({ message: "Authentication token not found. Please sign in." })
        }
        const secret = process.env.JWT_SECRET || "zest_super_secret_key_9999"
        const decodeToken = jwt.verify(token, secret)
        if (!decodeToken) {
            return res.status(401).json({ message: "Invalid or expired token" })
        }
        req.userId = decodeToken.userId
        next()
    } catch (error) {
        return res.status(401).json({ message: "Authentication failed. Please sign in again." })
    }
}

export default isAuth
