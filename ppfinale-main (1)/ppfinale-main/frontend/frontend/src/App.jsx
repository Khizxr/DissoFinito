import { useEffect, useState } from "react"
import api, { setAuthToken } from "./api/client"
import Dashboard from "./components/Dashboard"
import LoginForm from "./components/LoginForm"
import "./App.css"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const handleLogin = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password })
      setAuthToken(res.data.access_token)
      const meRes = await api.get("/auth/me")
      setUser(meRes.data.user)
    } catch (err) {
      console.error("Login error:", err)
      if (err.response) {
        alert("Login failed: " + (err.response.data?.msg || err.response.statusText))
      } else if (err.request) {
        alert("Login failed: cannot reach backend (network error)")
      } else {
        alert("Login failed: " + err.message)
      }
    }
  }

  if (loading) return <div>Loading...</div>

  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <Dashboard user={user} />
}

export default App
