'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AvatarMenu from '@/components/AvatarMenu';   // 👈 yeni
import styles from './navbar.module.css';

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
          <Link href="/docs" className={styles.link}>
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
              onClick={() => router.push('/docs#get-started')}
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
