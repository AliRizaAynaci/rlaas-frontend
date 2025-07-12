'use client';

import { useState, useEffect, useRef } from 'react';
import TextTransition, { presets } from 'react-text-transition';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import { GoogleButton } from '@/components/CTAButtons';

/* ---------- Feature-card data ---------- */
const features = [
  {
    icon: '/multi-tenant-icon-transparent.png',
    alt:  'Central Control',
    title:'Central Control',
    desc: 'Manage all API keys from one dashboard—no confusion.',
  },
  {
    icon: '/rl.png',
    alt:  'Live Limit Edits',
    title:'Live Limit Edits',
    desc: 'Push new rules live in seconds with zero downtime.',
  },
  {
    icon: '/redis.png',
    alt:  'Automatic Scaling',
    title:'Automatic Scaling',
    desc: 'Handles traffic spikes automatically; no tuning required.',
  },
  {
    icon: '/flexible.png',
    alt:  'Flexible Methods',
    title:'Flexible Methods',
    desc: 'Token, sliding, or custom—choose what fits best.',
  },
];

/* ---------- Rotating hero lines ---------- */
const heroLines = [
  'Struggling to keep your API fast and abuse-free as it grows?',
  'Create a project in seconds — no config files, no YAML.',
  'RLaaS lets you define custom rate limits per endpoint.',
  'Mix token, sliding, or custom limits per endpoint for ultimate flexibility.',
  'Stay in control, scale effortlessly, and integrate with any stack in minutes.',
];

export default function Home() {
  const { isLoggedIn } = useAuth();
  const router          = useRouter();

  const [idx, setIdx]   = useState(0);
  const idxRef          = useRef(0);

  /* advance every 6 s */
  useEffect(() => {
    const id = setInterval(() => {
      idxRef.current = (idxRef.current + 1) % heroLines.length;
      setIdx(idxRef.current);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  if (isLoggedIn === null) return null;     // auth still loading

  return (
    <main className={styles.main}>
      {/* ---------- Hero ---------- */}
      <section className={styles.hero}>
        <h1 className={styles.title}>
          RLaaS Scalable
          <br />
          API Rate Limiting Made Easy
        </h1>

        {/* rotating subtitle */}
        <div
          key={idx}
          className={`${styles.rotateBox} ${
            idx % 2 ? styles.dirLeft : styles.dirRight
          }`}
        >
          <TextTransition springConfig={presets.gentle} inline>
            {heroLines[idx]}
          </TextTransition>
        </div>

        {/* CTA */}
        <div className={styles.cta}>
          <button
            className={styles.primaryButton}
            onClick={() => router.push(isLoggedIn ? '/dashboard' : '/docs')}
          >
            Get Started
          </button>
          <GoogleButton />
        </div>
      </section>

      {/* ---------- Features grid ---------- */}
      <section className={styles.features}>
        {features.map(({ icon, alt, title, desc }) => (
          <div key={title} className={styles.card}>
            <Image
              src={icon}
              alt={alt}
              width={48}
              height={48}
              className={styles.icon}
              priority
            />
            <h3>{title}</h3>
            <p className={styles.desc}>{desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
