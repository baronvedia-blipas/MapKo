"use client";

import { Badge } from "@/components/ui/badge";
import { Menu, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { useProfile } from "@/components/providers/profile-provider";

export function Header() {
  const { toggle } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const { profile } = useProfile();

  const planColors: Record<string, string> = {
    agency: "bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0",
    pro: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0",
    free: "bg-muted text-muted-foreground",
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 md:px-6">
      <button
        onClick={toggle}
        className="flex items-center justify-center h-9 w-9 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 md:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center h-9 w-9 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
          aria-label="Toggle theme"
        >
          <motion.div
            key={theme}
            initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </motion.div>
        </button>

        {profile && (
          <div className="flex items-center gap-2.5">
            <Badge className={planColors[profile.plan] || planColors.free}>
              {profile.plan.toUpperCase()}
            </Badge>
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                {(profile.company_name || "U")[0].toUpperCase()}
              </div>
              <span className="text-sm text-muted-foreground">
                {profile.company_name || "My Workspace"}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
