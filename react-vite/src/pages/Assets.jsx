import { useEffect, useMemo, useState } from "react";
import { listAssets, createAsset, deleteAsset, listTags, createTag } from "../api";

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

  const tagById = useMemo(
    () => Object.fromEntries(tags.map((t) => [t.id, t])),
    [tags]
  );

  async function refresh() {
    setLoading(true);
    setErr("");
    try {
      const [a, t] = await Promise.all([listAssets(), listTags()]);
      setAssets(a.assets || a); // supports either {assets:[...]} or [...]
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

  async function onCreateAsset(e) {
    e.preventDefault();
    setErr("");
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        // If your backend expects tag NAMES, this is correct.
        // If it expects IDs, change to: tags: selectedTagIds
        tags: selectedTagIds.map((id) => tagById[id]?.name).filter(Boolean),
      };
      await createAsset(payload);
      setName("");
      setDescription("");
      setSelectedTagIds([]);
      await refresh();
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
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
    <div
      style={{
        maxWidth: 900,
        margin: "2rem auto",
        padding: "0 1rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>Asset Hub</h1>

      {err && (
        <div
          style={{
            background: "#ffe5e5",
            border: "1px solid #ff9b9b",
            padding: 10,
            marginBottom: 12,
          }}
        >
          {err}
        </div>
      )}

      {/* Create Tag */}
      <section
        style={{ margin: "1.5rem 0", padding: "1rem", border: "1px solid #ddd", borderRadius: 8 }}
      >
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
            <span
              key={t.id}
              style={{ padding: "4px 8px", border: "1px solid #ccc", borderRadius: 999 }}
            >
              {t.name}
            </span>
          ))}
        </div>
      </section>

      {/* Create Asset */}
      <section
        style={{ margin: "1.5rem 0", padding: "1rem", border: "1px solid #ddd", borderRadius: 8 }}
      >
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
          <button type="submit">Create</button>
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
                        <a href={a.url} target="_blank" rel="noreferrer">
                          open
                        </a>
                      ) : (
                        "-"
                      )}
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

const th = { textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px 6px" };
const td = { borderBottom: "1px solid #eee", padding: "8px 6px", verticalAlign: "top" };
