'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Mail, Lock, User, ArrowRight, AlertCircle, Droplets } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
            router.refresh()
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-slate-50 px-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
            </div>

            <Card variant="glass" className="w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary-50 text-secondary-600 mb-4 shadow-sm">
                        <Droplets className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 font-display">Join AquaWatch</h2>
                    <p className="text-slate-500 mt-2">Create an account to verify reports</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-center gap-3 animate-shake">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <Input
                        label="Full Name"
                        type="text"
                        required
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        icon={<User className="w-4 h-4" />}
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={<Mail className="w-4 h-4" />}
                    />

                    <Input
                        label="Password"
                        type="password"
                        required
                        minLength={6}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        icon={<Lock className="w-4 h-4" />}
                    />

                    <Button
                        type="submit"
                        isLoading={loading}
                        className="w-full"
                        size="lg"
                        icon={<ArrowRight className="w-4 h-4" />}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </Button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary-700 hover:text-primary-800 font-bold hover:underline">
                        Sign In
                    </Link>
                </p>
            </Card>
        </div>
    )
}

