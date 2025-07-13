'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './CTAButtons.module.css';


const API = process.env.NEXT_PUBLIC_API_BASE_URL;


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
      href={`${API}/auth/google/login`}
      className={styles.google}
    >
      <Image src="/google-icon.svg" alt="" width={20} height={20} priority />
      <span>Continue with Google</span>
    </Link>
  );
}
