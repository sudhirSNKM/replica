
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, User, Menu, X, Settings, LogOut, ChevronDown, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "./SearchOverlay";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { SettingsDialog } from "./SettingsDialog";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useFirebase, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";

export const ReplicaNavbar = ({ activeProfileId }: { activeProfileId?: string | null }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, auth } = useFirebase();
  const firestore = useFirestore();

  const profileId = activeProfileId || (typeof window !== 'undefined' ? localStorage.getItem('replica_active_profile') : null);

  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user || !profileId) return null;
    return doc(firestore, "userAccounts", user.uid, "userProfiles", profileId);
  }, [firestore, user, profileId]);

  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      localStorage.removeItem('replica_active_profile');
      router.push('/login');
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shows", label: "TV Shows" },
    { href: "/movies", label: "Movies" },
    { href: "/trending", label: "Trending" },
    { href: "/watchlist", label: "My List" },
  ];

  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[150] px-6 py-6 pointer-events-none">
        <nav className={cn("max-w-[1600px] mx-auto flex items-center justify-between transition-all duration-700 px-8 pointer-events-auto", isScrolled ? "py-4 rounded-[2.5rem] bg-background/60 backdrop-blur-2xl border border-white/10" : "py-6 rounded-none bg-transparent")}>
          <div className="flex items-center gap-12">
            <Link href="/" className="text-3xl font-headline font-bold tracking-tighter text-white flex items-center gap-1 group">
              <span className="text-primary group-hover:text-glow transition-all">RE</span><span>PLICA</span>
            </Link>
            <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={cn("relative transition-all hover:text-white py-2", pathname === link.href ? "text-white" : "text-white/40")}>
                  {link.label}
                  {pathname === link.href && <motion.div layoutId="nav-active" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.8)]" />}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setIsSearchOpen(true)} className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all"><Search className="w-5 h-5" /></button>
            <NotificationsDropdown />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <div className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-primary transition-all bg-white/5 shadow-xl">
                      <img src={profile?.avatarUrl || `https://picsum.photos/seed/${user.uid}/44/44`} className="w-full h-full object-cover" />
                    </div>
                    <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass border-white/10 text-white w-72 mt-4 p-2 rounded-[2.5rem] shadow-2xl" align="end">
                  <DropdownMenuLabel className="px-5 py-4 flex flex-col">
                    <span className="font-headline font-bold text-xl uppercase tracking-tighter">My Matrix</span>
                    <span className="text-[10px] text-white/20 uppercase tracking-widest font-black mt-1">Node: {profile?.name || "Active"}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10 mx-2" />
                  <DropdownMenuItem onClick={() => { localStorage.removeItem('replica_active_profile'); router.push('/'); }} className="hover:bg-white/10 rounded-2xl py-4 px-5 transition-colors group">
                    <span className="font-bold text-sm">Neural Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsSettingsOpen(true)} className="hover:bg-white/10 rounded-2xl py-4 px-5 transition-colors group">
                    <span className="font-bold text-sm">Core Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10 mx-2" />
                  <DropdownMenuItem onClick={handleLogout} className="hover:bg-destructive/10 rounded-2xl py-4 px-5 text-destructive font-bold group">
                    <LogOut className="w-5 h-5 mr-3" /> Terminate Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login"><button className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">Establish Link</button></Link>
            )}
          </div>
        </nav>
      </div>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <SettingsDialog isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
};
