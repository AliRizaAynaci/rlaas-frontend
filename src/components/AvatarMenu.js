"use client";

import Image from "next/image";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import styles from "./AvatarMenu.module.css";           // 👈 import

export default function AvatarMenu() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="w-9 h-9 rounded-full overflow-hidden border border-gray-600/40
                     hover:ring-2 hover:ring-blue-500/60 transition"
        >
          <Image src={user.picture} alt={user.name} width={36} height={36} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className={styles.menu}               /* 🔹 */
        sideOffset={8}
      >
        <DropdownMenu.Item className={styles.item}>
          {user.email}
        </DropdownMenu.Item>

        <DropdownMenu.Separator className={styles.separator} />

        <DropdownMenu.Item
          onSelect={logout}
          className={`${styles.item} ${styles.logout}`}   /* 🔹 */
        >
          Logout
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
