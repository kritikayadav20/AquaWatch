'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Check, X, MapPin, Filter, BarChart3, Clock, CheckCircle } from 'lucide-react'

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
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-medium">Loading Admin Panel...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-display">Admin Control Center</h1>
                        <p className="text-slate-500 mt-1">Manage and verify community submissions</p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Reviews</CardTitle>
                            <Clock className="w-4 h-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{submissions.filter(s => s.status === 'pending').length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accepted</CardTitle>
                            <CheckCircle className="w-4 h-4 text-primary-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{submissions.filter(s => s.status === 'accepted').length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed (Cleaned)</CardTitle>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{submissions.filter(s => s.status === 'completed').length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reports</CardTitle>
                            <BarChart3 className="w-4 h-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{submissions.length}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900 font-display">Submissions</h2>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            {['all', 'pending', 'accepted', 'completed', 'rejected'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Evidence</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Location & ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Density (AI)</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {filteredSubmissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="relative h-16 w-16 group cursor-pointer overflow-hidden rounded-lg border border-slate-200">
                                                <a href={sub.image_url} target="_blank" rel="noopener noreferrer">
                                                    <img src={sub.image_url} alt="Sub" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </a>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {sub.latitude && sub.longitude ? (
                                                <a
                                                    href={`https://www.google.com/maps?q=${sub.latitude},${sub.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors border border-slate-200"
                                                >
                                                    <MapPin className="w-3 h-3" />
                                                    View Map
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 italic text-xs">No GPS</span>
                                            )}
                                            <div className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-wide">#{sub.id.substring(0, 8)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                            {new Date(sub.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={sub.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {sub.coverage_percent && sub.coverage_percent > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                        <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${sub.coverage_percent}%` }}></div>
                                                    </div>
                                                    <span className="font-bold text-slate-700">{sub.coverage_percent}%</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-xs">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {sub.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            onClick={() => handleStatusChange(sub.id, 'accepted', sub.user_id, sub.coverage_percent)}
                                                            className="h-8 w-8 p-0 rounded-full"
                                                            title="Accept"
                                                            icon={<Check className="w-4 h-4" />}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            onClick={() => handleStatusChange(sub.id, 'rejected', sub.user_id, sub.coverage_percent)}
                                                            className="h-8 w-8 p-0 rounded-full"
                                                            title="Reject"
                                                            icon={<X className="w-4 h-4" />}
                                                        />
                                                    </>
                                                )}
                                                {sub.status === 'accepted' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleStatusChange(sub.id, 'completed', sub.user_id, sub.coverage_percent)}
                                                        className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 w-auto px-3"
                                                        title="Mark as Complete"
                                                        icon={<CheckCircle className="w-4 h-4" />}
                                                    >
                                                        Mark as Complete
                                                    </Button>
                                                )}
                                                {(sub.status === 'completed' || sub.status === 'rejected') && (
                                                    <span className="text-xs text-slate-400 font-medium px-2">No actions</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredSubmissions.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                <p>No submissions found for this filter.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
