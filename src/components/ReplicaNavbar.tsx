
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, User, Menu, X, Settings, LogOut, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "./SearchOverlay";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { SettingsDialog } from "./SettingsDialog";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export const ReplicaNavbar = ({ activeProfileId }: { activeProfileId?: string | null }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();

  // Get active profile ID from local storage if not passed
  const profileId = activeProfileId || (typeof window !== 'undefined' ? localStorage.getItem('replica_active_profile') : null);

  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user || !profileId) return null;
    return doc(firestore, "users", user.uid, "profiles", profileId);
  }, [firestore, user, profileId]);

  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shows", label: "TV Shows" },
    { href: "/movies", label: "Movies" },
    { href: "/trending", label: "Trending" },
    { href: "/watchlist", label: "My List" },
  ];

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[150] transition-all duration-700 py-8 px-6 md:px-12 flex items-center justify-between",
          isScrolled ? "bg-background/90 backdrop-blur-3xl border-b border-white/5 py-5" : "bg-transparent"
        )}
      >
        <div className="flex items-center gap-16">
          <Link href="/" className="text-4xl font-headline font-bold tracking-tighter text-white flex items-center gap-1 group">
            <span className="text-primary group-hover:text-glow transition-all">RE</span>
            <span>PLICA</span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-10 text-xs font-black uppercase tracking-[0.25em]">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "relative transition-all hover:text-white",
                  pathname === link.href ? "text-white" : "text-white/40"
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div 
                    layoutId="nav-active"
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary neon-glow-primary rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-90"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <NotificationsDropdown />
          </div>

          <div className="h-8 w-px bg-white/10 hidden md:block" />

          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-primary transition-all group-hover:neon-glow-primary bg-white/5">
                  <img 
                    src={profile?.avatarUrl || "https://picsum.photos/seed/avatar1/44/44"} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white transition-all group-hover:rotate-180" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass border-white/10 text-white w-72 mt-4 p-2 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)]" align="end">
              <DropdownMenuLabel className="px-5 py-4 flex flex-col">
                <span className="font-headline font-bold text-xl">{profile?.name || "Guest User"}</span>
                <span className="text-[10px] text-white/20 uppercase tracking-widest font-black mt-1">Neural ID: {profileId?.substring(0, 8)}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10 mx-2" />
              <div className="p-2 space-y-1">
                <DropdownMenuItem className="hover:bg-white/10 rounded-2xl cursor-pointer flex gap-4 py-4 px-5 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Neural Profile</span>
                    <span className="text-[10px] text-white/40">Manage your identity</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsSettingsOpen(true)}
                  className="hover:bg-white/10 rounded-2xl cursor-pointer flex gap-4 py-4 px-5 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Core Settings</span>
                    <span className="text-[10px] text-white/40">Protocols & security</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="mt-2 bg-primary/10 hover:bg-primary/20 rounded-2xl cursor-pointer flex items-center justify-center py-4 px-5 text-primary font-black uppercase tracking-widest text-[10px] transition-all border border-primary/20 gap-3">
                  <Sparkles className="w-4 h-4" /> Access Pro Tier
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-white/10 mx-2" />
              <div className="p-2">
                <DropdownMenuItem 
                  onClick={() => {
                    localStorage.removeItem('replica_active_profile');
                    window.location.reload();
                  }}
                  className="hover:bg-destructive/10 rounded-2xl cursor-pointer flex gap-4 py-4 px-5 text-destructive font-bold transition-colors group"
                >
                  <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Switch Neural Link
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <button 
            className="lg:hidden text-white/80 w-12 h-12 glass rounded-full flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="fixed inset-0 top-[88px] bg-background/95 backdrop-blur-3xl p-12 lg:hidden flex flex-col gap-10"
            >
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={cn(
                    "text-4xl font-headline font-bold tracking-tight",
                    pathname === link.href ? "text-primary" : "text-white"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-white/10" />
              <button 
                className="flex items-center gap-6 text-2xl font-bold text-white/60"
                onClick={() => {
                  setIsSearchOpen(true);
                  setMobileMenuOpen(false);
                }}
              >
                <Search className="w-8 h-8" /> Find Content
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <SettingsDialog isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
};
