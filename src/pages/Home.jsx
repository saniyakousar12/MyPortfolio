import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useEffect, useRef, useState } from 'react'
import {
  FaGithub, FaLinkedin, FaEnvelope, FaAward, FaCode,
  FaUsers, FaExternalLinkAlt, FaMapMarkerAlt, FaCalendarAlt,
  FaBookOpen, FaRegLightbulb, FaHeart, FaRocket, FaArrowRight,
  FaDownload, FaBriefcase
} from 'react-icons/fa'
import {
  SiReact, SiJavascript, SiPython, SiSpringboot, SiTailwindcss,
  SiMysql, SiGit, SiHtml5, SiSpring, SiCplusplus, SiC, SiHibernate, SiPostman
} from 'react-icons/si'

/* ─── Animated background: mesh grid + orbs ─────────────────────── */
const Background = () => {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: -999, y: -999 })
  const raf = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let W, H

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouse = e => { mouse.current = { x: e.clientX, y: e.clientY } }
    const onTouch = e => { mouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('touchmove', onTouch, { passive: true })

    const orbs = [
      { x: 0.15, y: 0.2,  r: 320, c: '0,212,255',  speed: 0.0003 },
      { x: 0.85, y: 0.15, r: 260, c: '6,182,212',   speed: 0.0004 },
      { x: 0.5,  y: 0.6,  r: 200, c: '99,102,241',  speed: 0.0005 },
      { x: 0.2,  y: 0.8,  r: 180, c: '0,180,220',   speed: 0.0006 },
      { x: 0.9,  y: 0.75, r: 240, c: '14,165,233',  speed: 0.00035 },
    ]

    let t = 0
    const draw = () => {
      t++
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#020b18'
      ctx.fillRect(0, 0, W, H)

      orbs.forEach((o, i) => {
        const ox = (o.x + Math.sin(t * o.speed + i) * 0.08) * W
        const oy = (o.y + Math.cos(t * o.speed * 1.3 + i) * 0.06) * H
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r)
        g.addColorStop(0, `rgba(${o.c},0.18)`)
        g.addColorStop(0.5, `rgba(${o.c},0.06)`)
        g.addColorStop(1, `rgba(${o.c},0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(ox, oy, o.r, 0, Math.PI * 2)
        ctx.fill()
      })

      const mx = mouse.current.x, my = mouse.current.y
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 200)
      mg.addColorStop(0, 'rgba(0,212,255,0.07)')
      mg.addColorStop(1, 'rgba(0,212,255,0)')
      ctx.fillStyle = mg
      ctx.beginPath()
      ctx.arc(mx, my, 200, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = 'rgba(0,212,255,0.04)'
      ctx.lineWidth = 1
      const gs = 60
      for (let x = 0; x < W; x += gs) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 0; y < H; y += gs) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }

      const sl = (t * 0.5) % H
      const slg = ctx.createLinearGradient(0, sl - 40, 0, sl + 40)
      slg.addColorStop(0, 'rgba(0,212,255,0)')
      slg.addColorStop(0.5, 'rgba(0,212,255,0.025)')
      slg.addColorStop(1, 'rgba(0,212,255,0)')
      ctx.fillStyle = slg
      ctx.fillRect(0, sl - 40, W, 80)

      raf.current = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onTouch)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  )
}

/* ─── Glowing cursor dot ─────────────────────────────────────────── */
const CursorGlow = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  useEffect(() => {
    const move = e => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])
  return (
    <div
      style={{
        position: 'fixed', left: pos.x - 6, top: pos.y - 6,
        width: 12, height: 12, borderRadius: '50%',
        background: 'rgba(0,212,255,0.9)',
        boxShadow: '0 0 20px 6px rgba(0,212,255,0.4)',
        pointerEvents: 'none', zIndex: 9999,
        transition: 'left 0.05s linear, top 0.05s linear',
      }}
    />
  )
}

/* ─── Typewriter ─────────────────────────────────────────────────── */
const Typewriter = ({ words }) => {
  const [idx, setIdx] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[idx]
    let timer
    if (!deleting && text.length < word.length) {
      timer = setTimeout(() => setText(word.slice(0, text.length + 1)), 80)
    } else if (!deleting && text.length === word.length) {
      timer = setTimeout(() => setDeleting(true), 1800)
    } else if (deleting && text.length > 0) {
      timer = setTimeout(() => setText(text.slice(0, -1)), 45)
    } else if (deleting && text.length === 0) {
      setDeleting(false)
      setIdx((idx + 1) % words.length)
    }
    return () => clearTimeout(timer)
  }, [text, deleting, idx, words])

  return (
    <span style={{ color: '#00d4ff', fontFamily: "'Syne', sans-serif" }}>
      {text}<span style={{ animation: 'blink 1s step-end infinite' }}>|</span>
    </span>
  )
}

/* ─── Section heading ────────────────────────────────────────────── */
const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 64, textAlign: 'center' }}>
    {sub && (
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.3em', color: '#06b6d4', textTransform: 'uppercase', marginBottom: 12 }}>
        {sub}
      </p>
    )}
    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>
      {children}
    </h2>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <div style={{ height: 1, width: 64, background: 'linear-gradient(to right, transparent, #00d4ff)' }} />
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 12px rgba(0,212,255,0.8)' }} />
      <div style={{ height: 1, width: 64, background: 'linear-gradient(to left, transparent, #00d4ff)' }} />
    </div>
  </div>
)

/* ─── Reveal animation wrapper ───────────────────────────────────── */
const Reveal = ({ children, delay = 0 }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.08 })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}

/* ─── Glass card ─────────────────────────────────────────────────── */
const glass = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(24px)',
  borderRadius: 20,
}
const glassGlow = {
  ...glass,
  boxShadow: '0 0 40px rgba(0,212,255,0.08)',
}

/* ══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const scrollTo = id => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })

  const skills = [
    { cat: 'Languages', items: [
      { name: 'Java', icon: FaCode, color: '#f89820' },
      { name: 'Python', icon: SiPython, color: '#3776AB' },
      { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
      { name: 'C++', icon: SiCplusplus, color: '#00599C' },
      { name: 'C', icon: SiC, color: '#A8B9CC' },
    ]},
    { cat: 'Frameworks & Technologies', items: [
      { name: 'React', icon: SiReact, color: '#61DAFB' },
      { name: 'Spring Boot', icon: SiSpringboot, color: '#6DB33F' },
      { name: 'Spring AI', icon: SiSpring, color: '#6DB33F' },
      { name: 'Tailwind CSS', icon: SiTailwindcss, color: '#06B6D4' },
      { name: 'Bootstrap', icon: SiHtml5, color: '#7952B3' },
      { name: 'Hibernate', icon: SiHibernate, color: '#59666C' },
    ]},
    { cat: 'Tools & Databases', items: [
      { name: 'MySQL', icon: SiMysql, color: '#4479A1' },
      { name: 'Git / GitHub', icon: SiGit, color: '#F05032' },
      { name: 'Postman', icon: SiPostman, color: '#FF6C37' },
    ]},
  ]

  const projects = [
    {
      num: '01',
      title: 'BookSwap',
      tag: 'Full Stack · AI-Powered',
      desc: 'Community book exchange platform with AI-powered recommendation engine, real-time WebSocket notifications, secure payments, trust scores, and gamified badges.',
      tech: ['React', 'Spring Boot', 'Spring AI', 'MySQL', 'REST APIs'],
      features: ['AI Recommendations', 'Real-time Chat', 'Payment Integration', 'Gamification'],
      github: 'https://github.com/saniya-kousar/bookswap',
      accent: '#00d4ff',
      emoji: '📚',
    },
    {
      num: '02',
      title: 'Plagiarism Detector',
      tag: 'Python · Image Processing',
      desc: 'Detects text & image plagiarism — computes word-overlap similarity percentages and uses hologram matching to identify duplicated visual content with threshold highlighting.',
      tech: ['Python', 'Django', 'MySQL', 'Image Processing'],
      features: ['Text Similarity', 'Hologram Matching', 'Visual Highlighting'],
      github: 'https://github.com/saniya-kousar/plagiarism-detection',
      accent: '#818cf8',
      emoji: '🔍',
    },
  ]

  const stats = [
    { value: '9.96', label: 'Diploma CGA', icon: '🏆' },
    { value: '9.63', label: 'Current CGA', icon: '🎓' },
    { value: '300+', label: 'Students Reached', icon: '👥' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        * { cursor: none !important; box-sizing: border-box; }
        ::selection { background: rgba(0,212,255,0.25); color: #fff; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        .float { animation: floatY 6s ease-in-out infinite; }
        .float2 { animation: floatY 7s ease-in-out infinite 1s; }
        .float3 { animation: floatY 5s ease-in-out infinite 0.5s; }
        .ring1 { position:absolute;inset:-8px;border-radius:50%;border:1px solid rgba(0,212,255,0.35);animation:pulseRing 3s ease-out infinite; }
        .ring2 { position:absolute;inset:-8px;border-radius:50%;border:1px solid rgba(0,212,255,0.35);animation:pulseRing 3s ease-out infinite 1.5s; }
        .nav-link { position:relative; }
        .nav-link::after { content:'';position:absolute;left:0;bottom:-2px;width:0;height:1px;background:#00d4ff;transition:width 0.3s; }
        .nav-link:hover::after { width:100%; }
        .glow-btn {
          background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(6,182,212,0.1));
          border: 1px solid rgba(0,212,255,0.4);
          box-shadow: 0 0 20px rgba(0,212,255,0.12);
          transition: all 0.3s ease;
          color: #67e8f9;
        }
        .glow-btn:hover {
          background: linear-gradient(135deg, rgba(0,212,255,0.25), rgba(6,182,212,0.2));
          box-shadow: 0 0 40px rgba(0,212,255,0.3), 0 0 80px rgba(0,212,255,0.08);
          border-color: rgba(0,212,255,0.7);
          transform: translateY(-2px);
        }
        .skill-chip { transition: all 0.2s ease; }
        .skill-chip:hover {
          border-color: rgba(0,212,255,0.45) !important;
          box-shadow: 0 0 16px rgba(0,212,255,0.2);
          transform: translateY(-3px);
        }
        .proj-card { transition: all 0.35s ease; }
        .proj-card:hover {
          border-color: rgba(0,212,255,0.35) !important;
          box-shadow: 0 0 60px rgba(0,212,255,0.07);
          transform: translateY(-4px);
        }
        .proj-card:hover .proj-num { color: #00d4ff; text-shadow: 0 0 20px rgba(0,212,255,0.6); }
        .glass-card { transition: border-color 0.3s, box-shadow 0.3s; }
        .glass-card:hover {
          border-color: rgba(0,212,255,0.3) !important;
          box-shadow: 0 0 30px rgba(0,212,255,0.08) !important;
        }
        input, textarea {
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 12px;
          color: #fff;
          padding: 12px 16px;
          width: 100%;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
        input:focus, textarea:focus {
          border-color: rgba(0,212,255,0.5) !important;
          box-shadow: 0 0 0 3px rgba(0,212,255,0.12);
        }
        .terminal-line::before { content:'> '; color:#00d4ff; font-family:monospace; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #020b18; }
        ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.3); border-radius: 2px; }
      `}</style>

      <CursorGlow />
      <Background />

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#020b18', minHeight: '100vh', position: 'relative' }}>

        {/* ── NAVBAR ─────────────────────────────────────────────── */}
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 40px',
            backdropFilter: 'blur(20px)',
            background: 'rgba(2,11,24,0.75)',
            borderBottom: '1px solid rgba(0,212,255,0.07)',
          }}
        >
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 20, color: '#fff', letterSpacing: '-0.02em' }}>
            SK<span style={{ color: '#00d4ff' }}>.</span>
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            {['about','skills','projects','certifications','contact'].map(s => (
              <button
                key={s}
                onClick={() => scrollTo(`#${s}`)}
                className="nav-link"
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 13, textTransform: 'capitalize', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.02em' }}
              >
                {s}
              </button>
            ))}
          </div>
          <a
            href="mailto:saniyakousar013@gmail.com"
            className="glow-btn"
            style={{ padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
          >
            <FaEnvelope size={11} /> Hire Me
          </a>
        </motion.nav>

        {/* ══ HERO ═══════════════════════════════════════════════════ */}
        <section id="home" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80, position: 'relative', overflow: 'hidden' }}>
          {/* Big ghost text */}
          <div style={{
            position: 'absolute', fontFamily: "'Syne', sans-serif", fontWeight: 900,
            fontSize: 'clamp(80px, 18vw, 220px)', color: 'rgba(255,255,255,0.025)',
            letterSpacing: '-0.05em', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none',
          }}>
            SANIYA
          </div>

          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', position: 'relative', zIndex: 10 }}>
            {/* LEFT */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 32, height: 1, background: '#00d4ff' }} />
                <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#06b6d4', textTransform: 'uppercase', fontWeight: 600 }}>
                  Full Stack Developer
                </span>
              </div>

              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(44px, 6vw, 72px)', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em', marginBottom: 16 }}>
                Saniya<br />
                <span style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.2)', color: 'transparent' }}>Kousar</span>
              </h1>

              <p style={{ fontSize: 20, color: '#6b7280', marginBottom: 8, fontWeight: 300 }}>
                I build{' '}
                <Typewriter words={['web apps.', 'REST APIs.', 'AI features.', 'clean UIs.']} />
              </p>

              <p style={{ color: '#4b5563', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
                <FaMapMarkerAlt style={{ color: '#0e7490' }} size={11} />
                Warangal, India · CSE @ UCET, Osmania University
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
                <button
                  onClick={() => scrollTo('#projects')}
                  className="glow-btn"
                  style={{ padding: '12px 28px', borderRadius: 999, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, border: 'none' }}
                >
                  View Work <FaArrowRight size={12} />
                </button>
                <button
                  onClick={() => scrollTo('#contact')}
                  style={{
                    padding: '12px 28px', borderRadius: 999, fontWeight: 600, fontSize: 14,
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#d1d5db', transition: 'all 0.3s',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={e => { e.target.style.borderColor='rgba(255,255,255,0.2)'; e.target.style.background='rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { e.target.style.borderColor='rgba(255,255,255,0.1)'; e.target.style.background='transparent' }}
                >
                  Contact
                </button>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                {[
                  { icon: FaGithub, href: 'https://github.com/saniya-kousar' },
                  { icon: FaLinkedin, href: 'https://linkedin.com/in/saniya-kousar-48b73327a' },
                  { icon: FaEnvelope, href: 'mailto:saniyakousar013@gmail.com' },
                ].map(({ icon: Icon, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: 40, height: 40, borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#6b7280', textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color='#00d4ff'; e.currentTarget.style.borderColor='rgba(0,212,255,0.5)'; e.currentTarget.style.boxShadow='0 0 16px rgba(0,212,255,0.25)' }}
                    onMouseLeave={e => { e.currentTarget.style.color='#6b7280'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow='none' }}
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* RIGHT — Profile card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
              style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}
            >
              <div style={{ position: 'relative' }}>
                {/* Main card */}
                <div
                  className="float"
                  style={{
                    width: 300, borderRadius: 28, overflow: 'hidden',
                    background: 'linear-gradient(145deg, rgba(0,212,255,0.1) 0%, rgba(2,11,24,0.95) 100%)',
                    border: '1px solid rgba(0,212,255,0.3)',
                    boxShadow: '0 0 40px rgba(0,212,255,0.1), 0 0 80px rgba(0,212,255,0.04)',
                  }}
                >
                  <div style={{ height: 3, background: 'linear-gradient(90deg, #00d4ff, #0ea5e9, #00d4ff)' }} />
                  <div style={{ padding: 32, textAlign: 'center' }}>
                    {/* Avatar */}
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
                      <div className="ring1" /><div className="ring2" />
                      <div style={{
                        width: 110, height: 110, borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(6,182,212,0.08))',
                        border: '2px solid rgba(0,212,255,0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 52,
                      }}>
                        👩‍💻
                      </div>
                      <div style={{
                        position: 'absolute', bottom: 4, right: 4,
                        width: 16, height: 16, borderRadius: '50%',
                        background: '#34d399', border: '2px solid #020b18',
                        boxShadow: '0 0 8px rgba(52,211,153,0.8)',
                      }} />
                    </div>

                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#fff', marginBottom: 4 }}>
                      Saniya Kousar
                    </h3>
                    <p style={{ color: '#00d4ff', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 24 }}>
                      Full Stack Developer
                    </p>

                    {/* Stats grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
                      {stats.map((s, i) => (
                        <div
                          key={i}
                          style={{
                            borderRadius: 12, padding: '10px 4px', textAlign: 'center',
                            background: 'rgba(0,212,255,0.05)',
                            border: '1px solid rgba(0,212,255,0.12)',
                          }}
                        >
                          <div style={{ fontSize: 14, marginBottom: 2 }}>{s.icon}</div>
                          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: '#fff' }}>{s.value}</div>
                          <div style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.3 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Terminal */}
                    <div style={{
                      borderRadius: 12, padding: '10px 14px', textAlign: 'left',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(0,212,255,0.1)',
                    }}>
                      <p style={{ fontSize: 10, color: '#374151', marginBottom: 4, fontFamily: 'monospace' }}>// status</p>
                      <p className="terminal-line" style={{ fontSize: 11, color: '#67e8f9', fontFamily: 'monospace', margin: '2px 0' }}>open to opportunities</p>
                      <p className="terminal-line" style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', margin: '2px 0' }}>based in Warangal, IN</p>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <motion.div
                  animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    position: 'absolute', left: -70, top: 60,
                    padding: '8px 14px', borderRadius: 12,
                    background: 'rgba(2,11,24,0.95)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(0,212,255,0.3)',
                    boxShadow: '0 0 20px rgba(0,212,255,0.1)',
                    fontSize: 12, fontWeight: 600, color: '#67e8f9',
                  }}
                >
                  ⚡ Spring Boot
                </motion.div>
                <motion.div
                  animate={{ y: [0, 8, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  style={{
                    position: 'absolute', right: -60, bottom: 90,
                    padding: '8px 14px', borderRadius: 12,
                    background: 'rgba(2,11,24,0.95)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(0,212,255,0.3)',
                    boxShadow: '0 0 20px rgba(0,212,255,0.1)',
                    fontSize: 12, fontWeight: 600, color: '#67e8f9',
                  }}
                >
                  ⚛️ React
                </motion.div>
                <motion.div
                  animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                  style={{
                    position: 'absolute', right: -50, top: 30,
                    padding: '8px 14px', borderRadius: 12,
                    background: 'rgba(2,11,24,0.95)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(0,212,255,0.3)',
                    boxShadow: '0 0 20px rgba(0,212,255,0.1)',
                    fontSize: 12, fontWeight: 600, color: '#67e8f9',
                  }}
                >
                  🤖 Spring AI
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Scroll line */}
          <motion.div
            animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}
            onClick={() => scrollTo('#about')}
            style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          >
            <span style={{ fontSize: 10, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase' }}>scroll</span>
            <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(0,212,255,0.6), transparent)' }} />
          </motion.div>
        </section>

        {/* ══ ABOUT ══════════════════════════════════════════════════ */}
        <section id="about" style={{ padding: '112px 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal><SectionTitle sub="Who I Am">About Me</SectionTitle></Reveal>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
              <Reveal delay={0.1}>
                <div className="glass-card" style={{ ...glassGlow, padding: 40 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaCode style={{ color: '#00d4ff' }} size={15} />
                    </div>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: 15 }}>My Story</span>
                  </div>
                  <p style={{ color: '#9ca3af', lineHeight: 1.8, fontSize: 15, marginBottom: 20 }}>
                    Motivated Computer Science Engineering student with strong foundations in programming, data structures, and software development. Passionate about building scalable full-stack applications that solve real problems — from AI-powered recommendation engines to real-time collaborative platforms.
                  </p>
                  <p style={{ color: '#6b7280', lineHeight: 1.8, fontSize: 14 }}>
                    Currently seeking a Software Engineer role to apply technical skills, contribute to real-world projects, and grow in a dynamic environment. I believe great code is both functional and beautifully crafted.
                  </p>
                  <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div>
                      <p style={{ fontSize: 10, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Education</p>
                      <p style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>B.E. Computer Science</p>
                      <p style={{ color: '#06b6d4', fontSize: 12 }}>UCET, Osmania University · 9.63 CGA</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Previously</p>
                      <p style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Diploma in CSE</p>
                      <p style={{ color: '#06b6d4', fontSize: 12 }}>Govt Polytechnic Warangal · 9.96 CGA</p>
                    </div>
                  </div>
                </div>
              </Reveal>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {stats.map((s, i) => (
                  <Reveal key={i} delay={0.15 + i * 0.1}>
                    <div className="glass-card" style={{ ...glass, padding: '24px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 32, color: '#fff', textShadow: '0 0 20px rgba(0,212,255,0.5)', marginBottom: 4 }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', letterSpacing: '0.05em' }}>{s.label}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Experience */}
            <Reveal delay={0.2}>
              <div className="glass-card" style={{ ...glass, padding: 36, marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FaBriefcase style={{ color: '#00d4ff' }} size={18} />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 2 }}>Work Experience</p>
                      <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 2 }}>Java Developer Intern</h3>
                      <p style={{ color: '#06b6d4', fontSize: 13 }}>Infosys Springboard</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4b5563', fontSize: 12 }}>
                      <FaCalendarAlt size={10} /> 2024 – Present
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4b5563', fontSize: 12 }}>
                      <FaMapMarkerAlt size={10} /> Remote
                    </span>
                    <span style={{ padding: '4px 12px', borderRadius: 999, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', fontSize: 11 }}>
                      ● Active
                    </span>
                  </div>
                </div>
                <p style={{ marginTop: 20, color: '#9ca3af', fontSize: 14, lineHeight: 1.8 }}>
                  Hands-on experience in Core Java — OOP, exception handling, collections, multithreading. Built backend applications with Spring Boot: RESTful services, layered architecture, and database integration. Contributed to real-world projects following Agile methodology.
                </p>
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Java', 'Spring Boot', 'REST APIs', 'Agile', 'MySQL'].map(t => (
                    <span
                      key={t}
                      className="skill-chip"
                      style={{ padding: '4px 12px', borderRadius: 999, background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)', color: '#67e8f9', fontSize: 12, fontWeight: 500 }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══ SKILLS ═════════════════════════════════════════════════ */}
        <section id="skills" style={{ padding: '112px 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal><SectionTitle sub="What I Know">Technical Skills</SectionTitle></Reveal>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {skills.map((group, gi) => (
                <Reveal key={gi} delay={gi * 0.1}>
                  <div className="glass-card" style={{ ...glass, padding: 28 }}>
                    <p style={{ fontSize: 10, letterSpacing: '0.2em', color: '#0e7490', textTransform: 'uppercase', fontWeight: 700, marginBottom: 20 }}>
                      {group.cat}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {group.items.map((skill, si) => (
                        <motion.div
                          key={si}
                          whileHover={{ y: -4, scale: 1.04 }}
                          className="skill-chip"
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 18px', borderRadius: 14,
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          <skill.icon size={18} style={{ color: skill.color, filter: `drop-shadow(0 0 5px ${skill.color}66)` }} />
                          <span style={{ color: '#d1d5db', fontSize: 14, fontWeight: 500 }}>{skill.name}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ PROJECTS ═══════════════════════════════════════════════ */}
        <section id="projects" style={{ padding: '112px 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal><SectionTitle sub="What I've Built">Featured Projects</SectionTitle></Reveal>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {projects.map((p, i) => (
                <Reveal key={i} delay={i * 0.15}>
                  <div
                    className="proj-card"
                    style={{
                      borderRadius: 20, overflow: 'hidden',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(24px)',
                      position: 'relative',
                    }}
                  >
                    {/* Top glow line — only on hover via CSS */}
                    <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${p.accent}, transparent)`, opacity: 0.6 }} />
                    <div style={{ padding: '36px 40px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 20 }}>
                          <span
                            className="proj-num"
                            style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 48, color: 'rgba(255,255,255,0.07)', lineHeight: 1, transition: 'all 0.3s' }}
                          >
                            {p.num}
                          </span>
                          <div>
                            <p style={{ fontSize: 10, letterSpacing: '0.2em', color: '#4b5563', textTransform: 'uppercase', marginBottom: 4 }}>{p.tag}</p>
                            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 28, color: '#fff', letterSpacing: '-0.02em' }}>{p.title}</h3>
                          </div>
                        </div>

                        <p style={{ color: '#9ca3af', fontSize: 15, lineHeight: 1.8, marginBottom: 24, maxWidth: 640 }}>{p.desc}</p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                          {p.features.map((f, fi) => (
                            <span
                              key={fi}
                              style={{
                                padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                                background: `${p.accent}14`, border: `1px solid ${p.accent}35`, color: p.accent,
                              }}
                            >
                              {f}
                            </span>
                          ))}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {p.tech.map((t, ti) => (
                            <span
                              key={ti}
                              style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, color: '#4b5563', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                        <a
                          href={p.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="glow-btn"
                          style={{ padding: '10px 20px', borderRadius: 14, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
                        >
                          <FaGithub size={14} /> GitHub
                        </a>
                        <div
                          style={{
                            width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                            background: `${p.accent}12`, border: `1px solid ${p.accent}25`,
                          }}
                        >
                          {p.emoji}
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CERTIFICATIONS & LEADERSHIP ════════════════════════════ */}
        <section id="certifications" style={{ padding: '112px 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal><SectionTitle sub="Achievements">Certifications & Leadership</SectionTitle></Reveal>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <Reveal delay={0.1}>
                <div className="glass-card" style={{ ...glassGlow, padding: 36, height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaAward style={{ color: '#f59e0b' }} size={16} />
                    </div>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: 15 }}>Certification</span>
                  </div>

                  <div style={{ borderLeft: '2px solid rgba(0,212,255,0.4)', paddingLeft: 24, paddingBottom: 8 }}>
                    <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', marginBottom: 12 }}>
                      Elite · 75%
                    </span>
                    <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: '#fff', marginBottom: 6 }}>
                      Data Structures & Algorithms using Java
                    </h4>
                    <p style={{ color: '#06b6d4', fontSize: 13, marginBottom: 4 }}>NPTEL – IIT Kharagpur</p>
                    <p style={{ color: '#4b5563', fontSize: 12, marginBottom: 12 }}>July – October 2025</p>
                    <p style={{ color: '#374151', fontSize: 11, fontFamily: 'monospace' }}>ID: NPTEL25CS148S1072700380</p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="glass-card" style={{ ...glass, padding: 36, height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaHeart style={{ color: '#ec4899' }} size={15} />
                    </div>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#fff', fontSize: 15 }}>Leadership</span>
                  </div>
                  <div style={{ borderLeft: '2px solid rgba(236,72,153,0.4)', paddingLeft: 24 }}>
                    <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 4 }}>
                      Organizer — IEEE Women in Engineering (WIE)
                    </h4>
                    <p style={{ color: '#06b6d4', fontSize: 13, marginBottom: 2 }}>Osmania University</p>
                    <p style={{ color: '#4b5563', fontSize: 12, marginBottom: 20 }}>April 2025 – Present</p>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { Icon: FaRegLightbulb, text: 'Led events, workshops & seminars to empower women in tech' },
                        { Icon: FaUsers, text: 'Collaborated with faculty to expand outreach initiatives' },
                        { Icon: FaRocket, text: 'Organised programmes reaching 300+ students in STEM' },
                      ].map(({ Icon, text }, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: '#9ca3af', fontSize: 13 }}>
                          <Icon style={{ color: '#ec4899', flexShrink: 0, marginTop: 2 }} size={12} />
                          {text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══ CONTACT ════════════════════════════════════════════════ */}
        <section id="contact" style={{ padding: '112px 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <Reveal><SectionTitle sub="Get In Touch">Let's Connect</SectionTitle></Reveal>

            <Reveal delay={0.1}>
              <div className="glass-card" style={{ ...glassGlow, padding: 48 }}>
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                  <p style={{ color: '#9ca3af', fontSize: 15, lineHeight: 1.8, maxWidth: 480, margin: '0 auto 20px' }}>
                    Open to internships, full-time roles, and interesting collaborations. Drop me a message and I'll get back within 24 hours.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                    <a href="mailto:saniyakousar013@gmail.com" style={{ color: '#00d4ff', fontSize: 13, textDecoration: 'none', textShadow: '0 0 16px rgba(0,212,255,0.5)' }}>
                      saniyakousar013@gmail.com
                    </a>
                    <span style={{ color: '#1f2937' }}>·</span>
                    <span style={{ color: '#4b5563', fontSize: 13 }}>+91 9059447996</span>
                  </div>
                </div>

                <form action="https://formspree.io/f/xyzqpwer" method="POST">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Name</label>
                      <input type="text" name="name" required placeholder="Your name" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Email</label>
                      <input type="email" name="email" required placeholder="your@email.com" />
                    </div>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 10, color: '#374151', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Message</label>
                    <textarea name="message" required rows={5} placeholder="What's on your mind?" style={{ resize: 'none' }} />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%', padding: '14px 0', borderRadius: 14,
                      fontWeight: 600, fontSize: 14, color: '#fff',
                      background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(6,182,212,0.15))',
                      border: '1px solid rgba(0,212,255,0.4)',
                      boxShadow: '0 0 30px rgba(0,212,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Send Message <FaArrowRight size={13} />
                  </motion.button>
                </form>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────── */}
        <footer style={{ padding: '32px 24px', textAlign: 'center', borderTop: '1px solid rgba(0,212,255,0.06)', position: 'relative', zIndex: 10 }}>
          <p style={{ color: '#1f2937', fontSize: 12 }}>
            Built with ❤️ by <span style={{ color: '#0e7490' }}>Saniya Kousar</span> · 2025
          </p>
        </footer>

      </div>
    </>
  )
}