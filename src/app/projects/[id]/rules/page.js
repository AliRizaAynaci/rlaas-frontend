'use client';

import { Copy, Pencil } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

/* ---------- static options ---------- */
const STRATEGIES = [
  { label: 'Token Bucket', value: 'token_bucket' },
  { label: 'Sliding Window', value: 'sliding_window' },
  { label: 'Fixed Window',  value: 'fixed_window'  },
  { label: 'Leaky Bucket',  value: 'leaky_bucket'  },
];
const KEY_BY = [
  { label: 'API Key',    value: 'api_key' },
  { label: 'IP Address', value: 'ip'      },
];

const FAIL_OPEN_OPTIONS = [
  { label: 'True',  value: 'true'  },
  { label: 'False', value: 'false' },
];

const API = process.env.NEXT_PUBLIC_API_BASE_URL;


/* ---------- component ---------- */
export default function RulesPage() {
  const { id: projectId } = useParams();
  const router            = useRouter();

  /* ---------- state ---------- */
  const [project, setProject]   = useState(null);  // { id, name, api_key }
  const [rules,   setRules]     = useState(null);  // null = loading
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState(null); // rule id being edited
  const [confirmId, setConfirmId] = useState(null); // rule id pending delete
  const [saving,    setSaving]    = useState(false);

  const [form, setForm] = useState({
    endpoint: '', strategy: '', key_by: '', limit_count: '', window_seconds: '', fail_open : false,
  });

  /* ---------- helpers ---------- */
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('API key copied!');
    } catch {
      alert('Copy failed, select manually.');
    }
  };

  /* ---------- fetch project ---------- */
  useEffect(() => {
    fetch(`${API}/projects`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : []))
      .then(list => {
        const p = list.find(pr => String(pr.id) === String(projectId));
        if (!p) router.push('/dashboard');
        else    setProject(p);
      })
      .catch(() => router.push('/dashboard'));
  }, [projectId, router]);

  /* ---------- fetch rules ---------- */
  useEffect(() => {
    if (!project) return;
    fetch(`${API}/projects/${projectId}/rules`, {
      credentials: 'include',
    })
      .then(r => (r.ok ? r.json() : []))
      .then(setRules)
      .catch(() => setRules([]));
  }, [project]);

  if (!project || rules === null) return null; // loading

  /* ---------- metrics ---------- */
  const metrics = [
    { label: 'Total Rules',         value: rules.length },
    { label: 'Distinct Strategies', value: new Set(rules.map(r => r.strategy)).size },
  ];

  /* ---------- form helpers ---------- */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ endpoint:'', strategy:'', key_by:'', limit_count:'', window_seconds:'' });
    setEditId(null);
  };

  const saveRule = async () => {
    setSaving(true);

    const body = {
      endpoint: form.endpoint,
      strategy: form.strategy,
      key_by:   form.key_by,
      limit_count:    Number(form.limit_count),
      window_seconds: Number(form.window_seconds),
      fail_open: form.fail_open === 'true', // convert string to boolean
    };

    const url    = editId
      ? `${API}/projects/${projectId}/rules/${editId}`
      : `${API}/projects/${projectId}/rules`;
    const method = editId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      if (editId) {
        setRules(prev => prev.map(r => (r.id === editId ? { ...r, ...body } : r)));
      } else {
        const newRule = await res.json();
        setRules(prev => [...prev, newRule]);
      }
    }

    setSaving(false);
    setShowForm(false);
    resetForm();
  };

  const deleteRule = async (id) => {
    await fetch(`${API}/projects/${projectId}/rules/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setRules(prev => prev.filter(r => r.id !== id));
  };

  /* ---------- JSX ---------- */
  return (
    <main className={styles.wrapper}>
      {/* ----- Sidebar ----- */}
      <aside className={styles.sidebar}>
        {metrics.map(m => (
          <div key={m.label} className={styles.metricBox}>
            <span className={styles.metricLabel}>{m.label}</span>
            <span className={styles.metricValue}>{m.value}</span>
          </div>
        ))}
      </aside>

      {/* ----- Main content ----- */}
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <h1 className={styles.projectName}>{project.name}</h1>
            <span className={styles.subtitle}>Rules</span>
          </div>

          <div className={styles.keyBadge}>
            <span className={styles.keyLabel}>API&nbsp;Key</span>
            <code className={styles.keyText}>{project.api_key}</code>
            <button
              aria-label="Copy API key"
              className={styles.copyBtn}
              onClick={() => copyToClipboard(project.api_key)}
            >
              <Copy size={16} strokeWidth={2} />
            </button>
          </div>

          <button className={styles.primary} onClick={() => { resetForm(); setShowForm(true); }}>
            Add Rule
          </button>
        </header>

        {/* ----- table / empty ----- */}
        {rules.length === 0 ? (
          <p className={styles.empty}>No rules yet for this project.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Endpoint</th><th>Strategy</th><th>Key By</th>
                  <th>Limit</th><th>Window (s)</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rules.map(r => (
                  <tr key={r.id}>
                    <td>{r.endpoint}</td>
                    <td>{r.strategy}</td>
                    <td>{r.key_by}</td>
                    <td>{r.limit_count}</td>
                    <td>{r.window_seconds}</td>
                    <td>
                      {/* edit */}
                      <button
                        className={styles.edit}
                        onClick={() => {
                          setEditId(r.id);
                          setForm({
                            endpoint: r.endpoint,
                            strategy: r.strategy,
                            key_by:   r.key_by,
                            limit_count: r.limit_count,
                            window_seconds: r.window_seconds,
                            fail_open: r.fail_open,
                          });
                          setShowForm(true);
                        }}
                      >
                        <Pencil size={16} strokeWidth={2} />
                      </button>

                      {/* delete */}
                      <button
                        onClick={() => setConfirmId(r.id)}
                        className={styles.del}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ----- Add / Edit Modal ----- */}
      {showForm && (
        <div className={styles.backdrop} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{editId ? 'Update Rule' : 'Add Rule'}</h2>

            <form
              className={styles.formGrid}
              onSubmit={e => { e.preventDefault(); saveRule(); }}
            >
              <label className={styles.full}>
                <span>Endpoint</span>
                <input
                  name="endpoint"
                  value={form.endpoint}
                  onChange={handleChange}
                  placeholder="/api/pay"
                  required
                />
              </label>

              <label>
                <span>Strategy</span>
                <select
                  name="strategy"
                  value={form.strategy}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose…</option>
                  {STRATEGIES.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Key&nbsp;By</span>
                <select
                  name="key_by"
                  value={form.key_by}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose…</option>
                  {KEY_BY.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Limit&nbsp;Count</span>
                <input
                  type="number"
                  name="limit_count"
                  value={form.limit_count}
                  onChange={handleChange}
                  placeholder="100"
                  min="1"
                  required
                />
              </label>

              <label>
                <span>Window&nbsp;(sec)</span>
                <input
                  type="number"
                  name="window_seconds"
                  value={form.window_seconds}
                  onChange={handleChange}
                  placeholder="60"
                  min="1"
                  required
                />
              </label>

              <label>
                <span>Fail&nbsp;Open</span>
                <select
                  name="fail_open"
                  value={form.fail_open}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose…</option>
                  {FAIL_OPEN_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>

              <div className={`${styles.actions} ${styles.full}`}>
                <button type="submit" className={styles.primary} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  className={styles.cancel}
                  disabled={saving}
                  onClick={() => { setShowForm(false); resetForm(); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----- Confirm Delete Modal ----- */}
      {confirmId !== null && (
        <div className={styles.backdrop} onClick={() => setConfirmId(null)}>
          <div className={styles.confirmBox} onClick={e => e.stopPropagation()}>
            <p>Delete this rule permanently?</p>
            <div className={styles.confirmActions}>
              <button
                className={styles.danger}
                onClick={() => { deleteRule(confirmId); setConfirmId(null); }}
              >
                Yes, delete
              </button>
              <button className={styles.cancel} onClick={() => setConfirmId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
