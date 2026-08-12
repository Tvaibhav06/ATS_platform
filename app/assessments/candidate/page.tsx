"use client"

import { useState, useEffect, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { useAuth } from '@/components/auth-provider'
import { ArrowRight, Clock, ShieldAlert } from 'lucide-react'

export default function CandidateAssessmentPage() {
  const { user, token, isLoading } = useAuth()
  const [assessment, setAssessment] = useState<any>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [code, setCode] = useState('// Write your solution here\n')
  const [language, setLanguage] = useState('javascript')
  const [status, setStatus] = useState<'idle' | 'started' | 'submitting' | 'submitted'>('idle')
  const [deadline, setDeadline] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState('')
  const [error, setError] = useState('')

  // We should ideally fetch an assigned assessment based on the user's application.
  // For the demo, we will just fetch the first assessment from the API.
  useEffect(() => {
    if (!token) return
    const fetchAssigned = async () => {
      // Mocking fetching the specific assigned assessment for the user
      try {
        const res = await fetch('/api/v1/assessments', { headers: { 'Authorization': `Bearer ${token}` } })
        const data = await res.json()
        if (data.success && data.data.length > 0) {
          setAssessment(data.data[0])
        }
      } catch (err) {}
    }
    fetchAssigned()
  }, [token])

  useEffect(() => {
    if (status !== 'started' || !deadline) return
    const timer = setInterval(() => {
      const remaining = deadline - Date.now()
      if (remaining <= 0) {
        clearInterval(timer)
        setTimeLeft('00:00')
        handleAutoSubmit()
      } else {
        const m = Math.floor(remaining / 60000)
        const s = Math.floor((remaining % 60000) / 1000)
        setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [status, deadline])

  const handleStart = async () => {
    if (!assessment) return
    try {
      // Typically we need the applicationId, but for the hackathon we can simulate or pass a mock one if needed
      // Assuming we have an endpoint that just starts it or we mock the start for the UI demo
      setStatus('started')
      setDeadline(Date.now() + (assessment.durationMinutes || 45) * 60000)
    } catch (e) {
      setError('Failed to start assessment')
    }
  }

  const handleSubmit = async () => {
    setStatus('submitting')
    try {
      // If we had a real attemptId we would POST to /api/v1/assessments/attempts/[id]/answer
      // For this demo, we simulate success
      await new Promise(r => setTimeout(r, 1000))
      setStatus('submitted')
    } catch (e) {
      setError('Failed to submit')
      setStatus('started')
    }
  }

  const handleAutoSubmit = async () => {
    setStatus('submitting')
    await new Promise(r => setTimeout(r, 1000))
    setStatus('submitted')
  }

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && status === 'started') {
        // Record tab switch in backend
        if (attemptId && token) {
          fetch(`/api/v1/assessments/attempts/${attemptId}/answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ isTabSwitch: true })
          }).catch(() => {})
        }
        alert('Warning: You have switched tabs during a proctored assessment. This has been recorded.')
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [status, attemptId, token])

  if (isLoading || !user) return <div style={{padding: 40}}>Loading...</div>

  if (status === 'idle') {
    return (
      <main style={{ maxWidth: 800, margin: '60px auto', padding: 20 }}>
        <h1 style={{ fontSize: 24, marginBottom: 20 }}>{assessment?.title || 'Technical Assessment'}</h1>
        <div style={{ background: '#f6f7fb', padding: 20, borderRadius: 12, marginBottom: 20 }}>
          <h3>Instructions</h3>
          <p>{assessment?.instructions || 'Please complete the following coding challenges within the time limit. Tab switches are monitored.'}</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 15, color: '#cb6661' }}>
            <ShieldAlert size={18} />
            <small>Proctored Environment: Tab switching will be logged.</small>
          </div>
        </div>
        <button onClick={handleStart} style={{ padding: '12px 24px', background: '#6756d9', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          Start Assessment <ArrowRight size={16} />
        </button>
      </main>
    )
  }

  if (status === 'submitted') {
    return (
      <main style={{ maxWidth: 800, margin: '60px auto', padding: 20, textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, marginBottom: 20 }}>Assessment Submitted</h1>
        <p>Thank you. Your responses have been recorded and will be evaluated by the hiring team.</p>
        <a href="/dashboard" style={{ display: 'inline-block', marginTop: 20, color: '#6756d9' }}>Return to Dashboard</a>
      </main>
    )
  }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1e1e1e', color: '#fff' }}>
      <header style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#252526', borderBottom: '1px solid #333' }}>
        <div>
          <strong style={{ fontSize: 16 }}>{assessment?.title || 'Coding Challenge'}</strong>
          <select value={language} onChange={e => setLanguage(e.target.value)} style={{ marginLeft: 20, background: '#333', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4 }}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="sql">SQL</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: timeLeft.startsWith('00') ? '#ff5f56' : '#fff' }}>
            <Clock size={16} /> {timeLeft}
          </div>
          <button onClick={handleSubmit} disabled={status === 'submitting'} style={{ padding: '8px 16px', background: '#108c79', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            {status === 'submitting' ? 'Submitting...' : 'Submit Code'}
          </button>
        </div>
      </header>
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={val => setCode(val || '')}
          options={{ minimap: { enabled: false }, fontSize: 14 }}
        />
      </div>
    </main>
  )
}
