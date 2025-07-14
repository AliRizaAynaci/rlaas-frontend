'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AvatarMenu from '@/components/AvatarMenu';   // 👈 yeni
import styles from './navbar.module.css';

const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_BASE_URL

export default function Navbar() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  return (
    <nav className={styles.navbar}>
      <div className={styles.navInner}>
        {/* -------- Sol -------- */}
        <Link href="/" className={styles.brand}>
          <Image src="/rlaas.png" alt="RLaaS logo" width={48} height={48} />
          <span>RLaaS</span>
        </Link>

        {/* -------- Sağ -------- */}
        <div className={styles.right}>
          <Link href={DOCS_URL} className={styles.link}>
            Docs
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className={styles.link}>
                Dashboard
              </Link>
              <AvatarMenu />         {/* 👈 avatar menüsü */}
            </>
          ) : (
            <button
              onClick={() => (window.location.href = `${DOCS_URL}/docs/intro`)}
              className={styles.primaryButton}
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
