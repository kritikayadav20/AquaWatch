'use client'

import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { useState, useCallback, useMemo } from 'react'
// import { Submission } from '@/types/supabase'
import { ArrowRight, Calendar, MapPin } from 'lucide-react'

// Define libraries outside component
const libraries: ("places")[] = ["places"]

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1rem'
}

type MapProps = {
    submissions: any[]
    center?: { lat: number, lng: number }
    zoom?: number
}

export default function SubmissionsMap({ submissions, center, zoom }: MapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script-main',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: libraries
    })

    const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null)
    const [map, setMap] = useState<google.maps.Map | null>(null)

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map)
    }, [])

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null)
    }, [])

    // Default center (Kolkata) if none provided
    const defaultCenter = useMemo(() => ({ lat: 22.5726, lng: 88.3639 }), [])

    const markers = useMemo(() => {
        return submissions.filter(s => s.latitude && s.longitude).map(sub => ({
            ...sub,
            position: { lat: sub.latitude, lng: sub.longitude }
        }))
    }, [submissions])

    if (!isLoaded) return <div className="w-full h-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400">Loading Map...</div>

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center || defaultCenter}
            zoom={zoom || 11}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                ]
            }}
        >
            {markers.map((sub) => (
                <Marker
                    key={sub.id}
                    position={sub.position}
                    onClick={() => setSelectedSubmission(sub)}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: sub.status === 'completed' ? '#10b981' : (sub.coverage_percent > 50 ? '#ef4444' : '#f59e0b'),
                        fillOpacity: 0.9,
                        strokeWeight: 1,
                        strokeColor: '#ffffff',
                        scale: 8
                    }}
                />
            ))}

            {selectedSubmission && (
                <InfoWindow
                    position={selectedSubmission.position}
                    onCloseClick={() => setSelectedSubmission(null)}
                >
                    <div className="p-2 min-w-[200px]">
                        <div className="h-32 w-full rounded-lg overflow-hidden mb-3 bg-slate-100">
                            <img src={selectedSubmission.image_url} alt="Evidence" className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mb-1">Status: <span className="capitalize">{selectedSubmission.status}</span></h3>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(selectedSubmission.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                            <MapPin className="w-3 h-3" />
                            Density: {selectedSubmission.coverage_percent}%
                        </div>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    )
}
