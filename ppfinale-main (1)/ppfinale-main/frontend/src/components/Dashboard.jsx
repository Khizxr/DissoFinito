import { useEffect, useState } from "react"
import api from "../api/client"

function Dashboard({ user }) {
  const [scans, setScans] = useState([])
  const [selectedScanId, setSelectedScanId] = useState(null)
  const [findings, setFindings] = useState([])

  useEffect(() => {
    const loadScans = async () => {
      try {
        const res = await api.get("/scans")
        const list = res.data || []
        setScans(list)
        if (list.length > 0) {
          setSelectedScanId(list[0].id)
        }
      } catch (err) {
        console.error("Error loading scans", err)
      }
    }
    loadScans()
  }, [])

  useEffect(() => {
    const loadFindings = async () => {
      if (!selectedScanId) {
        setFindings([])
        return
      }
      try {
        const res = await api.get(`/findings/${selectedScanId}`)
        setFindings(res.data || [])
      } catch (err) {
        console.error("Error loading findings", err)
      }
    }
    loadFindings()
  }, [selectedScanId])

  return (
    <div className="dashboard">
      <h1>Security Dashboard</h1>
      <p>Signed in as {user.email}</p>

      <section>
        <h2>Scans</h2>
        {scans.length === 0 ? (
          <p>No scans yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Target URL</th>
                <th>Tool</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan) => (
                <tr
                  key={scan.id}
                  onClick={() => setSelectedScanId(scan.id)}
                  style={{
                    cursor: "pointer",
                    background:
                      scan.id === selectedScanId ? "#eee" : "transparent",
                  }}
                >
                  <td>{scan.id}</td>
                  <td>{scan.target_url}</td>
                  <td>{scan.tool}</td>
                  <td>{scan.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Findings</h2>
        {findings.length === 0 ? (
          <p>No findings for this scan.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f) => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.type}</td>
                  <td>{f.severity}</td>
                  <td>{f.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

export default Dashboard
