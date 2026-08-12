"use client"

import { useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { ArrowRight, ShieldCheck, User as UserIcon } from 'lucide-react'

const DEMO_ACCOUNTS = [
  { role: 'Candidate', email: 'candidate@demo.ats', desc: 'Take assessments, view offers' },
  { role: 'Recruiter', email: 'recruiter@demo.ats', desc: 'Manage pipeline, view insights' },
  { role: 'Hiring Manager', email: 'hm@demo.ats', desc: 'Review candidates, approve offers' },
  { role: 'Interviewer', email: 'interviewer@demo.ats', desc: 'Conduct interviews, submit feedback' },
  { role: 'Admin', email: 'admin@demo.ats', desc: 'Manage platform settings, audit logs' },
]

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleDemoLogin = async (email: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'Demo@1234' })
      })
      const data = await res.json()
      if (data.success) {
        login(data.data.accessToken, data.data.user)
      } else {
        setError(data.error?.message || 'Login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    }
    setLoading(false)
  }

  return (
    <main className="app-shell" style={{ display: 'grid', placeItems: 'center', background: '#f6f7fb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '480px', width: '100%', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', background: '#f0edff', color: '#6756d9', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px' }}>Sign in to TalentFlow</h1>
          <p style={{ color: '#7d8297', fontSize: '14px', margin: 0 }}>Select a demo account to explore the platform</p>
        </div>

        {error && <div style={{ background: '#fff0ef', color: '#cb6661', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

        <div style={{ display: 'grid', gap: '12px' }}>
          {DEMO_ACCOUNTS.map(acc => (
            <button
              key={acc.email}
              disabled={loading}
              onClick={() => handleDemoLogin(acc.email)}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                background: '#fff', border: '1px solid #e9eaf1', borderRadius: '12px', cursor: loading ? 'wait' : 'pointer',
                textAlign: 'left', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6756d9')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e9eaf1')}
            >
              <div style={{ background: '#f9f9fb', padding: '10px', borderRadius: '8px', color: '#6756d9' }}>
                <UserIcon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '14px', color: '#202337' }}>{acc.role}</strong>
                <small style={{ color: '#7d8297', fontSize: '12px' }}>{acc.desc}</small>
              </div>
              <ArrowRight size={16} color="#7d8297" />
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
