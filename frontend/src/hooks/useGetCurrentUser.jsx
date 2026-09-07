import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function useGetCurrentUser() {
    const dispatch = useDispatch()
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true })
                if (result?.data?.token) {
                    localStorage.setItem("zest_token", result.data.token)
                }
                dispatch(setUserData(result.data))
            } catch (error) {
                if (error?.response?.status === 400 || error?.response?.status === 401) {
                    localStorage.removeItem("zest_token")
                }
            }
        }
        fetchUser()
    }, [])
}

export default useGetCurrentUser
