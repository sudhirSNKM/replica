"use client";

import { useUser } from "@/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PUBLIC_PATHS = ["/login", "/register"];

export const NexusGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [hasStartedRedirect, setHasStartedRedirect] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user && !PUBLIC_PATHS.includes(pathname)) {
      setHasStartedRedirect(true);
      router.replace("/login");
    }
  }, [user, isUserLoading, pathname, router]);

  // If loading or redirecting, show the cinematic loader
  if ((isUserLoading || (!user && !PUBLIC_PATHS.includes(pathname))) && !PUBLIC_PATHS.includes(pathname)) {
    return (
      <div className="fixed inset-0 bg-[#0B0B0F] flex flex-col items-center justify-center z-[500]">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-10">
          <div className="text-8xl md:text-[10rem] font-headline font-bold tracking-tighter text-white">
            <span className="text-primary text-glow">RE</span><span>PLICA</span>
          </div>
          <div className="w-80 h-1 bg-white/5 rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ x: "-100%" }} 
              animate={{ x: "100%" }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent w-full h-full" 
            />
          </div>
          <p className="text-white/20 font-bold uppercase tracking-[0.5em] text-[10px] animate-pulse">Establishing Identity Nexus</p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};
