'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { Button } from './ui/Button'
import { Bell, Menu, X, LogOut, LayoutDashboard, Settings, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    const [role, setRole] = useState<string | null>(null)
    const [unreadCount, setUnreadCount] = useState(0)
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState<any[]>([])

    // Handlers to close menu on route change
    useEffect(() => {
        setIsMenuOpen(false)
    }, [])

    // Scroll effect for glass styling
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Fetch Notifications
    useEffect(() => {
        if (!user) return

        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10)

            if (data) {
                setNotifications(data)
                setUnreadCount(data.filter((n: any) => !n.is_read).length)
            }
        }

        fetchNotifications()

        // Realtime subscription
        const channel = supabase
            .channel('notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                setNotifications(prev => [payload.new, ...prev])
                setUnreadCount(prev => prev + 1)
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    // Auth Check
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            if (user) {
                const { data: roleData } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                if (roleData) setRole(roleData.role)
            }
        }
        checkUser()
    }, [])


    const markAsRead = async () => {
        if (!user) return
        setShowNotifications(!showNotifications)
        if (unreadCount > 0) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false)
            setUnreadCount(0)
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            scrolled ? "bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm" : "bg-transparent border-transparent"
        )}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group z-50">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-secondary-500 group-hover:scale-105 transition-transform" />
                        <span className="text-2xl font-bold text-slate-900 tracking-tight font-display">
                            Aqua<span className="text-primary-600">Watch</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {user ? (
                            <>
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="sm" icon={<LayoutDashboard className="w-4 h-4" />} iconPosition="left">
                                        Dashboard
                                    </Button>
                                </Link>

                                {role === 'admin' && (
                                    <Link href="/admin">
                                        <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                                            Admin Panel
                                        </Button>
                                    </Link>
                                )}

                                {/* Notification Bell */}
                                <div className="relative">
                                    <button
                                        onClick={markAsRead}
                                        className={cn(
                                            "relative p-2.5 rounded-full transition-all duration-200",
                                            showNotifications ? "bg-primary-50 text-primary-600" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                        )}
                                    >
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                            </span>
                                        )}
                                    </button>

                                    {/* Dropdown */}
                                    {showNotifications && (
                                        <div className="absolute right-0 mt-4 w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-black/5">
                                            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                                <h3 className="font-semibold text-slate-900">Notifications</h3>
                                                {unreadCount > 0 && <span className="text-xs text-primary-600 font-medium">Mark all read</span>}
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="px-6 py-12 text-center flex flex-col items-center">
                                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                            <Bell className="w-6 h-6 text-slate-300" />
                                                        </div>
                                                        <p className="text-slate-500">No new notifications</p>
                                                    </div>
                                                ) : (
                                                    notifications.map((n: any) => (
                                                        <div key={n.id} className={cn(
                                                            "px-4 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex gap-3 items-start",
                                                            !n.is_read ? 'bg-primary-50/30' : ''
                                                        )}>
                                                            <div className={cn("w-2 h-2 mt-2 rounded-full flex-shrink-0", !n.is_read ? "bg-primary-500" : "bg-slate-200")} />
                                                            <div>
                                                                <p className="text-sm text-slate-800 leading-snug">{n.message}</p>
                                                                <p className="text-xs text-slate-400 mt-1.5 font-medium">{new Date(n.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="h-6 w-px bg-slate-200 mx-2" />

                                <Button
                                    onClick={handleSignOut}
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                                    icon={<LogOut className="w-4 h-4" />}
                                >
                                    Sign Out
                                </Button>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/login">
                                    <Button variant="ghost">Log in</Button>
                                </Link>
                                <Link href="/register">
                                    <Button variant="primary" className="rounded-full px-6">Join Now</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-100 shadow-xl p-4 animate-in slide-in-from-top-5 duration-200">
                    <div className="flex flex-col gap-2">
                        {user ? (
                            <>
                                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700">
                                        <LayoutDashboard className="w-5 h-5 text-slate-400" />
                                        <span className="font-medium">Dashboard</span>
                                    </div>
                                </Link>
                                {role === 'admin' && (
                                    <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 text-purple-700">
                                            <Settings className="w-5 h-5 text-purple-400" />
                                            <span className="font-medium">Admin Panel</span>
                                        </div>
                                    </Link>
                                )}
                                <button onClick={handleSignOut} className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 w-full text-left">
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium">Sign Out</span>
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-3 p-2">
                                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="secondary" className="w-full justify-center">Log in</Button>
                                </Link>
                                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="primary" className="w-full justify-center">Join AquaWatch</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

