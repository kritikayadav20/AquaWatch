'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import MapPlaceholder from '@/components/MapPlaceholder'
import { Upload, Camera, MapPin, CheckCircle, Loader2, Navigation, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api'

// Define libraries outside component to prevent re-loading
const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["places"]

const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '1rem'
}

const defaultCenter = {
    lat: 22.5726, // Default to Kolkata or generic center
    lng: 88.3639
}

export default function SubmitPage() {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Location State
    const [locationMode, setLocationMode] = useState<'auto' | 'manual'>('auto')
    const [manualLocation, setManualLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
    const [mapCenter, setMapCenter] = useState(defaultCenter)
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: libraries
    })

    // Auto-detect user location on load for map center
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }
                    setMapCenter(pos)
                },
                () => {
                    console.warn("Location permission denied or error.")
                }
            )
        }
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0]
            setFile(f)
            setPreview(URL.createObjectURL(f))
        }
    }

    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace()
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat()
                const lng = place.geometry.location.lng()
                setManualLocation({
                    lat,
                    lng,
                    address: place.formatted_address || "Custom Location"
                })
                setMapCenter({ lat, lng })
            }
        }
    }

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            setManualLocation({
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
                address: "Pinned Location"
            })
        }
    }, [])

    const handleSubmit = async () => {
        if (!file) {
            alert("Please upload an image of the water body first.")
            return
        }
        if (locationMode === 'manual' && !manualLocation) {
            alert("Please select a location on the map.")
            return
        }

        setLoading(true)
        setUploading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Upload Image
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}/${Date.now()}.${fileExt}`
            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(fileName)

            // Determine Location
            let lat = 0, lng = 0

            if (locationMode === 'auto') {
                if (navigator.geolocation) {
                    try {
                        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject)
                        })
                        lat = pos.coords.latitude
                        lng = pos.coords.longitude
                    } catch (e) {
                        console.warn("Geolocation failed", e)
                        // Fallback?
                        if (!confirm("Could not detect location automatically. Continue with 0,0?")) {
                            throw new Error("Location detection failed.")
                        }
                    }
                }
            } else {
                // Manual Mode
                lat = manualLocation!.lat
                lng = manualLocation!.lng
            }

            // Call Python API for analysis
            let coveragePercent = 0
            try {
                const formData = new FormData()
                formData.append('file', file)

                const response = await fetch('http://localhost:8000/api/analyze', {
                    method: 'POST',
                    body: formData,
                })

                if (response.ok) {
                    const data = await response.json()
                    coveragePercent = data.coverage_percent
                } else {
                    console.error('AI Analysis failed')
                }
            } catch (err) {
                console.error('Failed to connect to AI backend', err)
            }

            // Create Submission
            const { error: insertError } = await supabase
                .from('submissions')
                .insert({
                    user_id: user.id,
                    image_url: publicUrl,
                    latitude: lat,
                    longitude: lng,
                    status: 'pending',
                    coverage_percent: coveragePercent
                })

            if (insertError) throw insertError

            // AWARD POINTS if coverage >= 40%
            if (coveragePercent >= 40) {
                const points = Math.round(coveragePercent / 10)

                const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single()
                const newBalance = (profile?.wallet_balance || 0) + points

                await supabase
                    .from('profiles')
                    .update({ wallet_balance: newBalance })
                    .eq('id', user.id)

                alert(`Great job! You earned ${points} points for this report!`)
            }

            // Create Notification about initial points
            if (coveragePercent >= 40) {
                await supabase.from('notifications').insert({
                    user_id: user.id,
                    message: `You earned points for reporting high density (>${coveragePercent}%) water hyacinth!`
                })
            }

            router.push('/dashboard')
        } catch (error: any) {
            alert('Error submitting report: ' + error.message)
        } finally {
            setLoading(false)
            setUploading(false)
        }
    }


    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-5 duration-500">
                <h1 className="text-4xl font-bold text-slate-900 mb-2 font-display text-balance">Submit a New Report</h1>
                <p className="text-slate-500 text-lg">Help us track water hyacinth spread in your area</p>
            </div>

            <div className="grid gap-8">
                {/* Step 1: Image Upload */}
                <Card className="p-8 relative overflow-hidden group hover:border-primary-200 transition-colors duration-300">
                    <div className="absolute top-0 left-0 bg-primary-600 text-white px-4 py-1 rounded-br-2xl text-sm font-bold shadow-md z-10">Step 01</div>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Camera className="w-24 h-24 text-primary-600" />
                    </div>

                    <h2 className="text-2xl font-bold mb-6 text-slate-900 font-display mt-4 flex items-center gap-3">
                        <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                            <Camera className="w-6 h-6" />
                        </div>
                        Upload Evidence
                    </h2>

                    <div
                        className={cn(
                            "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 relative group/upload",
                            preview ? "border-primary-200 bg-primary-50/10" : "border-slate-200 hover:bg-slate-50 hover:border-primary-300"
                        )}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {preview ? (
                            <div className="relative inline-block rounded-xl overflow-hidden shadow-xl transform group-hover/upload:scale-[1.02] transition-transform duration-300">
                                <img src={preview} alt="Preview" className="max-h-96 mx-auto object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity backdrop-blur-sm">
                                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-medium border border-white/20 flex items-center gap-2">
                                        <Upload className="w-4 h-4" /> Change Photo
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-slate-500 py-8">
                                <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-2 group-hover/upload:scale-110 transition-transform duration-300 shadow-sm text-primary-600">
                                    <Upload className="w-10 h-10" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-slate-700">Click to upload photo</p>
                                    <p className="text-sm font-medium">or drag and drop here</p>
                                </div>
                                <p className="text-xs px-3 py-1 bg-slate-100 rounded-full font-medium mt-2 text-slate-400">Supports JPG, PNG</p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                </Card>

                {/* Step 2: Location */}
                <Card className="p-8 relative overflow-hidden group hover:border-secondary-200 transition-colors duration-300">
                    <div className="absolute top-0 left-0 bg-slate-800 text-white px-4 py-1 rounded-br-2xl text-sm font-bold shadow-md z-10">Step 02</div>

                    <div className="md:flex justify-between items-center mb-6 mt-4">
                        <h2 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                <MapPin className="w-6 h-6" />
                            </div>
                            Confirm Location
                        </h2>
                        <div className="flex bg-slate-100 p-1 rounded-lg mt-4 md:mt-0">
                            <button
                                onClick={() => setLocationMode('auto')}
                                className={cn("px-4 py-2 rounded-md text-sm font-medium transition-all", locationMode === 'auto' ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-900")}
                            >
                                Auto-Detect
                            </button>
                            <button
                                onClick={() => setLocationMode('manual')}
                                className={cn("px-4 py-2 rounded-md text-sm font-medium transition-all", locationMode === 'manual' ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-900")}
                            >
                                Select on Map
                            </button>
                        </div>
                    </div>

                    {locationMode === 'auto' ? (
                        <>
                            <div className="h-40 rounded-2xl overflow-hidden shadow-inner border border-slate-200 relative group/map bg-slate-50 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600 animate-pulse">
                                        <Navigation className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-600">Automatic Location Active</p>
                                    <p className="text-xs text-slate-400">We'll grab your GPS coordinates on submit.</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <CheckCircle className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">High Precision GPS</p>
                                    <p className="text-sm text-slate-500">To change location manually, switch to "Select on Map".</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            {isLoaded ? (
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                                        <Autocomplete
                                            onLoad={ref => { autocompleteRef.current = ref }}
                                            onPlaceChanged={onPlaceChanged}
                                        >
                                            <input
                                                type="text"
                                                placeholder="Search for a location..."
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </Autocomplete>
                                    </div>

                                    <div className="h-96 rounded-2xl overflow-hidden border border-slate-200 relative">
                                        <GoogleMap
                                            mapContainerStyle={mapContainerStyle}
                                            center={mapCenter}
                                            zoom={15}
                                            onClick={onMapClick}
                                            options={{
                                                streetViewControl: false,
                                                mapTypeControl: false,
                                            }}
                                        >
                                            {manualLocation && (
                                                <Marker
                                                    position={manualLocation}
                                                    draggable={true}
                                                    onDragEnd={(e) => {
                                                        if (e.latLng) {
                                                            setManualLocation(prev => ({ ...prev!, lat: e.latLng!.lat(), lng: e.latLng!.lng() }))
                                                        }
                                                    }}
                                                />
                                            )}
                                        </GoogleMap>
                                        {!manualLocation && (
                                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs backdrop-blur-md">
                                                Click map to pin
                                            </div>
                                        )}
                                    </div>
                                    {manualLocation && (
                                        <div className="text-xs text-slate-500 text-center">
                                            Selected: {manualLocation.lat.toFixed(6)}, {manualLocation.lng.toFixed(6)}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200">
                                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                                    <span className="ml-2 text-slate-500">Loading Maps...</span>
                                </div>
                            )}
                        </div>
                    )}
                </Card>

                <div className="sticky bottom-4 z-20 pt-4">
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        size="lg"
                        className="w-full text-lg h-16 shadow-xl shadow-primary-900/10"
                        isLoading={loading}
                    >
                        {uploading ? 'Analyzing & Submitting...' : 'Submit Report'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
