import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentAddress, setCurrentCity, setCurrentState, setLocationError } from '../redux/userSlice'
import { setAddress, setLocation } from '../redux/mapSlice'

function useGetCity() {
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
    const apiKey = import.meta.env.VITE_GEOAPIKEY

    useEffect(() => {
        if (!navigator.geolocation) {
            dispatch(setLocationError(true))
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                dispatch(setLocationError(false))
                const latitude = position.coords.latitude
                const longitude = position.coords.longitude
                dispatch(setLocation({ lat: latitude, lon: longitude }))
                try {
                    const result = await axios.get(
                        `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
                    )
                    const r = result?.data?.results[0]
                    const cityVal = r?.city || r?.county || r?.state || "Bangalore"
                    dispatch(setCurrentCity(cityVal))
                    dispatch(setCurrentState(r?.state || "Karnataka"))
                    dispatch(setCurrentAddress(r?.address_line2 || r?.address_line1 || "Bangalore, India"))
                    dispatch(setAddress(r?.address_line2 || "Bangalore"))
                } catch (err) {
                    console.log('geocode error, falling back to Bangalore', err)
                    dispatch(setCurrentCity("Bangalore"))
                    dispatch(setLocationError(true))
                }
            },
            (error) => {
                // Permission denied or unavailable — fallback to Bangalore and show prompt
                console.log('Geolocation error, falling back to Bangalore:', error.message)
                dispatch(setCurrentCity("Bangalore"))
                dispatch(setLocationError(true))
            },
            { timeout: 10000 }
        )
    }, [userData])
}

export default useGetCity
