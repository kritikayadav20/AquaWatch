import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Park, Coupon, getParks, redeemParkTicket } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MapPin, Ticket, AlertCircle, CheckCircle } from 'lucide-react'

type ParksSectionProps = {
    userId: string
    activeCoupons: Coupon[]
    onTicketRedeemed: () => void
}

export function ParksSection({ userId, activeCoupons, onTicketRedeemed }: ParksSectionProps) {
    const [parks, setParks] = useState<Park[]>([])
    const [loading, setLoading] = useState(true)
    const [redeeming, setRedeeming] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (isOpen && parks.length === 0) {
            getParks().then(setParks).catch(console.error).finally(() => setLoading(false))
        }
    }, [isOpen])

    const handleRedeem = async (park: Park) => {
        // Find best fit coupon (first one that covers price)
        const validCoupon = activeCoupons.find(c => c.value_rupees >= park.ticket_price)

        if (!validCoupon) {
            alert(`You need a coupon worth at least ₹${park.ticket_price} to redeem this ticket.`)
            return
        }

        if (!confirm(`Redeem ticket for ${park.name} using coupon ${validCoupon.code} (Value: ₹${validCoupon.value_rupees})?`)) {
            return
        }

        setRedeeming(true)
        try {
            const ticket = await redeemParkTicket(userId, park.id, validCoupon.code)
            alert(`Success! Ticket ID: ${ticket.id}\nStatus: ${ticket.ticket_status}`)
            onTicketRedeemed() // Refresh parent state
            setIsOpen(false)
        } catch (e: any) {
            alert(e.message)
        } finally {
            setRedeeming(false)
        }
    }

    return (
        <>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-full text-green-600">
                        <Ticket className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 font-display">Park & Garden Tickets</h2>
                        <p className="text-slate-500 text-sm">Use your active coupons to get entry tickets.</p>
                    </div>
                </div>
                <Button onClick={() => setIsOpen(true)} className="bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-500/20">
                    Browse Parks
                </Button>
            </div>

            {isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
                            <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                                <Ticket className="w-5 h-5 text-green-600" />
                                Available Parks
                            </h3>
                            <div className="flex gap-2">
                                <p className="text-sm text-slate-500 self-center hidden md:block">Active Coupons: <span className="font-bold text-slate-900">{activeCoupons.length}</span></p>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900">
                                    <span className="sr-only">Close</span>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 bg-slate-50">
                            {loading ? (
                                <div className="text-center py-10">Loading park availability...</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {parks.map(park => {
                                        const canAfford = activeCoupons.some(c => c.value_rupees >= park.ticket_price)
                                        return (
                                            <Card key={park.id} className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow bg-white flex flex-col">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="flex justify-between items-start">
                                                        <span className="font-bold text-lg">{park.name}</span>
                                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">₹{park.ticket_price}</span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex-grow flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-center text-sm text-slate-500 mb-2">
                                                            <MapPin className="w-4 h-4 mr-1" />
                                                            {park.city}, {park.state}
                                                        </div>
                                                        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{park.description}</p>
                                                    </div>

                                                    <div className="mt-auto pt-2">
                                                        <Button
                                                            className={`w-full ${canAfford ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-300 cursor-not-allowed'}`}
                                                            onClick={() => handleRedeem(park)}
                                                            disabled={!canAfford || redeeming}
                                                        >
                                                            {redeeming ? 'Processing...' : canAfford ? 'Redeem Ticket' : 'Insufficient Coupon'}
                                                        </Button>
                                                        {!canAfford && activeCoupons.length > 0 && (
                                                            <p className="text-[10px] text-red-400 mt-1 text-center font-medium">
                                                                Max coupon: ₹{Math.max(...activeCoupons.map(c => c.value_rupees), 0)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}
