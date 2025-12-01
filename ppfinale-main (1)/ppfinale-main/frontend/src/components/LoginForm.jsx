import { useState } from "react"
import "./LoginForm.css"

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("admin@example.com")
  const [password, setPassword] = useState("password123")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      await onLogin(email, password)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <div className="login-scan-lines" />
      <div className="login-noise" />

      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo-bracket">[</span>
          <span className="login-logo-text">SECURITY</span>
          <span className="login-logo-highlight">NODE</span>
          <span className="login-logo-bracket">]</span>
        </div>

        <p className="login-tagline">
          SYSTEM ACCESS RESTRICTED • AUTHORISATION REQUIRED
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">
            Email address
            <input
              type="email"
              autoComplete="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="login-label">
            Password
            <input
              type="password"
              autoComplete="current-password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button type="submit" className="login-button" disabled={loading}>
            <span className="login-button-glow" />
            {loading ? "VERIFYING CREDENTIALS…" : "INITIATE AUTHORISATION"}
          </button>
        </form>

        <div className="login-footer">
          <span className="login-pill login-pill-green">
            • STATUS: STANDBY
          </span>
          <span className="login-pill login-pill-pink">
            TRACE ID: #{Math.floor(Math.random() * 9999)
              .toString()
              .padStart(4, "0")}
          </span>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
