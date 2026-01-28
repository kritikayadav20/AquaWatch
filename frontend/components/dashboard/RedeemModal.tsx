import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, Gift } from 'lucide-react'

type RedeemModalProps = {
    isOpen: boolean
    onClose: () => void
    onRedeem: (points: number) => Promise<void>
    maxPoints: number
}

export function RedeemModal({ isOpen, onClose, onRedeem, maxPoints }: RedeemModalProps) {
    const [points, setPoints] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        const pointsNum = parseInt(points)

        if (isNaN(pointsNum) || pointsNum <= 0) {
            setError("Please enter a valid number of points")
            return
        }

        if (pointsNum > maxPoints) {
            setError(`You only have ${maxPoints} points available`)
            return
        }

        setLoading(true)
        try {
            await onRedeem(pointsNum)
            onClose()
            setPoints('')
        } catch (err: any) {
            setError(err.message || "Failed to redeem")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-2 text-slate-800">
                        <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                            <Gift className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold font-display">Redeem Points</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-slate-600 mb-6">
                        Convert your hard-earned points into rewards!
                        <br />
                        <span className="font-semibold text-pink-600">100 Points = ₹1000 Value (Ratio 1:10)</span>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Points to Redeem
                            </label>
                            <Input
                                type="number"
                                placeholder="Enter points (e.g. 50)"
                                value={points}
                                onChange={(e) => setPoints(e.target.value)}
                                min="1"
                                max={maxPoints}
                                required
                            />
                            <div className="mt-2 flex justify-between text-xs text-slate-500">
                                <span>Available: <span className="font-bold text-slate-800">{maxPoints}</span></span>
                                {points && !isNaN(parseInt(points)) && (
                                    <span className="font-medium text-green-600">
                                        Value: ₹{parseInt(points) * 10}
                                    </span>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                                isLoading={loading}
                            >
                                {loading ? 'Redeeming...' : 'Confirm Redemption'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
