'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import { Loader2, TrendingUp, AlertTriangle, PieChart as PieIcon } from 'lucide-react'

// Define Types
type SeverityData = { name: string; severity: number }
type TrendData = { date: string; average_coverage: number }
type StatusData = { name: string; value: number; color: string }

export default function AnalyticsOverview() {
    const [severityData, setSeverityData] = useState<SeverityData[]>([])
    const [trendData, setTrendData] = useState<TrendData[]>([])
    const [statusData, setStatusData] = useState<StatusData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

                const [sevRes, trendRes, statusRes] = await Promise.all([
                    fetch(`${baseUrl}/analytics/severity`),
                    fetch(`${baseUrl}/analytics/trend`),
                    fetch(`${baseUrl}/analytics/status`)
                ])

                if (sevRes.ok) setSeverityData(await sevRes.json())
                if (trendRes.ok) setTrendData(await trendRes.json())
                if (statusRes.ok) setStatusData(await statusRes.json())

            } catch (error) {
                console.error("Failed to fetch analytics", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map(i => (
                    <Card key={i} className="h-80 bg-slate-50 border-none" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-enter delay-100">
            <h2 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
                Analytics Overview
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Infestation Severity by Area */}
                <Card variant="glass" className="col-span-1 lg:col-span-1 border-rose-100/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-rose-600 uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            High Risk Areas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={severityData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f1f5f9' }}
                                />
                                <Bar dataKey="severity" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 2. Infestation Trend Over Time */}
                <Card variant="glass" className="col-span-1 lg:col-span-1 border-sky-100/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-sky-600 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Infestation Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCoverage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="average_coverage" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 3. Cleanup Status Distribution */}
                <Card variant="glass" className="col-span-1 lg:col-span-1 border-emerald-100/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                            <PieIcon className="w-4 h-4" />
                            Cleanup Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
