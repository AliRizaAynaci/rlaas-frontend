'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './CTAButtons.module.css';

export function PrimaryButton({ href, children }) {
  return (
    <Link href={href} className={styles.primary}>
      {children}
    </Link>
  );
}

export function SecondaryButton({ href, children }) {
  return (
    <Link href={href} className={styles.secondary}>
      {children}
    </Link>
  );
}

export function GoogleButton() {
  return (
    <Link
      href="http://localhost:8080/auth/google/login"
      className={styles.google}
    >
      <Image src="/google-icon.svg" alt="" width={20} height={20} priority />
      <span>Continue with Google</span>
    </Link>
  );
}
