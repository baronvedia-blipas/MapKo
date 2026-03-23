"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">
            Map<span className="text-blue-400">Ko</span>
          </span>
        </div>

        {/* 404 */}
        <h1 className="text-[8rem] sm:text-[10rem] font-extrabold leading-none text-white/10 select-none">
          404
        </h1>

        <p className="text-xl text-slate-400 mt-4 mb-8">
          This page doesn&apos;t exist
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <Link href="/landing">
            <Button variant="outline" size="lg">
              Back to Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
