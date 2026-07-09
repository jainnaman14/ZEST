import { createSlice, current } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    currentCity: null,
    currentState: null,
    currentAddress: null,
    shopInMyCity: null,
    itemsInMyCity: null,
    cartItems: [],
    totalAmount: 0,
    myOrders: [],
    searchItems: null,
    socket: null,
    locationError: false,
    loadingItems: false,
    loadingShops: false
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload
    },
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload
    },
    setShopsInMyCity: (state, action) => {
      const payload = action.payload
      // Support plain array assignment (initial fetch)
      if (Array.isArray(payload)) {
        state.shopInMyCity = payload
        return
      }
      // Real-time: add or update a shop in city list
      if (payload?.type === 'ADD_OR_UPDATE') {
        const shop = payload.shop
        if (!state.shopInMyCity) {
          state.shopInMyCity = [shop]
          return
        }
        const idx = state.shopInMyCity.findIndex(s => s._id === shop._id)
        if (idx >= 0) {
          state.shopInMyCity[idx] = shop
        } else {
          state.shopInMyCity = [shop, ...state.shopInMyCity]
        }
        return
      }
      // Real-time: toggle isOpen for a shop
      if (payload?.type === 'UPDATE_STATUS') {
        if (!state.shopInMyCity) return
        const idx = state.shopInMyCity.findIndex(s => s._id === payload.shopId)
        if (idx >= 0) {
          state.shopInMyCity[idx] = { ...state.shopInMyCity[idx], isOpen: payload.isOpen }
        }
        return
      }
      // Fallback
      state.shopInMyCity = payload
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload
    },
    setSocket: (state, action) => {
      state.socket = action.payload
    },
    addToCart: (state, action) => {
      const cartItem = action.payload
      const existingItem = state.cartItems.find(i => i.id == cartItem.id)
      if (existingItem) {
        existingItem.quantity += cartItem.quantity
      } else {
        state.cartItems.push(cartItem)
      }

      state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

    },

    setTotalAmount: (state, action) => {
      state.totalAmount = action.payload
    }

    ,

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.cartItems.find(i => i.id == id)
      if (item) {
        item.quantity = quantity
      }
      state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    },

    removeCartItem: (state, action) => {
      state.cartItems = state.cartItems.filter(i => i.id !== action.payload)
      state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    },

    setMyOrders: (state, action) => {
      state.myOrders = action.payload
    },
    addMyOrder: (state, action) => {
      state.myOrders = [action.payload, ...state.myOrders]
    }

    ,
    updateOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload
      const order = state.myOrders.find(o => o._id == orderId)
      if (order) {
        if (order.shopOrders && order.shopOrders.shop._id == shopId) {
          order.shopOrders.status = status
        }
      }
    },

    updateRealtimeOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload
      const order = state.myOrders.find(o => o._id == orderId)
      if (order) {
        const shopOrder = order.shopOrders.find(so => so.shop._id == shopId)
        if (shopOrder) {
          shopOrder.status = status
        }
      }
    },

    setSearchItems: (state, action) => {
      state.searchItems = action.payload
    },

    clearCart: (state) => {
      state.cartItems = []
      state.totalAmount = 0
    },

    setLocationError: (state, action) => {
      state.locationError = action.payload
    },

    setLoadingItems: (state, action) => {
      state.loadingItems = action.payload
    },

    setLoadingShops: (state, action) => {
      state.loadingShops = action.payload
    }
  }
})

export const { setUserData, setCurrentAddress, setCurrentCity, setCurrentState, setShopsInMyCity, setItemsInMyCity, addToCart, updateQuantity, removeCartItem, setMyOrders, addMyOrder, updateOrderStatus, setSearchItems, setTotalAmount, setSocket, updateRealtimeOrderStatus, clearCart, setLocationError, setLoadingItems, setLoadingShops } = userSlice.actions
export default userSlice.reducer