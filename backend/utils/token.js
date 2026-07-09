import jwt from "jsonwebtoken"

const genToken=async (userId) => {
    try {
        const secret = process.env.JWT_SECRET || "zest_super_secret_key_9999"
        const token= jwt.sign({userId},secret,{expiresIn:"7d"})
        return token
    } catch (error) {
        console.log(error)
    }
}

export default genToken