import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { adminRedeemCoupon } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Ticket, CheckCircle, AlertTriangle } from 'lucide-react'

export function ValidateCoupon() {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ status: 'success' | 'error', message: string, value?: number } | null>(null)

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code) return

        setLoading(true)
        setResult(null)

        try {
            const coupon = await adminRedeemCoupon(code)
            setResult({
                status: 'success',
                message: `Coupon Redeemed Successfully!`,
                value: coupon.value_rupees
            })
            setCode('')
        } catch (err: any) {
            setResult({
                status: 'error',
                message: err.message || "Invalid Coupon"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-l-4 border-l-purple-500 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Validate Coupon</CardTitle>
                <Ticket className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
                <form onSubmit={handleRedeem} className="space-y-4">
                    <div>
                        <Input
                            placeholder="Enter Coupon Code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="font-mono uppercase placeholder:normal-case"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        isLoading={loading}
                    >
                        Validate & Mark Redeemed
                    </Button>
                </form>

                {result && (
                    <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 text-sm ${result.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {result.status === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                        <div>
                            <p className="font-bold">{result.message}</p>
                            {result.value && <p>Value: ₹{result.value}</p>}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
