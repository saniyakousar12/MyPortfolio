import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const InteractiveTerminal = () => {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [commandIndex, setCommandIndex] = useState(-1)
  const [commandHistory, setCommandHistory] = useState([])
  const terminalRef = useRef(null)
  const inputRef = useRef(null)

  // ASCII Art Banner
  const asciiArt = `
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║    ███████╗ █████╗ ███╗   ██╗██╗██╗   ██╗ █████╗          ║
║    ██╔════╝██╔══██╗████╗  ██║██║╚██╗ ██╔╝██╔══██╗         ║
║    ███████╗███████║██╔██╗ ██║██║ ╚████╔╝ ███████║         ║
║    ╚════██║██╔══██║██║╚██╗██║██║  ╚██╔╝  ██╔══██║         ║
║    ███████║██║  ██║██║ ╚████║██║   ██║   ██║  ██║         ║
║    ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝   ╚═╝  ╚═╝         ║
║                                                           ║
║           Welcome to Saniya's Interactive Terminal        ║
║           Type 'help' to see available commands           ║
╚═══════════════════════════════════════════════════════════╝
  `

  // Available commands
  const commands = {
    help: () => ({
      output: `
Available commands:
  about      - Learn about Saniya
  skills     - View technical skills
  projects   - List featured projects
  experience - Work experience & education
  contact    - Get contact information
  clear      - Clear terminal screen
  resume     - Download resume
  social     - Social media links
  github     - Open GitHub profile
  linkedin   - Open LinkedIn profile
  email      - Show email address
  date       - Show current date & time
  whoami     - Display user info
  `
    }),
    
    about: () => ({
      output: `
📝 ABOUT SANIYA KOUSAR
─────────────────────────────────────────────
🎓 Computer Science Engineering Student
📍 Telangana, India
💻 Full Stack Developer | AI Enthusiast
🏆 9.96 CGA (Diploma) | 9.63 CGA (B.E.)

Passionate about building scalable applications
that solve real-world problems. Experienced in
Java, Spring Boot, React, and AI technologies.

"Code is poetry, and I write sonnets."
      `
    }),
    
    skills: () => ({
      output: `
🛠️ TECHNICAL SKILLS
─────────────────────────────────────────────
💻 Languages:
   • Java, Python, JavaScript, C, C++

⚛️ Frameworks & Libraries:
   • React, Spring Boot, Spring AI, Hibernate
   • Tailwind CSS, Bootstrap

🗄️ Databases & Tools:
   • MySQL, Git, Postman, VS Code

📊 Key Strengths:
   • Data Structures & Algorithms
   • REST API Development
   • Problem Solving
      `
    }),
    
    projects: () => ({
      output: `
🚀 FEATURED PROJECTS
─────────────────────────────────────────────
📚 BookSwap [01]
   • AI-powered book exchange platform
   • Real-time WebSocket notifications
   • Secure payments & gamification
   • Tech: React, Spring Boot, Spring AI

🔍 Plagiarism Detector [02]
   • Text & image plagiarism detection
   • Hologram matching for images
   • Similarity percentage calculation
   • Tech: Python, Django, Image Processing

👉 Type 'github' to view projects on GitHub
      `
    }),
    
    experience: () => ({
      output: `
💼 WORK EXPERIENCE & EDUCATION
─────────────────────────────────────────────
💻 Java Developer Intern
   Infosys Springboard | Nov 2025 - Feb 2026
   • Core Java, OOP, Collections
   • Spring Boot REST APIs
   • Agile methodology

🎓 Education
   • B.E. Computer Science (9.63 CGA)
     UCET, Osmania University | 2024-Present
   • Diploma in CSE (9.96 CGA)
     Govt Polytechnic Warangal | 2021-2024

🏅 Leadership
   • Organizer - IEEE Women in Engineering
     Led events reaching 300+ students
      `
    }),
    
    contact: () => ({
      output: `
📫 CONTACT INFORMATION
─────────────────────────────────────────────
📧 Email: saniyakousar013@gmail.com
📱 Phone: +91 9059447996
💼 LinkedIn: /in/saniya-kousar-48b73327a
🐙 GitHub: /saniyakousar12

Type 'email' to send a message
      `
    }),
    
    social: () => ({
      output: `
🌐 SOCIAL LINKS
─────────────────────────────────────────────
• GitHub:    https://github.com/saniyakousar12
• LinkedIn:  https://linkedin.com/in/saniya-kousar-48b73327a
• Email:     saniyakousar013@gmail.com

Click the links above or type 'github'/'linkedin'
      `
    }),
    
    resume: () => ({
      output: `
📄 RESUME DOWNLOAD
─────────────────────────────────────────────
Click here to download: 
👉 [Resume will open in new tab]

Opening resume...
      `,
      action: () => {
        window.open('/resume.pdf', '_blank')
      }
    }),
    
    github: () => ({
      output: `
🚀 Opening GitHub profile...
      `,
      action: () => {
        window.open('https://github.com/saniyakousar12', '_blank')
      }
    }),
    
    linkedin: () => ({
      output: `
💼 Opening LinkedIn profile...
      `,
      action: () => {
        window.open('https://linkedin.com/in/saniya-kousar-48b73327a', '_blank')
      }
    }),
    
    email: () => ({
      output: `
📧 Opening mail client...
      `,
      action: () => {
        window.location.href = 'mailto:saniyakousar013@gmail.com'
      }
    }),
    
    date: () => ({
      output: `
📅 Current Date & Time:
   ${new Date().toLocaleString()}
      `
    }),
    
    whoami: () => ({
      output: `
👩‍💻 USER INFORMATION
─────────────────────────────────────────────
Username: saniya_kousar
Role: Full Stack Developer
Location: Telangana, India
Status: Open to opportunities ✨
      `
    }),
    
    clear: () => ({
      clear: true,
      output: ''
    })
  }

  const executeCommand = (cmd) => {
    const trimmedCmd = cmd.trim().toLowerCase()
    
    if (trimmedCmd === '') {
      return { output: '' }
    }
    
    const command = commands[trimmedCmd]
    
    if (command) {
      const result = command()
      if (result.action) result.action()
      return result
    } else {
      return {
        output: `Command not found: ${cmd}\nType 'help' to see available commands.`
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    
    // Add to command history
    setCommandHistory(prev => [...prev, input])
    setCommandIndex(-1)
    
    // Execute command
    const result = executeCommand(input)
    
    // Add to history
    setHistory(prev => [
      ...prev,
      { type: 'input', content: `> ${input}` },
      { type: 'output', content: result.output }
    ])
    
    // Clear input
    setInput('')
    
    // Handle clear command
    if (input.trim().toLowerCase() === 'clear') {
      setHistory([])
    }
    
    // Scroll to bottom
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight
      }
    }, 100)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0 && commandIndex < commandHistory.length - 1) {
        const newIndex = commandIndex + 1
        setCommandIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (commandIndex > 0) {
        const newIndex = commandIndex - 1
        setCommandIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (commandIndex === 0) {
        setCommandIndex(-1)
        setInput('')
      }
    }
  }

  // Focus input on click
  useEffect(() => {
    const handleClick = () => {
      inputRef.current?.focus()
    }
    const terminal = terminalRef.current
    if (terminal) {
      terminal.addEventListener('click', handleClick)
      return () => terminal.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card"
      style={{
        margin: '40px auto',
        maxWidth: 900,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* Terminal Header */}
      <div style={{
        background: 'rgba(0,0,0,0.5)',
        padding: '12px 20px',
        borderBottom: '1px solid rgba(0,212,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
        </div>
        <span style={{ color: '#00d4ff', fontSize: 12, fontFamily: 'monospace' }}>
          saniya@portfolio:~/
        </span>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        style={{
          height: 500,
          overflowY: 'auto',
          padding: '20px',
          background: 'rgba(2,11,24,0.9)',
          fontFamily: 'monospace',
          fontSize: 14,
          color: '#00ff9d',
        }}
      >
        {/* ASCII Art */}
        <pre style={{
          color: '#00d4ff',
          fontSize: 10,
          marginBottom: 20,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}>
          {asciiArt}
        </pre>

        {/* Command History */}
        <AnimatePresence>
          {history.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{ marginBottom: 8 }}
            >
              {item.type === 'input' ? (
                <div style={{ color: '#00d4ff' }}>{item.content}</div>
              ) : (
                <pre style={{
                  color: '#9ca3af',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  fontFamily: 'monospace',
                  margin: '4px 0 12px 0',
                  lineHeight: 1.6,
                }}>
                  {item.content}
                </pre>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Input Line */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
          <span style={{ color: '#00d4ff', marginRight: 8 }}>$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontFamily: 'monospace',
              fontSize: 14,
              flex: 1,
              outline: 'none',
            }}
            autoFocus
          />
        </form>
      </div>

      {/* Terminal Footer */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        padding: '8px 20px',
        borderTop: '1px solid rgba(0,212,255,0.1)',
        fontSize: 11,
        color: '#4b5563',
        fontFamily: 'monospace',
      }}>
        ⚡ Type 'help' to get started | Use ↑/↓ arrows for command history
      </div>
    </motion.div>
  )
}

export default InteractiveTerminal