import { useEffect, useMemo, useState } from "react";
import {
  listAssets, createAsset, deleteAsset,
  listTags, createTag, getPresign
} from "../api";

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [newTag, setNewTag] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [file, setFile] = useState(null);           // NEW
  const [busy, setBusy] = useState(false);          // NEW

  const tagById = useMemo(
    () => Object.fromEntries(tags.map((t) => [t.id, t])),
    [tags]
  );

  async function refresh() {
    setLoading(true);
    setErr("");
    try {
      const [a, t] = await Promise.all([listAssets(), listTags()]);
      setAssets(a.assets || a);
      setTags(t.tags || t);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onCreateTag(e) {
    e.preventDefault();
    if (!newTag.trim()) return;
    try {
      await createTag(newTag.trim());
      setNewTag("");
      await refresh();
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  }

  // NEW: tiny helper for S3 PUT
  async function putToS3(url, file, headers) {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": file?.type || "application/octet-stream",
        ...(headers || {}),
      },
      body: file,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`S3 PUT failed ${res.status}: ${text}`);
    }
  }

  async function onCreateAsset(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);                                   // NEW
    try {
      // If a file was chosen, presign + upload first
      let publicUrl = null;                          // NEW
      if (file) {
        const pre = await getPresign(file.name, file.type || "application/octet-stream");
        await putToS3(pre.uploadUrl, file, pre.headers || {});
        publicUrl = pre.publicUrl;
      }

      const payload = {
        name: name.trim(),
        description: description.trim(),
        url: publicUrl,                              // NEW: include S3 URL if uploaded
        // backend expects tag NAMES (per your create route)
        tags: selectedTagIds.map((id) => tagById[id]?.name).filter(Boolean),
      };
      const created = await createAsset(payload);
      const row = created.assets ? created.assets[0] : created;
      setAssets((cur) => [row, ...cur]);            // optimistic add

      // reset form
      setName("");
      setDescription("");
      setSelectedTagIds([]);
      setFile(null);                                // NEW
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);                                // NEW
    }
  }

  async function onDeleteAsset(id) {
    if (!confirm("Delete this asset?")) return;
    try {
      await deleteAsset(id);
      setAssets((cur) => cur.filter((a) => a.id !== id));
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Asset Hub</h1>

      {err && (
        <div style={{ background: "#ffe5e5", border: "1px solid #ff9b9b", padding: 10, marginBottom: 12 }}>
          {err}
        </div>
      )}

      {/* Create Tag */}
      <section style={{ margin: "1.5rem 0", padding: "1rem", border: "1px solid #ddd", borderRadius: 8 }}>
        <h2 style={{ marginTop: 0 }}>Create Tag</h2>
        <form onSubmit={onCreateTag} style={{ display: "flex", gap: 8 }}>
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="e.g. unreal"
            style={{ flex: 1, padding: 8 }}
          />
          <button type="submit">Add Tag</button>
        </form>
        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {tags.map((t) => (
            <span key={t.id} style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: 999 }}>
              {t.name}
            </span>
          ))}
        </div>
      </section>

      {/* Create Asset */}
      <section style={{ margin: "1.5rem 0", padding: "1rem", border: "1px solid #ddd", borderRadius: 8 }}>
        <h2 style={{ marginTop: 0 }}>Create Asset</h2>
        <form onSubmit={onCreateAsset} style={{ display: "grid", gap: 10 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
            style={{ padding: 8 }}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            style={{ padding: 8 }}
          />
          {/* NEW: File input */}
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>File (optional)</label>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {file && (
              <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
                {file.name} • {file.type || "application/octet-stream"} • {file.size} bytes
              </div>
            )}
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6 }}>Tags</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {tags.map((t) => {
                const checked = selectedTagIds.includes(t.id);
                return (
                  <label
                    key={t.id}
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: 8,
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelectedTagIds((cur) =>
                          checked ? cur.filter((id) => id !== t.id) : [...cur, t.id]
                        )
                      }
                      style={{ marginRight: 6 }}
                    />
                    {t.name}
                  </label>
                );
              })}
            </div>
          </div>
          <button type="submit" disabled={busy}>{busy ? "Saving…" : "Create"}</button>
        </form>
      </section>

      {/* List */}
      <section style={{ margin: "1.5rem 0" }}>
        <h2 style={{ marginTop: 0 }}>Assets</h2>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>ID</th>
                  <th style={th}>Name</th>
                  <th style={th}>Tags</th>
                  <th style={th}>URL</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a) => (
                  <tr key={a.id}>
                    <td style={td}>{a.id}</td>
                    <td style={td}>{a.name}</td>
                    <td style={td}>{(a.tags || []).map((t) => t.name || t).join(", ")}</td>
                    <td style={td}>
                      {a.url ? (
                        <a href={a.url} target="_blank" rel="noreferrer">open</a>
                      ) : ("-")}
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>
                      <button onClick={() => onDeleteAsset(a.id)} style={{ color: "#b00" }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!assets.length && !loading && (
                  <tr>
                    <td style={td} colSpan={5}>No assets yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const th = { textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 6px" };
const td = { borderBottom: "1px solid #eee", padding: "8px 6px", verticalAlign: "top" };
