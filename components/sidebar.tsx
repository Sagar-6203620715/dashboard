"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Folder,
  LogOut,
  Headphones,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSidebar } from "@/components/sidebar-provider";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: ShoppingBag },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Inventory", href: "/inventory", icon: Folder },
];

const SidebarShell = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, setCollapsed, setMobileOpen } = useSidebar();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo and collapse toggle */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#5570F1]">
            <svg
              width="28"
              height="28"
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.9976 12.037C22.108 12.2616 22.1809 12.5021 22.2135 12.7494L22.8168 21.7192L23.1162 26.2277C23.1193 26.6913 23.1921 27.1519 23.3321 27.5947C23.6938 28.4539 24.5639 28.9999 25.5104 28.9618L39.9346 28.0184C40.5592 28.0081 41.1623 28.2417 41.6114 28.6678C41.9855 29.0229 42.2271 29.4874 42.3032 29.987L42.3288 30.2904C41.7319 38.5556 35.6615 45.4494 27.4134 47.229C19.1654 49.0086 10.7074 45.2493 6.63154 37.9923C5.45651 35.8839 4.72257 33.5665 4.47283 31.1761C4.36849 30.4685 4.32255 29.7537 4.33545 29.0388C4.32257 20.1776 10.6329 12.5167 19.4661 10.6699C20.5292 10.5044 21.5714 11.0672 21.9976 12.037Z"
                fill="#97A5EB"
              />
              <path
                opacity="0.4"
                d="M27.885 4.33511C37.7648 4.58646 46.0683 11.6909 47.6667 21.26L47.6514 21.3306L47.6078 21.4333L47.6139 21.7151C47.5912 22.0885 47.4471 22.4478 47.1986 22.7381C46.9398 23.0404 46.5862 23.2462 46.1968 23.3261L45.9593 23.3587L29.3176 24.437C28.7641 24.4916 28.2129 24.3131 27.8013 23.9459C27.4582 23.6399 27.2389 23.2269 27.1769 22.7818L26.0599 6.1643C26.0405 6.10811 26.0405 6.0472 26.0599 5.99101C26.0752 5.53296 26.2768 5.09999 26.6198 4.78883C26.9627 4.47768 27.4184 4.31427 27.885 4.33511Z"
                fill="#FFCC91"
              />
            </svg>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap text-xl font-bold text-[#45464E]"
              >
                Nova
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="hidden h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 md:flex"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "text-[#53545C] hover:bg-gray-50"
                } ${collapsed ? "justify-center" : ""}`}
              >
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-xl bg-[#5570F1]"
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.4,
                    }}
                  />
                )}
                <Icon
                  size={20}
                  className="relative z-10 flex-shrink-0"
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="relative z-10 whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-gray-100 px-3 py-3 space-y-2">
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "gap-2"
          }`}
        >
          <ThemeSwitcher />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-[#53545C]"
              >
                Theme
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          type="button"
          className={`flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#45464E] hover:bg-gray-50 ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <Headphones size={20} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap"
              >
                Contact Support
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className={`flex w-full items-center rounded-xl px-3 py-2 text-sm text-[#CC5F5F] hover:bg-red-50 ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
};

export function Sidebar() {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="fixed left-0 top-0 z-50 hidden h-screen overflow-hidden border-r border-gray-100 bg-white md:flex"
      >
        <SidebarShell />
      </motion.aside>

      {/* Mobile overlay + drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-hidden border-r border-gray-100 bg-white md:hidden"
            >
              <SidebarShell />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

