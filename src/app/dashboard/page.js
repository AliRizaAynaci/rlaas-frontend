'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

const API = process.env.NEXT_PUBLIC_API_BASE_URL;


export default function DashboardPage() {
  const { isLoggedIn } = useAuth();
  const router         = useRouter();

  const [projects,   setProjects]   = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [projName,   setProjName]   = useState('');
  const [saving,     setSaving]     = useState(false);

  const [confirmId,  setConfirmId]  = useState(null);  // ← hangisi silinecek?
  const [deletingId, setDeletingId] = useState(null);  // aktif silme animasyonu

  /* ---------- create project ---------- */
  const createProject = async () => {
    if (!projName.trim()) return;
    setSaving(true);

    const res = await fetch(`${API}/projects`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_name: projName.trim() }),
    });

    if (res.ok) {
      const newProj = await res.json();
      setProjects(prev => [...(prev || []), newProj]);
      setProjName('');
      setShowCreate(false);
    }
    setSaving(false);
  };

  /* ---------- delete project ---------- */
  const deleteProject = async (id) => {
    setDeletingId(id);
    await fetch(`${API}/projects/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setProjects(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
  };

  /* ---------- auth guard ---------- */
  useEffect(() => {
    if (isLoggedIn === false) router.push('/');
  }, [isLoggedIn, router]);

  /* ---------- fetch projects ---------- */
  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`${API}/projects`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : []))
      .then(setProjects)
      .catch(() => setProjects([]));
  }, [isLoggedIn]);

  if (isLoggedIn === null || projects === null) return null; // loading

  /* ---------- UI ---------- */
  return (
    <main className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.desc}>
            Manage your API projects and rate-limit rules in one place.
          </p>
        </div>

        <button className={styles.create} onClick={() => setShowCreate(true)}>
          Create New Project
        </button>
      </header>

      {/* List or empty */}
      {projects.length === 0 ? (
        <section className={styles.empty}>
          <p>You have no projects yet.</p>
          <button
            className={styles.primaryButton}
            onClick={() => setShowCreate(true)}
          >
            Create Your First Project
          </button>
        </section>
      ) : (
        <section className={styles.list}>
          {projects.map(proj => (
            <div key={proj.id} className={styles.card}>
              <h2 className={styles.cardTitle}>{proj.name}</h2>
              <p className={styles.cardKey}>API Key: {proj.api_key}</p>

              <div className={styles.cardActions}>
                <button
                  className={styles.cardButton}
                  onClick={() => router.push(`/projects/${proj.id}/rules`)}
                >
                  View Rules
                </button>

                <button
                  className={styles.cardDelete}
                  disabled={deletingId === proj.id}
                  onClick={() => setConfirmId(proj.id)}
                >
                  {deletingId === proj.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ---------- Create-project modal ---------- */}
      {showCreate && (
        <div
          className={styles.backdrop}
          onClick={() => !saving && setShowCreate(false)}
        >
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>New Project</h2>

            <form
              className={styles.modalForm}
              onSubmit={e => {
                e.preventDefault();
                createProject();
              }}
            >
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Project Name</span>
                <input
                  value={projName}
                  onChange={e => setProjName(e.target.value)}
                  placeholder="Awesome API"
                  maxLength={40}
                  required
                />
              </label>

              <div className={styles.actions}>
                <button type="submit" className={styles.primary} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  className={styles.cancel}
                  disabled={saving}
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Confirm Delete modal ---------- */}
      {confirmId !== null && (
        <div
          className={styles.backdrop}
          onClick={() => setConfirmId(null)}
        >
          <div
            className={styles.confirmBox}
            onClick={e => e.stopPropagation()}
          >
            <p>Delete this project permanently?</p>
            <div className={styles.confirmActions}>
              <button
                className={styles.danger}
                onClick={() => { deleteProject(confirmId); setConfirmId(null); }}
              >
                Yes, delete
              </button>
              <button
                className={styles.cancel}
                onClick={() => setConfirmId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
