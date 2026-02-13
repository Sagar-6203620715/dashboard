"use client";

import { useSidebar } from "@/components/sidebar-provider";
import { motion } from "framer-motion";

export function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <motion.main
      animate={{ marginLeft: collapsed ? 64 : 256 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="min-h-screen"
    >
      {children}
    </motion.main>
  );
}

