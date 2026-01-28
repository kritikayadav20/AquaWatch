import { Coupon } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Ticket, Clock, CheckCircle, XCircle } from 'lucide-react'

type CouponsSectionProps = {
    coupons: Coupon[]
}

export function CouponsSection({ coupons }: CouponsSectionProps) {
    if (coupons.length === 0) return null

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 font-display">My Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((coupon) => (
                    <Card key={coupon.id} className="border-l-4 border-l-pink-500 overflow-hidden relative group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Ticket className="w-24 h-24 text-pink-500 transform rotate-12" />
                        </div>

                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-mono font-bold text-slate-800 tracking-wider">
                                    {coupon.code}
                                </CardTitle>
                                {coupon.status === 'active' && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Active</span>}
                                {coupon.status === 'redeemed' && <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> Redeemed</span>}
                                {coupon.status === 'expired' && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Expired</span>}
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Value</p>
                                    <p className="text-2xl font-bold text-pink-600">₹{coupon.value_rupees}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400">Points Used</p>
                                    <p className="text-sm font-medium text-slate-600">{coupon.points_used} pts</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                                <span>{new Date(coupon.created_at).toLocaleDateString()}</span>
                                <span className="hover:text-pink-600 cursor-pointer transition-colors" title="Copy Code" onClick={() => navigator.clipboard.writeText(coupon.code)}>Copy Code</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
