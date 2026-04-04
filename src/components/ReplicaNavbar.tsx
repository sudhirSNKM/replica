
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, User, Menu, X, Settings, LogOut, ChevronDown, Sparkles, Shield, Zap } from "lucide-react";
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
import { signOut } from "firebase/auth";

export const ReplicaNavbar = ({ activeProfileId }: { activeProfileId?: string | null }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, auth } = useFirebase();
  const firestore = useFirestore();

  const profileId = activeProfileId || (typeof window !== 'undefined' ? localStorage.getItem('replica_active_profile') : null);

  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user || !profileId) return null;
    return doc(firestore, "users", user.uid, "profiles", profileId);
  }, [firestore, user, profileId]);

  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        localStorage.removeItem('replica_active_profile');
        router.push('/login');
      } catch (error) {
        console.error("Logout failed:", error);
      }
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
        <nav
          className={cn(
            "max-w-[1600px] mx-auto flex items-center justify-between transition-all duration-700 px-8 pointer-events-auto",
            isScrolled 
              ? "py-4 rounded-[2.5rem] bg-background/60 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
              : "py-6 rounded-none bg-transparent"
          )}
        >
          <div className="flex items-center gap-12">
            <Link href="/" className="text-3xl font-headline font-bold tracking-tighter text-white flex items-center gap-1 group">
              <span className="text-primary group-hover:text-glow transition-all">RE</span>
              <span>PLICA</span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={cn(
                    "relative transition-all hover:text-white py-2",
                    pathname === link.href ? "text-white" : "text-white/40"
                  )}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.div 
                      layoutId="nav-active"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.8)]"
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-90"
              >
                <Search className="w-5 h-5" />
              </button>
              
              <NotificationsDropdown />
            </div>

            <div className="h-6 w-px bg-white/10 hidden md:block" />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-primary transition-all group-hover:neon-glow-primary bg-white/5 shadow-xl">
                      <img 
                        src={profile?.avatarUrl || `https://picsum.photos/seed/${user.uid}/44/44`} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white transition-all group-hover:rotate-180" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass border-white/10 text-white w-72 mt-4 p-2 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)]" align="end">
                  <DropdownMenuLabel className="px-5 py-4 flex flex-col">
                    <span className="font-headline font-bold text-xl uppercase tracking-tighter">My Matrix</span>
                    <span className="text-[10px] text-white/20 uppercase tracking-widest font-black mt-1">Node: {profile?.name || "Active"}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10 mx-2" />
                  <div className="p-2 space-y-1">
                    <DropdownMenuItem 
                      onClick={() => {
                        localStorage.removeItem('replica_active_profile');
                        router.push('/');
                      }}
                      className="hover:bg-white/10 rounded-2xl cursor-pointer flex gap-4 py-4 px-5 transition-colors group"
                    >
                      <User className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
                      <span className="font-bold text-sm">Neural Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setIsSettingsOpen(true)}
                      className="hover:bg-white/10 rounded-2xl cursor-pointer flex gap-4 py-4 px-5 transition-colors group"
                    >
                      <Settings className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
                      <span className="font-bold text-sm">Core Settings</span>
                    </DropdownMenuItem>
                    
                    <div className="p-2 pt-4">
                      <button className="w-full py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center justify-center gap-2">
                        <Zap className="w-3 h-3" /> Access Pro Tier
                      </button>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10 mx-2" />
                  <div className="p-2">
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="hover:bg-destructive/10 rounded-2xl cursor-pointer flex gap-4 py-4 px-5 text-destructive font-bold transition-colors group"
                    >
                      <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Terminate Session
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <button className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:neon-glow-primary transition-all active:scale-95">
                  Establish Link
                </button>
              </Link>
            )}

            <button 
              className="lg:hidden text-white/80 w-10 h-10 glass rounded-full flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[140] bg-background/95 backdrop-blur-3xl p-12 lg:hidden flex flex-col gap-10 pt-32"
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
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <SettingsDialog isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
};
