import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setItemsInMyCity, setLoadingItems } from '../redux/userSlice'

function useGetItemsByCity() {
    const dispatch = useDispatch()
    const { currentCity, shopInMyCity } = useSelector(state => state.user)

    // Re-fetch items whenever city OR shops change (shops may have just been auto-seeded)
    useEffect(() => {
        if (!currentCity) return
        const fetchItems = async () => {
            dispatch(setLoadingItems(true))
            try {
                const result = await axios.get(
                    `${serverUrl}/api/item/get-by-city/${currentCity}`,
                    { withCredentials: true }
                )
                dispatch(setItemsInMyCity(result.data))
            } catch (error) {
                console.log(error)
            } finally {
                dispatch(setLoadingItems(false))
            }
        }
        fetchItems()
    }, [currentCity, shopInMyCity])
}

export default useGetItemsByCity
