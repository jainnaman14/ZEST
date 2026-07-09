import axios from 'axios'
import { useEffect, useRef } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setItemsInMyCity, setLoadingItems, setLoadingShops, setShopsInMyCity } from '../redux/userSlice'

/**
 * Runs once whenever currentCity changes.
 * 1. Fetches shops for that city.
 * 2. If the city has no restaurants yet, silently seeds 6 starter restaurants,
 *    then re-fetches — so the user always sees food without any manual steps.
 */
function useGetShopByCity() {
    const dispatch = useDispatch()
    const { currentCity } = useSelector(state => state.user)
    const seeding = useRef(false)

    useEffect(() => {
        if (!currentCity) return

        const load = async () => {
            dispatch(setLoadingShops(true))
            try {
                const result = await axios.get(
                    `${serverUrl}/api/shop/get-by-city/${currentCity}`,
                    { withCredentials: true }
                )
                const shops = result.data

                if (shops.length === 0 && !seeding.current) {
                    // City is empty — silently seed starter restaurants
                    seeding.current = true
                    try {
                        // derive state from city (best-effort; seed route accepts any string)
                        await axios.post(`${serverUrl}/api/seed/seed-city`, {
                            city: currentCity,
                            state: currentCity   // seed route stores it as-is
                        })
                        // re-fetch after seeding
                        const after = await axios.get(
                            `${serverUrl}/api/shop/get-by-city/${currentCity}`,
                            { withCredentials: true }
                        )
                        dispatch(setShopsInMyCity(after.data))
                    } catch (e) {
                        console.log('auto-seed error', e)
                        dispatch(setShopsInMyCity([]))
                    } finally {
                        seeding.current = false
                    }
                } else {
                    dispatch(setShopsInMyCity(shops))
                }
            } catch (error) {
                console.log(error)
            } finally {
                dispatch(setLoadingShops(false))
            }
        }

        load()
    }, [currentCity])
}

export default useGetShopByCity
