'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Wallet, Plus, MapPin, Calendar, Activity, AlertCircle, Gift } from 'lucide-react'
import { CouponsSection } from '@/components/dashboard/CouponsSection'
import { RedeemModal } from '@/components/dashboard/RedeemModal'
import { ParksSection } from '@/components/dashboard/ParksSection'
import { redeemPoints, getMyCoupons, Coupon } from '@/lib/api'

type Submission = {
    id: string
    image_url: string
    status: "pending" | "approved" | "completed" | "rejected"
    items: unknown
    coverage_percent: number
    created_at: string
}

type Profile = {
    wallet_balance: number
    full_name: string
    role?: string
}

export default function Dashboard() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [isRedeemOpen, setIsRedeemOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    const handleRedeem = async (points: number) => {
        if (!user) return
        try {
            const newCoupon = await redeemPoints(user.id, points)
            setCoupons([newCoupon, ...coupons])
            // Update profile balance
            if (profile) {
                setProfile({ ...profile, wallet_balance: profile.wallet_balance - points })
            }
            alert(`Coupon Generated: ${newCoupon.code}`)
        } catch (error: any) {
            alert(error.message || "Redemption failed")
        }
    }

    const refreshData = async () => {
        if (user) {
            try {
                const userCoupons = await getMyCoupons(user.id)
                setCoupons(userCoupons)
            } catch (e) { console.error(e) }
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)

            // Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            setProfile(profileData)

            // Fetch Submissions
            const { data: submissionData } = await supabase
                .from('submissions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (submissionData) {
                setSubmissions(submissionData as Submission[])
            }

            // Fetch Coupons
            try {
                const userCoupons = await getMyCoupons(user.id)
                setCoupons(userCoupons)
            } catch (error) {
                console.error("Failed to fetch coupons", error)
            }

            setLoading(false)
        }

        fetchData()
    }, [router])

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#0a1628]">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary-900 border-t-primary-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-400 font-medium">Loading Dashboard...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-enter">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-50 font-display">Dashboard</h1>
                        <p className="text-slate-400 mt-2 text-lg">Welcome back, <span className="font-semibold text-slate-200">{profile?.full_name || user?.email}</span></p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            className="bg-pink-600 hover:bg-pink-700 text-white border-pink-700 shadow-md shadow-pink-500/20"
                            icon={<Gift className="w-5 h-5" />}
                            onClick={() => setIsRedeemOpen(true)}
                        >
                            Redeem Points
                        </Button>
                        <Button
                            variant="outline"
                            onClick={async () => {
                                await supabase.auth.signOut()
                                router.refresh()
                            }}
                        >
                            Sign Out
                        </Button>
                        <Link href="/submit">
                            <Button size="lg" icon={<Plus className="w-5 h-5" />} className="shadow-lg shadow-primary-500/20">
                                New Report
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-enter delay-100">
                    <Card variant="glass" className="border-l-4 border-l-primary-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider font-sans">Wallet Balance</CardTitle>
                            <div className="p-2 bg-primary-900/50 rounded-lg text-primary-400">
                                <Wallet className="w-5 h-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-50 font-display">{profile?.wallet_balance || 0}</div>
                            <p className="text-xs text-slate-400 mt-1">Available points to redeem <span className="text-primary-400 font-semibold">(1 Point = ₹10)</span></p>
                        </CardContent>
                    </Card>

                    <Card variant="glass" className="border-l-4 border-l-primary-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider font-sans">Total Reports</CardTitle>
                            <div className="p-2 bg-primary-900/50 rounded-lg text-primary-400">
                                <Activity className="w-5 h-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-50 font-display">{submissions.length}</div>
                            <p className="text-xs text-slate-400 mt-1">Active contributions</p>
                        </CardContent>
                    </Card>

                    {/* Impact Card */}
                    <Card className="bg-gradient-to-br from-primary-900 to-primary-800 text-white border-none shadow-xl hover:-translate-y-1 transition-transform duration-300">
                        <CardContent className="h-full flex flex-col justify-center pt-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-1.5 bg-white/10 rounded-full">
                                    <AlertCircle className="w-4 h-4 text-primary-200" />
                                </div>
                                <span className="font-medium text-primary-100">Impact Status</span>
                            </div>
                            <p className="text-sm text-slate-200 leading-relaxed">
                                Your reports have helped clear an estimated <span className="text-white font-bold">120 sq ft</span> of invasive species this month. Keep it up!
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Coupons Section */}
                <div className="animate-enter delay-200">
                    <CouponsSection coupons={coupons} />
                </div>

                {/* Parks Redemption Section - Users Only */}
                {profile?.role !== 'admin' && (
                    <div className="animate-enter delay-300">
                        <ParksSection
                            userId={user?.id || ''}
                            activeCoupons={coupons.filter(c => c.status === 'active')}
                            onTicketRedeemed={refreshData}
                        />
                    </div>
                )}

                <RedeemModal
                    isOpen={isRedeemOpen}
                    onClose={() => setIsRedeemOpen(false)}
                    onRedeem={handleRedeem}
                    maxPoints={profile?.wallet_balance || 0}
                />

                {/* Recent Submissions */}
                <div className="space-y-6 animate-enter delay-500">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-50 font-display">Recent Activity</h2>
                        {submissions.length > 0 && (
                            <span className="px-3 py-1 rounded-full bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600">
                                {submissions.length} Reports
                            </span>
                        )}
                    </div>

                    {submissions.length === 0 ? (
                        <div className="text-center py-20 bg-slate-800/60 backdrop-blur-md rounded-[2rem] border border-dashed border-slate-600 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                <MapPin className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-50 mb-2 font-display">No reports yet</h3>
                            <p className="text-slate-400 mb-8 max-w-sm mx-auto">Start visible contributions to the community by reporting water hyacinth in your area.</p>
                            <Link href="/submit">
                                <Button variant="outline">Submit your first report</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {submissions.map((sub) => (
                                <Card key={sub.id} variant="interactive" className="overflow-hidden group flex flex-col h-full border-slate-200/60">
                                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                                        <img
                                            src={sub.image_url}
                                            alt="Submission"
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                                        <div className="absolute top-3 right-3">
                                            <StatusBadge status={sub.status} className="shadow-sm backdrop-blur-md bg-white/90" />
                                        </div>
                                        <div className="absolute bottom-3 left-3 text-white">
                                            <div className="flex items-center gap-1.5 text-xs font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(sub.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <CardContent className="flex-grow flex flex-col justify-between pt-5 pb-5">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-50">Lake/Water Body</h4>
                                            </div>
                                            <p className="text-sm text-slate-400 line-clamp-2">
                                                Reported at coordinates: {Number(sub.items) || 'Locating...'}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-700">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Density</span>
                                                <span className="text-lg font-bold text-primary-400">{sub.coverage_percent.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="bg-primary-500 h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${sub.coverage_percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

