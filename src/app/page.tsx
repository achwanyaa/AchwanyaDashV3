import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111111] to-[#2a2a2a] flex items-center justify-center p-8">
      <div className="max-w-4xl w-full mx-auto text-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Achwanya 3D Tours</h1>
            <p className="text-xl text-white/80 mb-8">Professional 3D Virtual Tour Management Platform</p>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-4">Welcome Back!</h2>
              <p className="text-white/70 mb-6">Sign in to access your dashboard and manage your 3D tours.</p>
              <Link 
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-white text-[#111111] px-8 py-3 text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Sign In
              </Link>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">New to Achwanya?</h3>
              <p className="text-white/70 mb-4">Create stunning 3D virtual tours for your properties and attract more clients.</p>
              <Link 
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 text-white px-6 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-white/60 text-sm">
              © 2024 Achwanya 3D Tours. Professional virtual tour solutions for real estate.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
