import express from "express"
import Item from "../models/item.model.js"
import Shop from "../models/shop.model.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

const seedRouter = express.Router()

// Sample restaurant + item data using free Unsplash images
const restaurantData = [
  {
    name: "Spice Garden",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop",
    address: "12 MG Road",
    items: [
      { name: "Butter Chicken", category: "North Indian", price: 280, foodType: "non veg", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&auto=format&fit=crop" },
      { name: "Paneer Tikka Masala", category: "North Indian", price: 230, foodType: "veg", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop" },
      { name: "Dal Makhani", category: "North Indian", price: 180, foodType: "veg", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop" },
      { name: "Chicken Biryani", category: "Main Course", price: 320, foodType: "non veg", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop" },
      { name: "Veg Pulao", category: "Main Course", price: 160, foodType: "veg", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&auto=format&fit=crop" },
      { name: "Samosa (2 pcs)", category: "Snacks", price: 40, foodType: "veg", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop" },
      { name: "Gulab Jamun", category: "Desserts", price: 80, foodType: "veg", image: "https://images.unsplash.com/photo-1666218423219-3dfc9b61bd72?w=400&auto=format&fit=crop" },
    ]
  },
  {
    name: "Pizza Palace",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop",
    address: "45 Brigade Road",
    items: [
      { name: "Margherita Pizza", category: "Pizza", price: 299, foodType: "veg", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&auto=format&fit=crop" },
      { name: "Pepperoni Pizza", category: "Pizza", price: 399, foodType: "non veg", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&auto=format&fit=crop" },
      { name: "BBQ Chicken Pizza", category: "Pizza", price: 449, foodType: "non veg", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop" },
      { name: "Farmhouse Pizza", category: "Pizza", price: 349, foodType: "veg", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop" },
      { name: "Cheese Burst Pizza", category: "Pizza", price: 479, foodType: "veg", image: "https://images.unsplash.com/photo-1548369937-47519962c11a?w=400&auto=format&fit=crop" },
      { name: "Garlic Bread", category: "Snacks", price: 99, foodType: "veg", image: "https://images.unsplash.com/photo-1619531040576-f9416740661f?w=400&auto=format&fit=crop" },
      { name: "Chocolate Lava Cake", category: "Desserts", price: 149, foodType: "veg", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&auto=format&fit=crop" },
    ]
  },
  {
    name: "Burger Junction",
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&auto=format&fit=crop",
    address: "78 Commercial Street",
    items: [
      { name: "Classic Beef Burger", category: "Burgers", price: 199, foodType: "non veg", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop" },
      { name: "Crispy Chicken Burger", category: "Burgers", price: 179, foodType: "non veg", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&auto=format&fit=crop" },
      { name: "Veggie Delight Burger", category: "Burgers", price: 149, foodType: "veg", image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&auto=format&fit=crop" },
      { name: "Double Patty Burger", category: "Burgers", price: 249, foodType: "non veg", image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&auto=format&fit=crop" },
      { name: "French Fries", category: "Snacks", price: 79, foodType: "veg", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop" },
      { name: "Onion Rings", category: "Snacks", price: 89, foodType: "veg", image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&auto=format&fit=crop" },
      { name: "Chicken Sandwich", category: "Sandwiches", price: 159, foodType: "non veg", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop" },
      { name: "Milkshake", category: "Desserts", price: 119, foodType: "veg", image: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&auto=format&fit=crop" },
    ]
  },
  {
    name: "South Spice",
    image: "https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=600&auto=format&fit=crop",
    address: "23 Jayanagar",
    items: [
      { name: "Masala Dosa", category: "South Indian", price: 120, foodType: "veg", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&auto=format&fit=crop" },
      { name: "Idli Sambar (4 pcs)", category: "South Indian", price: 80, foodType: "veg", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop" },
      { name: "Vada (2 pcs)", category: "South Indian", price: 60, foodType: "veg", image: "https://images.unsplash.com/photo-1589301761935-59b9b7ac1d62?w=400&auto=format&fit=crop" },
      { name: "Uttapam", category: "South Indian", price: 100, foodType: "veg", image: "https://images.unsplash.com/photo-1667886571050-1abea92d5a9c?w=400&auto=format&fit=crop" },
      { name: "Chicken Chettinad", category: "Main Course", price: 280, foodType: "non veg", image: "https://images.unsplash.com/photo-1484980972926-edee96e0960d?w=400&auto=format&fit=crop" },
      { name: "Filter Coffee", category: "Snacks", price: 40, foodType: "veg", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop" },
      { name: "Payasam", category: "Desserts", price: 90, foodType: "veg", image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400&auto=format&fit=crop" },
    ]
  },
  {
    name: "Dragon Wok",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828329f?w=600&auto=format&fit=crop",
    address: "56 Indiranagar",
    items: [
      { name: "Veg Fried Rice", category: "Chinese", price: 160, foodType: "veg", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&auto=format&fit=crop" },
      { name: "Chicken Fried Rice", category: "Chinese", price: 200, foodType: "non veg", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&auto=format&fit=crop" },
      { name: "Hakka Noodles", category: "Chinese", price: 160, foodType: "veg", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop" },
      { name: "Chicken Manchurian", category: "Chinese", price: 220, foodType: "non veg", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&auto=format&fit=crop" },
      { name: "Veg Spring Rolls", category: "Snacks", price: 120, foodType: "veg", image: "https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=400&auto=format&fit=crop" },
      { name: "Schezwan Fried Rice", category: "Chinese", price: 180, foodType: "veg", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&auto=format&fit=crop" },
    ]
  },
  {
    name: "Fast Bites",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&auto=format&fit=crop",
    address: "34 Koramangala",
    items: [
      { name: "Hot Dog", category: "Fast Food", price: 89, foodType: "non veg", image: "https://images.unsplash.com/photo-1612392062631-94fcdc05b0b2?w=400&auto=format&fit=crop" },
      { name: "Loaded Nachos", category: "Snacks", price: 149, foodType: "veg", image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&auto=format&fit=crop" },
      { name: "Chicken Wrap", category: "Fast Food", price: 169, foodType: "non veg", image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&auto=format&fit=crop" },
      { name: "Veg Wrap", category: "Fast Food", price: 129, foodType: "veg", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&auto=format&fit=crop" },
      { name: "Cola (500ml)", category: "Snacks", price: 60, foodType: "veg", image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&auto=format&fit=crop" },
      { name: "Ice Cream Sundae", category: "Desserts", price: 99, foodType: "veg", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&auto=format&fit=crop" },
    ]
  }
]

// POST /api/seed/seed-city — seed restaurants + items for a city
seedRouter.post("/seed-city", async (req, res) => {
  try {
    const { city, state } = req.body
    if (!city || !state) return res.status(400).json({ message: "city and state are required" })

    let seededCount = 0
    const results = []

    for (const restaurant of restaurantData) {
      // Overwrite check: remove if already exists so new unique images are updated
      const existing = await Shop.findOne({ name: restaurant.name, city: { $regex: new RegExp(`^${city}$`, "i") } })
      if (existing) {
        await Item.deleteMany({ shop: existing._id })
        await Shop.deleteOne({ _id: existing._id })
      }

      // Create a dummy owner for this restaurant
      const ownerEmail = `owner_${restaurant.name.toLowerCase().replace(/\s+/g, "_")}_${city.toLowerCase()}@zest.demo`
      let owner = await User.findOne({ email: ownerEmail })
      if (!owner) {
        const hashed = await bcrypt.hash("zest1234", 10)
        owner = await User.create({
          fullName: `${restaurant.name} Owner`,
          email: ownerEmail,
          password: hashed,
          role: "owner",
          mobile: "9999999999"
        })
      }

      // Create the shop
      const shop = await Shop.create({
        name: restaurant.name,
        image: restaurant.image,
        owner: owner._id,
        city,
        state,
        address: `${restaurant.address}, ${city}`,
        items: []
      })

      // Create items
      const createdItems = await Item.insertMany(
        restaurant.items.map(item => ({
          ...item,
          shop: shop._id,
          rating: { average: (3.5 + Math.random() * 1.5).toFixed(1), count: Math.floor(Math.random() * 200) + 10 }
        }))
      )

      shop.items = createdItems.map(i => i._id)
      await shop.save()

      seededCount++
      results.push({ name: restaurant.name, status: "created", items: createdItems.length })
    }

    return res.status(200).json({
      message: `Seeding complete for ${city}`,
      seededCount,
      results
    })
  } catch (error) {
    return res.status(500).json({ message: `seed error: ${error}` })
  }
})

// DELETE /api/seed/clear-city — clear all shops/items for a city (dev only)
seedRouter.delete("/clear-city", async (req, res) => {
  try {
    const { city } = req.body
    const shops = await Shop.find({ city: { $regex: new RegExp(`^${city}$`, "i") } })
    const shopIds = shops.map(s => s._id)
    await Item.deleteMany({ shop: { $in: shopIds } })
    await Shop.deleteMany({ _id: { $in: shopIds } })
    return res.status(200).json({ message: `Cleared all data for ${city}`, shopsRemoved: shops.length })
  } catch (error) {
    return res.status(500).json({ message: `clear error: ${error}` })
  }
})

export default seedRouter
