'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            // Check role
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
                if (data?.role === 'admin') {
                    router.push('/admin')
                } else {
                    router.push('/dashboard')
                }
            } else {
                router.push('/dashboard')
            }
            router.refresh()
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-800/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob delay-2000"></div>
            </div>

            <Card variant="glass" className="w-full max-w-md p-8 relative z-10 animate-scale-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-900/50 text-primary-400 mb-4 shadow-sm">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-50 font-display">Welcome Back</h2>
                    <p className="text-slate-400 mt-2">Sign in to continue monitoring</p>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-xl text-sm mb-6 flex items-center gap-3 animate-shake">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <Input
                        label="Email Address"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={<Mail className="w-4 h-4" />}
                    />

                    <div>
                        <Input
                            label="Password"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={<Lock className="w-4 h-4" />}
                        />
                        <div className="flex justify-end mt-1">
                            <Link href="#" className="text-xs font-medium text-primary-400 hover:text-primary-300">Forgot password?</Link>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        isLoading={loading}
                        className="w-full"
                        size="lg"
                        icon={<ArrowRight className="w-4 h-4" />}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-400">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary-400 hover:text-primary-300 font-bold hover:underline">
                        Create account
                    </Link>
                </p>
            </Card>
        </div>
    )
}

