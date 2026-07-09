import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createEditShop = async (req, res) => {
    try {
        const { name, city, state, address, phone, description, cuisines, openingTime, closingTime, isOpen } = req.body

        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }

        // Parse cuisines — sent as JSON string from FormData
        let parsedCuisines = []
        if (cuisines) {
            try {
                parsedCuisines = typeof cuisines === "string" ? JSON.parse(cuisines) : cuisines
            } catch {
                parsedCuisines = []
            }
        }

        let shop = await Shop.findOne({ owner: req.userId })

        if (!shop) {
            // New shop — image required only if not provided we still allow it with empty string
            shop = await Shop.create({
                name, city, state, address,
                image: image || "",
                phone: phone || "",
                description: description || "",
                cuisines: parsedCuisines,
                openingTime: openingTime || "09:00",
                closingTime: closingTime || "22:00",
                isOpen: isOpen !== undefined ? isOpen === "true" || isOpen === true : true,
                owner: req.userId
            })
        } else {
            const updateData = {
                name, city, state, address,
                phone: phone || shop.phone,
                description: description !== undefined ? description : shop.description,
                cuisines: parsedCuisines.length > 0 ? parsedCuisines : shop.cuisines,
                openingTime: openingTime || shop.openingTime,
                closingTime: closingTime || shop.closingTime,
                isOpen: isOpen !== undefined ? (isOpen === "true" || isOpen === true) : shop.isOpen,
                owner: req.userId
            }
            if (image) updateData.image = image

            shop = await Shop.findByIdAndUpdate(shop._id, updateData, { new: true })
        }

        await shop.populate("owner items")

        // Emit real-time event so users in this city see the new/updated shop instantly
        const io = req.app.get("io")
        if (io) {
            io.to(city.toLowerCase()).emit("newShopInCity", shop)
        }

        return res.status(201).json(shop)
    } catch (error) {
        console.log("createEditShop error:", error)
        return res.status(500).json({ message: `Failed to save shop: ${error.message}` })
    }
}

export const toggleShopOpen = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId })
        if (!shop) return res.status(404).json({ message: "Shop not found" })

        shop.isOpen = !shop.isOpen
        await shop.save()
        await shop.populate("owner items")

        const io = req.app.get("io")
        if (io) {
            io.to(shop.city.toLowerCase()).emit("shopStatusChanged", { shopId: shop._id, isOpen: shop.isOpen })
        }

        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({ message: `Toggle open error: ${error.message}` })
    }
}

export const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId }).populate("owner").populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        if (!shop) {
            return res.status(404).json({ message: "No shop found" })
        }
        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({ message: `get my shop error ${error}` })
    }
}

export const getShopByCity = async (req, res) => {
    try {
        const { city } = req.params

        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate('items')
        if (!shops) {
            return res.status(400).json({ message: "shops not found" })
        }
        return res.status(200).json(shops)
    } catch (error) {
        return res.status(500).json({ message: `get shop by city error ${error}` })
    }
}