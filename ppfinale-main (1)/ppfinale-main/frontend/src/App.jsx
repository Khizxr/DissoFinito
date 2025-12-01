import { useEffect, useState } from "react";
import api, { setAuthToken } from "./api/client";
import Dashboard from "./components/Dashboard";
import LoginForm from "./components/LoginForm";

function ErrorBoundary({ students }) {
  const [error, setError] = useState(null)

  if (error) {
    return (
      <div>
        <h2>Something went wrong.</h2>
        <pre>{error.message}</pre>
      </div>
    )
  }

  return (
    <ErrorCatcher onError={setError}>
      {students}
    </ErrorCatcher>
  )
}

function ErrorCatcher({ students, onError }) {
  try {
    return students
  } catch (e) {
    onError(e)
    return null
  }
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogin = async (email, password) => {
  try {
    const res = await api.post("/auth/login", { email, password })
    setAuthToken(res.data.access_token)
    const meRes = await api.get("/auth/me")
    setUser(meRes.data.user)
  } catch (err) {
    console.error("Login error:", err)
    alert("Login failed: " + (err.response?.data?.msg || err.message))
  }
}


  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <Dashboard user={user} />;
}

export default App;
