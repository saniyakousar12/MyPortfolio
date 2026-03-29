import { motion } from 'framer-motion'

const Navbar = () => {
  const scrollToSection = (id) => {
    const element = document.querySelector(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
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
        {['about', 'skills', 'projects', 'certifications', 'contact'].map(s => (
          <button
            key={s}
            onClick={() => scrollToSection(`#${s}`)}
            className="nav-link"
            style={{
              background: 'none', border: 'none', color: '#9ca3af', fontSize: 13,
              textTransform: 'capitalize', fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.02em', cursor: 'pointer'
            }}
          >
            {s}
          </button>
        ))}
      </div>
      
      <a
        href="mailto:saniyakousar013@gmail.com"
        className="glow-btn"
        style={{
          padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
          background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(6,182,212,0.1))',
          border: '1px solid rgba(0,212,255,0.4)',
          boxShadow: '0 0 20px rgba(0,212,255,0.12)',
          color: '#67e8f9',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(6,182,212,0.2))'
          e.currentTarget.style.boxShadow = '0 0 40px rgba(0,212,255,0.3), 0 0 80px rgba(0,212,255,0.08)'
          e.currentTarget.style.borderColor = 'rgba(0,212,255,0.7)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(6,182,212,0.1))'
          e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,255,0.12)'
          e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'
          e.currentTarget.style.transform = 'translateY(0px)'
        }}
      >
        Hire Me
      </a>
    </motion.nav>
  )
}

export default Navbar