import jwt from "jsonwebtoken"
const isAuth=async (req,res,next) => {
    try {
        const token=req.cookies.token
        if(!token){
            return res.status(400).json({message:"token not found"})
        }
        const secret = process.env.JWT_SECRET || "zest_super_secret_key_9999"
        const decodeToken=jwt.verify(token,secret)
        if(!decodeToken){
 return res.status(400).json({message:"token not verify"})
        }
        req.userId=decodeToken.userId
        next()
    } catch (error) {
         return res.status(500).json({message:"isAuth error"})
    }
}

export default isAuth