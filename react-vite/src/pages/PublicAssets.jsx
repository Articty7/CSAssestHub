import { useEffect, useState } from "react";
import { listAssets } from "../api";

export default function PublicAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function refresh() {
    setLoading(true);
    setErr("");
    try {
      const a = await listAssets();
      setAssets(a.assets || a);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div style={{ maxWidth: 980, margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ marginBottom: 6 }}>AssetsHub — Public Demo</h1>
      <p style={{ marginTop: 0, color: "#666" }}>
        Read-only view. No login required.
      </p>

      <div
        style={{
          marginBottom: 16,
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 10,
          background: "#fafafa",
        }}
      >
        <strong>Public Demo Mode</strong>
        <div style={{ fontSize: 14, opacity: 0.85 }}>
          Browse approved assets and open download links. Uploading and admin tools are disabled.
        </div>
      </div>

      {err && (
        <div
          style={{
            background: "#ffe5e5",
            border: "1px solid #ff9b9b",
            padding: 10,
            marginBottom: 12,
            borderRadius: 8,
          }}
        >
          {err}
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 6px" }}>ID</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 6px" }}>Name</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 6px" }}>Tags</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 6px" }}>URL</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id}>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px 6px" }}>{a.id}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px 6px" }}>{a.name}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px 6px" }}>
                    {(a.tags || []).map((t) => t.name || t).join(", ")}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px 6px" }}>
                    {a.url ? (
                      <a href={a.url} target="_blank" rel="noreferrer">
                        open
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
              {!assets.length && (
                <tr>
                  <td style={{ padding: "8px 6px" }} colSpan={4}>
                    No assets available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
