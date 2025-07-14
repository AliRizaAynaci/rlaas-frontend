'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();
const API = process.env.NEXT_PUBLIC_API_BASE_URL;
console.log(">> API base is:", API);


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);        // ✨ avatar & e-posta buraya
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const router = useRouter();

  // İlk yüklemede oturumu kontrol et
  useEffect(() => {
    fetch(`${API}/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);          // 👈 user = { id, email, name, picture… }
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  // Logout fonksiyonu – AvatarMenu çağıracak
  const logout = async () => {
    await fetch(`${API}/logout`, {
      method: 'GET',
      credentials: 'include',
    });
    setUser(null);
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, isLoggedIn, setIsLoggedIn, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
