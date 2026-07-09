import React, { useEffect, useRef } from 'react'
import scooter from "../assets/scooter.png"
import home from "../assets/home.png"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'

const deliveryBoyIcon = new L.Icon({
    iconUrl: scooter,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44]
})

const customerIcon = new L.Icon({
    iconUrl: home,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
})

// Auto-fit bounds when locations change
function BoundsUpdater({ positions }) {
    const map = useMap()
    useEffect(() => {
        if (positions.every(p => p[0] && p[1])) {
            try {
                const bounds = L.latLngBounds(positions)
                map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
            } catch (e) { }
        }
    }, [positions, map])
    return null
}

function DeliveryBoyTracking({ data }) {
    const deliveryBoyLat = data.deliveryBoyLocation?.lat
    const deliveryBoylon = data.deliveryBoyLocation?.lon
    const customerLat = data.customerLocation?.lat
    const customerlon = data.customerLocation?.lon

    if (!deliveryBoyLat || !customerLat) {
        return (
            <div className='w-full h-[300px] bg-slate-100 flex items-center justify-center text-slate-400 text-sm'>
                Waiting for location data…
            </div>
        )
    }

    const path = [
        [deliveryBoyLat, deliveryBoylon],
        [customerLat, customerlon]
    ]

    const center = [
        (deliveryBoyLat + customerLat) / 2,
        (deliveryBoylon + customerlon) / 2
    ]

    // Calculate distance (rough)
    const R = 6371
    const dLat = (customerLat - deliveryBoyLat) * Math.PI / 180
    const dLon = (customerlon - deliveryBoylon) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(deliveryBoyLat * Math.PI / 180) * Math.cos(customerLat * Math.PI / 180) * Math.sin(dLon / 2) ** 2
    const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const etaMin = Math.max(2, Math.round(distKm / 0.4)) // 24 km/h average

    return (
        <div>
            {/* ETA banner */}
            <div className='px-4 py-2 bg-green-50 flex items-center justify-between text-sm border-b border-green-100'>
                <span className='text-slate-600'>Distance: <span className='font-bold text-slate-900'>{distKm.toFixed(1)} km</span></span>
                <span className='font-bold text-[#16a34a]'>ETA: ~{etaMin} min</span>
            </div>

            <div className='w-full h-[300px]'>
                <MapContainer
                    className="w-full h-full"
                    center={center}
                    zoom={14}
                    zoomControl={true}
                    attributionControl={false}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Dashed route line */}
                    <Polyline
                        positions={path}
                        pathOptions={{ color: '#16a34a', weight: 4, dashArray: '10 6', opacity: 0.8 }}
                    />

                    {/* Delivery boy marker */}
                    <Marker position={[deliveryBoyLat, deliveryBoylon]} icon={deliveryBoyIcon}>
                        <Popup>
                            <div className='text-center'>
                                <p className='font-bold text-sm'>🛵 Delivery Partner</p>
                                <p className='text-xs text-gray-500'>On the way to you</p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Customer marker */}
                    <Marker position={[customerLat, customerlon]} icon={customerIcon}>
                        <Popup>
                            <div className='text-center'>
                                <p className='font-bold text-sm'>🏠 Delivery Address</p>
                            </div>
                        </Popup>
                    </Marker>

                    <BoundsUpdater positions={path} />
                </MapContainer>
            </div>
        </div>
    )
}

export default DeliveryBoyTracking
