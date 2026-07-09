import User from "./models/user.model.js"

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log("Socket connected:", socket.id)

    // Register user identity
    socket.on('identity', async ({ userId }) => {
      try {
        await User.findByIdAndUpdate(userId, {
          socketId: socket.id, isOnline: true
        }, { new: true })
      } catch (error) {
        console.log(error)
      }
    })

    // Join a city room so owner shop creations are broadcast to users in the same city
    socket.on('joinCity', ({ city }) => {
      if (city) {
        socket.join(city.toLowerCase())
        console.log(`Socket ${socket.id} joined city room: ${city.toLowerCase()}`)
      }
    })

    // Customer/owner joins a room specific to their order to receive rider location
    socket.on('joinOrderRoom', ({ orderId }) => {
      if (orderId) {
        socket.join(`order_${orderId}`)
        console.log(`Socket ${socket.id} joined order room: order_${orderId}`)
      }
    })

    // Delivery boy joins the order room and emits their GPS location
    // Location update is scoped to the order room — NOT broadcast to all users
    socket.on('updateLocation', async ({ latitude, longitude, userId, orderId }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          isOnline: true,
          socketId: socket.id
        })

        if (user) {
          // If orderId provided, emit only to that order's room (privacy-safe)
          if (orderId) {
            io.to(`order_${orderId}`).emit('updateDeliveryLocation', {
              deliveryBoyId: userId,
              latitude,
              longitude
            })
          } else {
            // Fallback: no orderId, skip broadcast (do not leak to all users)
            console.log(`updateLocation from ${userId} — no orderId provided, skipping emit`)
          }
        }

      } catch (error) {
        console.log('updateDeliveryLocation error', error)
      }
    })

    socket.on('disconnect', async () => {
      try {
        await User.findOneAndUpdate({ socketId: socket.id }, {
          socketId: null,
          isOnline: false
        })
      } catch (error) {
        console.log(error)
      }
    })
  })
}