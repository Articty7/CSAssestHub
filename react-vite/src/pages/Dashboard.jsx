// react-vite/src/pages/Assets.jsx
import { useEffect, useMemo, useState } from "react";
import {
  // Asset APIs
  listAssets,
  createAsset,
  deleteAsset,
  // Tag APIs
  listTags,
  createTag,
  updateTag,
  deleteTag,
  // Upload (S3 presign) helper
  getPresign,
} from "../api";

/**
 * Assets page (MVP)
 * - Create & list assets
 * - Optional file upload to S3 via presigned URL
 * - Tag CRUD (create/list/edit/delete) + attach tags to new assets
 *
 * NOTE:
 * - Backend expects tag NAMES when creating assets (change to IDs if you later want).
 * - CSRF header is injected by api.js interceptor for mutating requests.
 */
export default function Dashboard() {
  // ---------- Data state ----------
  const [assets, setAssets] = useState([]);
  const [tags, setTags] = useState([]);

  // ---------- UI state ----------
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ---------- Create Tag form ----------
  const [newTag, setNewTag] = useState("");

  // ---------- Create Asset form ----------
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  // ---------- Inline Tag Editing ----------
  const [editingTagId, setEditingTagId] = useState(null);
  const [editTagName, setEditTagName] = useState("");

  // For quick lookup of tag by id
  const tagById = useMemo(
    () => Object.fromEntries(tags.map((t) => [t.id, t])),
    [tags]
  );

  // Fetch assets + tags
  async function refresh() {
    setLoading(true);
    setErr("");
    try {
      const [a, t] = await Promise.all([listAssets(), listTags()]);
      // Support either {assets:[...]} or raw [...]
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

  // ========== Tag: Create ==========
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

  // ========== Tag: Edit/Delete ==========
  function startEditTag(tag) {
    setEditingTagId(tag.id);
    setEditTagName(tag.name || "");
  }
  function cancelEditTag() {
    setEditingTagId(null);
    setEditTagName("");
  }
  async function saveEditTag(id) {
    setErr("");
    try {
      const updated = await updateTag(id, editTagName.trim());
      // Patch local list for snappy UI (or call refresh())
      setTags((cur) => cur.map((t) => (t.id === id ? updated : t)));
      cancelEditTag();
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  }
  async function onDeleteTag(id) {
    if (!confirm("Delete this tag?")) return;
    try {
      await deleteTag(id);
      setTags((cur) => cur.filter((t) => t.id !== id));
      // Uncheck removed tag if it was selected in form
      setSelectedTagIds((cur) => cur.filter((tid) => tid !== id));
      cancelEditTag();
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  }

  // ========== S3 PUT (uses the presigned URL + headers) ==========
  async function putToS3(url, fileObj, headers) {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        // IMPORTANT: Safari/Chrome must send the same Content-Type used in the presign
        "Content-Type": fileObj?.type || "application/octet-stream",
        ...(headers || {}),
      },
      body: fileObj,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`S3 PUT failed ${res.status}: ${text}`);
    }
  }

  // ========== Asset: Create ==========
  async function onCreateAsset(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);

    try {
      // 1) If file chosen, ask backend for presigned URL & upload to S3
      let publicUrl = null;
      if (file) {
        const pre = await getPresign(
          file.name,
          file.type || "application/octet-stream"
        );
        // Upload bytes to S3
        await putToS3(pre.uploadUrl, file, pre.headers || {});
        // URL to store in DB (and to open/download later)
        publicUrl = pre.publicUrl;
      }

      // 2) Build asset payload
      const payload = {
        name: name.trim(),
        description: description.trim(),
        url: publicUrl, // may be null if no file uploaded
        // Backend expects tag NAMES (change to selectedTagIds if you switch backend)
        tags: selectedTagIds.map((id) => tagById[id]?.name).filter(Boolean),
      };

      // 3) Create asset in API
      const created = await createAsset(payload);
      const row = created.assets ? created.assets[0] : created;

      // 4) Optimistically update list
      setAssets((cur) => [row, ...cur]);

      // 5) Reset form
      setName("");
      setDescription("");
      setSelectedTagIds([]);
      setFile(null);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  }

  // ========== Asset: Delete ==========
  async function onDeleteAsset(id) {
    if (!confirm("Delete this asset?")) return;
    try {
      await deleteAsset(id);
      setAssets((cur) => cur.filter((a) => a.id !== id));
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  }

  // Simple inline styles (kept here for speed)
  const th = { textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 6px" };
  const td = { borderBottom: "1px solid #eee", padding: "8px 6px", verticalAlign: "top" };

  return (
    <div
      style={{
        maxWidth: 980,
        margin: "2rem auto",
        padding: "0 1rem",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: 6 }}>AssetsHub Dashboard</h1>
      <p style={{ marginTop: 0, color: "#666" }}>
        Create tags, upload assets (optional file), and manage your library.
      </p>

      {/* Error banner */}
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

      {/* -------------------- TAGS: Create + List/Edit/Delete -------------------- */}
      <section
        style={{
          margin: "1.5rem 0",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: 8,
          background: "#fafafa",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Tags</h2>

        {/* Create Tag */}
        <form onSubmit={onCreateTag} style={{ display: "flex", gap: 8 }}>
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="New tag name (e.g., unreal)"
            style={{ flex: 1, padding: 8 }}
          />
          <button type="submit">Add Tag</button>
        </form>

        {/* Editable Tag List */}
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {tags.map((t) => {
            const isEditing = editingTagId === t.id;
            return (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid #e5e5e5",
                  borderRadius: 8,
                  padding: "6px 8px",
                  background: "#fff",
                }}
              >
                {isEditing ? (
                  <>
                    <input
                      value={editTagName}
                      onChange={(e) => setEditTagName(e.target.value)}
                      style={{ flex: 1, padding: 6 }}
                    />
                    <button onClick={() => saveEditTag(t.id)}>Save</button>
                    <button onClick={cancelEditTag}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1 }}>{t.name}</span>
                    <button onClick={() => startEditTag(t)} style={{ marginRight: 6 }}>
                      Edit
                    </button>
                    <button onClick={() => onDeleteTag(t.id)} style={{ color: "#b00" }}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            );
          })}
          {!tags.length && <div style={{ color: "#666" }}>No tags yet.</div>}
        </div>
      </section>

      {/* -------------------- ASSETS: Create -------------------- */}
      <section
        style={{
          margin: "1.5rem 0",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Create Asset</h2>

        <form onSubmit={onCreateAsset} style={{ display: "grid", gap: 10 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Asset name"
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

          {/* Optional File Upload */}
          <div>
            <label style={{ display: "block", marginBottom: 6 }}>File (optional)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && (
              <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
                {file.name} • {file.type || "application/octet-stream"} • {file.size} bytes
              </div>
            )}
          </div>

          {/* Choose Tags (checkboxes) */}
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
                      userSelect: "none",
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

          <button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Create"}
          </button>
        </form>
      </section>

      {/* -------------------- ASSETS: List -------------------- */}
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
                    <td style={td}>
                      {(a.tags || []).map((t) => t.name || t).join(", ")}
                    </td>
                    <td style={td}>
                      {a.url ? (
                        <a href={a.url} target="_blank" rel="noreferrer">
                          open
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>
                      <button
                        onClick={() => onDeleteAsset(a.id)}
                        style={{ color: "#b00" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!assets.length && !loading && (
                  <tr>
                    <td style={td} colSpan={5}>
                      No assets yet.
                    </td>
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
