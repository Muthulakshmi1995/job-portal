import React, { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import api from './api'

function Header() {
  const loggedIn = Boolean(localStorage.getItem('access_token'))
  const navigate = useNavigate()
  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/login')
  }
  return <header className="header"><Link to="/" className="brand"><span className="brand-mark">C</span> CareerBridge</Link>
    <nav><NavLink to="/">Find Jobs</NavLink>{loggedIn && <NavLink to="/post-job">Post a Job</NavLink>}{loggedIn && <NavLink to="/applications">My Applications</NavLink>}
    {!loggedIn ? <><NavLink to="/login">Login</NavLink><Link className="nav-cta" to="/register">Get Started</Link></> : <button className="nav-logout" onClick={logout}>Logout</button>}</nav>
  </header>
}

function Home() {
  const [jobs, setJobs] = useState([])
  const [filters, setFilters] = useState({ search: '', location: '', category: '', job_type: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  async function loadJobs(e) {
    if (e) e.preventDefault()
    setLoading(true); setError('')
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v.trim()))
      const res = await api.get('jobs/', { params })
      setJobs(Array.isArray(res.data) ? res.data : (res.data.results || []))
    } catch { setError('Could not load jobs. Please make sure the Django backend is running.') }
    finally { setLoading(false) }
  }
  useEffect(() => { loadJobs() }, [])
  const change = e => setFilters({ ...filters, [e.target.name]: e.target.value })
  return <><section className="hero"><div className="hero-content"><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h1>Find work that<br/><span>moves you forward.</span></h1><p>Discover opportunities, meet great teams, and take the next step in your career.</p>
    <form className="searchbar" onSubmit={loadJobs}><input name="search" value={filters.search} onChange={change} placeholder="Job title, skill, or company"/><input name="location" value={filters.location} onChange={change} placeholder="City or location"/><button className="primary">Search jobs</button></form>
    <div className="hero-stats"><span><b>Explore</b> fresh opportunities</span><span><b>Connect</b> with employers</span><span><b>Grow</b> your career</span></div></div><div className="hero-art"><div className="art-circle"></div><div className="floating-card card-one">✦ &nbsp; Your next role awaits</div><div className="floating-card card-two"><span className="mini-icon">↗</span><div><b>New opportunities</b><small>Find your fit today</small></div></div><div className="art-person">✧</div></div></section>
    <main className="content"><div className="section-heading"><div><span className="eyebrow">CURATED FOR YOU</span><h2>Explore opportunities</h2><p>Find a role that fits your goals and strengths.</p></div><span className="result-count">{jobs.length} jobs found</span></div>
    <div className="filters"><label>Category<input name="category" value={filters.category} onChange={change} placeholder="e.g. Engineering"/></label><label>Job type<select name="job_type" value={filters.job_type} onChange={change}><option value="">All types</option><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Remote</option></select></label><button className="secondary" onClick={loadJobs}>Apply filters</button><button className="text-button" onClick={() => {setFilters({search:'',location:'',category:'',job_type:''}); setTimeout(() => loadJobs(), 0)}}>Clear</button></div>
    {loading ? <p className="notice">Loading jobs…</p> : error ? <p className="notice error">{error}</p> : jobs.length === 0 ? <div className="empty"><span>⌕</span><h3>No jobs found yet</h3><p>Try a different search, or sign in and post the first opportunity.</p></div> : <div className="job-grid">{jobs.map(job => <article className="job-card" key={job.id}><div className="company-icon">{(job.company || 'J').slice(0,1).toUpperCase()}</div><span className="job-type">{job.job_type}</span><h3>{job.title}</h3><p className="company">{job.company}</p><p className="job-location">⌖ &nbsp;{job.location}</p><p className="job-description">{job.description}</p><div className="job-card-bottom"><span className="salary">{job.salary || 'Salary not specified'}</span><Link to={`/jobs/${job.id}`} className="details-link">View details →</Link></div></article>)}</div>}</main>
    <section className="bottom-cta"><div><span className="eyebrow">READY FOR WHAT'S NEXT?</span><h2>Your next opportunity is out there.</h2><p>Create an account to apply and keep track of your applications.</p></div><Link className="primary button-link" to="/register">Create free account →</Link></section>
    <footer>© {new Date().getFullYear()} CareerBridge · Built for your next move.</footer></>
}

function AuthPage({ register = false }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const change = e => setForm({ ...form, [e.target.name]: e.target.value })
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      if (register) {
        await api.post('register/', form)
        navigate('/login', { state: { message: 'Account created. Please log in.' } })
      } else {
        const res = await api.post('token/', { username: form.username, password: form.password })
        localStorage.setItem('access_token', res.data.access)
        localStorage.setItem('refresh_token', res.data.refresh)
        navigate('/')
      }
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Could not connect. Check that Django is running.')
    } finally { setBusy(false) }
  }
  return <main className="auth-wrap"><div className="auth-decoration"><span className="eyebrow">CAREERBRIDGE</span><h2>{register ? 'Make your next move.' : 'Welcome back.'}</h2><p>{register ? 'Join a community of people building their future, one opportunity at a time.' : 'Your next opportunity could be one click away.'}</p><div className="auth-bubble">✦</div></div><form className="auth-card" onSubmit={submit}><span className="eyebrow">{register ? 'GET STARTED' : 'GOOD TO SEE YOU'}</span><h1>{register ? 'Create your account' : 'Sign in to CareerBridge'}</h1><p className="muted">{register ? 'Fill in your details to get started.' : 'Enter your details to continue.'}</p>
    <label>Username<input name="username" value={form.username} onChange={change} required autoComplete="username"/></label>
    {register && <label>Email address<input type="email" name="email" value={form.email} onChange={change} required autoComplete="email"/></label>}
    <label>Password<input type="password" name="password" value={form.password} onChange={change} required minLength={register ? 8 : 1} autoComplete={register ? 'new-password' : 'current-password'}/></label>
    {error && <p className="form-error">{error}</p>}<button className="primary full" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'} →</button>
    <p className="auth-switch">{register ? 'Already have an account?' : "Don't have an account?"} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create one'}</Link></p></form></main>
}

function JobDetail() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [error, setError] = useState('')
  const [cover, setCover] = useState('')
  const [resume, setResume] = useState(null)
  const [message, setMessage] = useState('')
  useEffect(() => { api.get(`jobs/${id}/`).then(r => setJob(r.data)).catch(() => setError('Job could not be loaded.')) }, [id])
  async function apply(e) {
    e.preventDefault(); setMessage(''); setError('')
    if (!localStorage.getItem('access_token')) { setError('Please log in before applying.'); return }
    if (!resume) { setError('Please choose a resume file.'); return }
    const data = new FormData(); data.append('job', id); data.append('resume', resume); data.append('cover_letter', cover)
    try { await api.post('applications/', data); setMessage('Application submitted successfully!') }
    catch (err) { setError(err.response?.data ? Object.values(err.response.data).flat().join(' ') : 'Application failed. Please try again.') }
  }
  if (!job && !error) return <main className="content"><p className="notice">Loading job…</p></main>
  if (!job) return <main className="content"><p className="notice error">{error}</p><Link to="/">← Back to jobs</Link></main>
  return <main className="detail-layout"><section className="detail-main"><Link to="/" className="back-link">← Back to jobs</Link><div className="detail-title"><div className="company-icon large">{job.company.slice(0,1).toUpperCase()}</div><div><span className="job-type">{job.job_type}</span><h1>{job.title}</h1><p>{job.company} · {job.location}</p></div></div><div className="detail-block"><h2>About the role</h2><p className="preline">{job.description}</p></div>{job.requirements && <div className="detail-block"><h2>Requirements</h2><p className="preline">{job.requirements}</p></div>}<div className="detail-block"><h2>Job overview</h2><p><b>Category:</b> {job.category || 'Not specified'}</p><p><b>Salary:</b> {job.salary || 'Not specified'}</p><p><b>Posted by:</b> {job.posted_by_username}</p></div></section><aside className="apply-card"><span className="eyebrow">TAKE THE NEXT STEP</span><h2>Interested in this role?</h2><p>Send your application and resume to get considered.</p><form onSubmit={apply}><label>Resume (PDF, DOC, DOCX)<input type="file" accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files?.[0])} required/></label><label>Cover letter (optional)<textarea value={cover} onChange={e => setCover(e.target.value)} rows="5" placeholder="Tell the employer why you're a good fit…"/></label>{error && <p className="form-error">{error}</p>}{message && <p className="success-message">{message}</p>}<button className="primary full">Apply now →</button></form></aside></main>
}

function PostJob() {
  const [form, setForm] = useState({title:'', company:'', location:'', category:'', job_type:'Full-time', salary:'', description:'', requirements:''})
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const change = e => setForm({...form, [e.target.name]:e.target.value})
  async function submit(e) { e.preventDefault(); setError(''); try { await api.post('jobs/', form); navigate('/') } catch (err) { setError(err.response?.data ? Object.values(err.response.data).flat().join(' ') : 'Please log in before posting a job.') } }
  return <main className="form-page"><Link to="/" className="back-link">← Back to jobs</Link><span className="eyebrow">EMPLOYER SPACE</span><h1>Post a new opportunity</h1><p className="muted">Share the role details so candidates can find the right fit.</p><form className="form-card" onSubmit={submit}><div className="form-row"><label>Job title<input name="title" value={form.title} onChange={change} required/></label><label>Company<input name="company" value={form.company} onChange={change} required/></label></div><div className="form-row"><label>Location<input name="location" value={form.location} onChange={change} required placeholder="e.g. Trivandrum / Remote"/></label><label>Category<input name="category" value={form.category} onChange={change} placeholder="e.g. Technology"/></label></div><div className="form-row"><label>Job type<select name="job_type" value={form.job_type} onChange={change}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Remote</option></select></label><label>Salary range<input name="salary" value={form.salary} onChange={change} placeholder="e.g. ₹4–6 LPA"/></label></div><label>Job description<textarea name="description" value={form.description} onChange={change} required rows="5"/></label><label>Requirements<textarea name="requirements" value={form.requirements} onChange={change} rows="4"/></label>{error && <p className="form-error">{error}</p>}<button className="primary">Publish job →</button></form></main>
}

function Applications() {
  const [apps, setApps] = useState([])
  const [error, setError] = useState('')
  useEffect(() => { api.get('applications/').then(r => setApps(Array.isArray(r.data) ? r.data : (r.data.results || []))).catch(() => setError('Please log in to view your applications.')) }, [])
  return <main className="content page-content"><span className="eyebrow">YOUR CAREER JOURNEY</span><h1>My applications</h1><p className="muted">Keep track of the opportunities you have applied for.</p>{error ? <p className="notice error">{error}</p> : apps.length ? <div className="application-list">{apps.map(a => <article className="application-card" key={a.id}><div><h3>{a.job_title}</h3><p>{a.company}</p><small>Applied {new Date(a.applied_at).toLocaleDateString()}</small></div><span className={`status status-${a.status.toLowerCase()}`}>{a.status}</span></article>)}</div> : <div className="empty"><span>▤</span><h3>No applications yet</h3><p>Explore jobs and submit your first application.</p><Link className="primary button-link" to="/">Explore jobs</Link></div>}</main>
}

export default function App() {
  return <><Header/><Routes><Route path="/" element={<Home/>}/><Route path="/login" element={<AuthPage/>}/><Route path="/register" element={<AuthPage register/>}/><Route path="/jobs/:id" element={<JobDetail/>}/><Route path="/post-job" element={<PostJob/>}/><Route path="/applications" element={<Applications/>}/><Route path="*" element={<main className="content"><h1>Page not found</h1><Link to="/">Return home</Link></main>}/></Routes></>
}
