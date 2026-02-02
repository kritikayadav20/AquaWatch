'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import SubmissionsMap from '@/components/SubmissionsMap'
import AnalyticsOverview from '@/components/admin/AnalyticsOverview'
import { ValidateCoupon } from '@/components/admin/ValidateCoupon'
import { Check, X, MapPin, Filter, BarChart3, Clock, CheckCircle, ShieldCheck } from 'lucide-react'

type Submission = {
    id: string
    user_id: string
    image_url: string
    status: "pending" | "accepted" | "completed" | "rejected"
    coverage_percent: number
    created_at: string
    latitude: number
    longitude: number
}

export default function AdminDashboard() {
    const router = useRouter()
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')

    useEffect(() => {
        const fetchSubmissions = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Check if admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role !== 'admin') {
                alert("Access Denied: Admins Only")
                router.push('/dashboard')
                return
            }

            const { data } = await supabase
                .from('submissions')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) setSubmissions(data as Submission[])
            setLoading(false)
        }

        fetchSubmissions()
    }, [router])

    const handleStatusChange = async (id: string, newStatus: string, userId: string, currentCoverage: number) => {
        try {
            const coverage = currentCoverage
            const updates: any = { status: newStatus, coverage_percent: coverage }

            const { error } = await supabase
                .from('submissions')
                .update(updates)
                .eq('id', id)

            if (error) throw error

            if (newStatus === 'completed') {
                alert(`Submission marked as complete.`)
            }

            // Send Notification
            const { error: notifyError } = await supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    message: `Your submission status has been updated to: ${newStatus.toUpperCase()}`,
                })

            if (notifyError) console.error("Notification Error:", notifyError)

            // Refresh
            setSubmissions(submissions.map(s => s.id === id ? { ...s, ...updates } : s))

        } catch (e: any) {
            alert('Error updating status: ' + e.message)
        }
    }

    const filteredSubmissions = filter === 'all'
        ? submissions
        : submissions.filter(s => s.status === filter)

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#0a1628]">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary-900 border-t-primary-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-400 font-medium">Loading Admin Panel...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center bg-gradient-to-r from-primary-900/80 via-primary-800/80 to-primary-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-700 shadow-lg shadow-primary-900/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none mix-blend-overlay"></div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="p-4 bg-slate-800/80 rounded-2xl text-primary-400 shadow-sm ring-1 ring-primary-700">
                            <ShieldCheck className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-50 font-display tracking-tight">Admin & Control</h1>
                            <p className="text-slate-300 mt-1 font-medium text-lg">Manage community submissions & impact</p>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="border-none bg-gradient-to-br from-amber-900/50 to-orange-900/50 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 transform hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-amber-300 uppercase tracking-widest">Pending Reviews</CardTitle>
                            <div className="p-2 bg-amber-900/50 rounded-full text-amber-400">
                                <Clock className="w-5 h-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-slate-50 font-display">{submissions.filter(s => s.status === 'pending').length}</div>
                            <p className="text-xs text-amber-300/80 font-medium mt-1">Awaiting verification</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none bg-gradient-to-br from-primary-800/50 to-primary-900/50 shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 transform hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-primary-300 uppercase tracking-widest">Accepted</CardTitle>
                            <div className="p-2 bg-primary-900/50 rounded-full text-primary-400">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-slate-50 font-display">{submissions.filter(s => s.status === 'accepted').length}</div>
                            <p className="text-xs text-primary-300/80 font-medium mt-1">Verified reports</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none bg-gradient-to-br from-emerald-900/50 to-green-900/50 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Completed</CardTitle>
                            <div className="p-2 bg-emerald-900/50 rounded-full text-emerald-400">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-slate-50 font-display">{submissions.filter(s => s.status === 'completed').length}</div>
                            <p className="text-xs text-emerald-300/80 font-medium mt-1">Successfully cleaned</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none bg-gradient-to-br from-violet-900/50 to-purple-900/50 shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 transform hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-violet-300 uppercase tracking-widest">Total Reports</CardTitle>
                            <div className="p-2 bg-violet-900/50 rounded-full text-violet-400">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-slate-50 font-display">{submissions.length}</div>
                            <p className="text-xs text-violet-300/80 font-medium mt-1">All time data</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Analytics Section */}
                <AnalyticsOverview />

                {/* Map View */}
                <div className="h-[400px] bg-slate-800 rounded-3xl shadow-lg shadow-slate-900/50 border border-slate-700 overflow-hidden relative">
                    <SubmissionsMap submissions={filteredSubmissions} />
                </div>

                <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-900/50 border border-slate-700/60 overflow-hidden">
                    <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Filter className="w-5 h-5 text-slate-400" />
                            <h2 className="text-lg font-bold text-slate-50 font-display">Submission Feed</h2>
                        </div>
                        <div className="flex bg-slate-700/80 p-1.5 rounded-full shadow-inner ring-1 ring-slate-600/50">
                            {['all', 'pending', 'accepted', 'completed', 'rejected'].map((f) => {
                                const activeColors: Record<string, string> = {
                                    all: 'bg-slate-600 text-slate-50 shadow-sm',
                                    pending: 'bg-amber-900/50 text-amber-300 shadow-sm ring-1 ring-amber-700',
                                    accepted: 'bg-primary-900/50 text-primary-300 shadow-sm ring-1 ring-primary-700',
                                    completed: 'bg-emerald-900/50 text-emerald-300 shadow-sm ring-1 ring-emerald-700',
                                    rejected: 'bg-rose-900/50 text-rose-300 shadow-sm ring-1 ring-rose-700'
                                }
                                return (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-5 py-2 rounded-full text-xs font-bold capitalize transition-all duration-300 ${filter === f ? activeColors[f] : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                                    >
                                        {f}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                            <thead className="bg-primary-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary-300 uppercase tracking-wider">Evidence</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary-300 uppercase tracking-wider">Location & ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary-300 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-primary-300 uppercase tracking-wider">Density (AI)</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-primary-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800/50 divide-y divide-slate-700">
                                {filteredSubmissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-primary-900/20 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="relative h-16 w-16 group cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-700 shadow-sm ring-1 ring-slate-600">
                                                <a href={sub.image_url} target="_blank" rel="noopener noreferrer">
                                                    <img src={sub.image_url} alt="Sub" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                </a>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {sub.latitude && sub.longitude ? (
                                                <a
                                                    href={`https://www.google.com/maps?q=${sub.latitude},${sub.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-700 text-slate-200 text-xs font-bold hover:bg-primary-900/50 hover:text-primary-300 hover:border-primary-500 transition-all border border-slate-600 group-hover:shadow-sm"
                                                >
                                                    <MapPin className="w-3 h-3" />
                                                    View Map
                                                </a>
                                            ) : (
                                                <span className="text-slate-500 italic text-xs">No GPS</span>
                                            )}
                                            <div className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-wide px-1">ID: {sub.id.substring(0, 8)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 font-medium">
                                            {new Date(sub.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={sub.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {sub.coverage_percent && sub.coverage_percent > 0 ? (
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="font-bold text-slate-50 text-lg leading-none">{sub.coverage_percent}%</span>
                                                    <div className="w-20 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                                        <div className={`h-1.5 rounded-full ${sub.coverage_percent > 75 ? 'bg-red-500' : sub.coverage_percent > 40 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${sub.coverage_percent}%` }}></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 italic text-xs">Calculated</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                {sub.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 shadow-none border-transparent w-9 h-9 p-0"
                                                            onClick={() => handleStatusChange(sub.id, 'accepted', sub.user_id, sub.coverage_percent)}
                                                            title="Accept Submission"
                                                            icon={<Check className="w-5 h-5" />}
                                                            iconPosition="left"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 shadow-none border-transparent w-9 h-9 p-0"
                                                            onClick={() => handleStatusChange(sub.id, 'rejected', sub.user_id, sub.coverage_percent)}
                                                            title="Reject Submission"
                                                            icon={<X className="w-5 h-5" />}
                                                            iconPosition="left"
                                                        />
                                                    </>
                                                )}
                                                {sub.status === 'accepted' && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-primary-100 text-primary-700 hover:bg-primary-200 border-none px-4"
                                                        onClick={() => handleStatusChange(sub.id, 'completed', sub.user_id, sub.coverage_percent)}
                                                        title="Mark as Complete"
                                                        icon={<CheckCircle className="w-4 h-4" />}
                                                    >
                                                        Mark Cleaned
                                                    </Button>
                                                )}
                                                {(sub.status === 'completed' || sub.status === 'rejected') && (
                                                    <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-700 rounded-lg border border-slate-600">Archived</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredSubmissions.length === 0 && (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                    <Filter className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-50 font-display">No submissions found</h3>
                                <p className="text-slate-400 text-sm">Try adjusting your filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
