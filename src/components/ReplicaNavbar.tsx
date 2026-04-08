
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, Menu, X, LogOut, ChevronDown, Zap, UserCircle } from "lucide-react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const { user, auth } = useFirebase();
  const firestore = useFirestore();

  useEffect(() => {
    setHasMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    const saved = activeProfileId || localStorage.getItem('replica_active_profile');
    setProfileId(saved);
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeProfileId]);

  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user || !profileId) return null;
    return doc(firestore, "userAccounts", user.uid, "userProfiles", profileId);
  }, [firestore, user, profileId]);

  const adminRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "roles_admin", user.uid);
  }, [firestore, user]);

  const { data: profile } = useDoc(profileRef);
  const { data: adminData } = useDoc(adminRef);
  const isAdmin = !!adminData;

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      localStorage.removeItem('replica_active_profile');
      router.push('/login');
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shows", label: "TV" },
    { href: "/movies", label: "Movies" },
    { href: "/watchlist", label: "My List" },
  ];

  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[150] py-2 md:py-6 pointer-events-none px-4 md:px-0">
        <nav className={cn(
          "max-w-[1600px] mx-auto flex items-center justify-between transition-all duration-700 px-4 md:px-12 lg:px-24 pointer-events-auto", 
          isScrolled ? "py-2 md:py-4 rounded-[1.5rem] md:rounded-[2.5rem] bg-background/60 backdrop-blur-2xl border border-white/10" : "py-4 md:py-6 rounded-none bg-transparent"
        )}>
          <div className="flex items-center gap-4 md:gap-12">
            <Link href="/" className="text-xl md:text-3xl font-headline font-bold tracking-tighter text-white flex items-center gap-1 group">
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

          <div className="flex items-center gap-2 md:gap-6">
            <button onClick={() => setIsSearchOpen(true)} className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all"><Search className="w-4 h-4 md:w-5 md:h-5" /></button>
            <div className="hidden md:block">
              <NotificationsDropdown />
            </div>
            {user ? (
              <div className="flex items-center gap-2 md:gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none">
                    <div className="flex items-center gap-2 md:gap-3 group">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-primary transition-all bg-white/5 shadow-xl">
                        {hasMounted && profile?.avatarUrl ? (
                          <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="Profile" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/10">
                            <Zap className="w-4 h-4 text-white/20" />
                          </div>
                        )}
                      </div>
                      <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-white/40 group-hover:text-white hidden md:block" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black/80 backdrop-blur-3xl border border-white/10 text-white w-72 mt-6 p-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5),auto,0_0_20px_rgba(var(--primary),0.2)]" align="end">
                    <DropdownMenuLabel className="px-5 py-4 flex flex-col">
                      <span className="font-headline font-bold text-xl uppercase tracking-tighter text-glow">My Matrix</span>
                      <span className="text-[10px] text-white/20 uppercase tracking-widest font-black mt-1">Node: {profile?.name || "Initializing..."}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-white/20 to-transparent mx-2" />
                    
                    <Link href="/profiles">
                      <DropdownMenuItem className="hover:bg-white/5 rounded-2xl py-4 px-5 transition-colors group cursor-pointer border border-transparent hover:border-white/5">
                        <span className="font-bold text-sm text-[10px] uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors flex items-center gap-3">
                          <UserCircle className="w-4 h-4" /> Manage Profiles
                        </span>
                      </DropdownMenuItem>
                    </Link>

                    <Link href="/watchlist">
                      <DropdownMenuItem className="hover:bg-white/5 rounded-2xl py-4 px-5 transition-colors group cursor-pointer border border-transparent hover:border-white/5 lg:hidden">
                        <span className="font-bold text-sm text-[10px] uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">My List</span>
                      </DropdownMenuItem>
                    </Link>

                    {user && isAdmin && (
                      <Link href="/admin">
                        <DropdownMenuItem className="hover:bg-primary/10 rounded-2xl py-4 px-5 transition-colors cursor-pointer group relative overflow-hidden border border-transparent hover:border-primary/20">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
                          <span className="font-bold text-sm text-[10px] uppercase tracking-[0.2em] text-primary flex items-center gap-3 relative z-10">
                            <div className="p-1.5 rounded-lg bg-primary/20">
                              <Zap className="w-3.5 h-3.5 fill-primary" />
                            </div>
                            Admin Nexus
                          </span>
                        </DropdownMenuItem>
                      </Link>
                    )}
                    
                    <DropdownMenuItem onClick={() => setIsSettingsOpen(true)} className="hover:bg-white/5 rounded-2xl py-4 px-5 transition-colors group cursor-pointer border border-transparent hover:border-white/5">
                      <span className="font-bold text-sm text-[10px] uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">Nexus Settings</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-white/20 to-transparent mx-2 my-1" />
                    
                    <DropdownMenuItem onClick={handleLogout} className="hover:bg-destructive/10 rounded-2xl py-4 px-5 text-destructive font-bold group cursor-pointer border border-transparent hover:border-destructive/20 mt-1">
                      <span className="flex items-center text-[10px] uppercase tracking-[0.2em]">
                        <LogOut className="w-4 h-4 mr-3" /> Terminate Session
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="lg:hidden w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all bg-white/5 border border-white/10"
                >
                  {isMenuOpen ? <X className="w-4 h-4 md:w-5 md:h-5" /> : <Menu className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="px-4 md:px-6 py-2 bg-primary text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full">Link Identity</button>
              </Link>
            )}
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[140] bg-black/95 backdrop-blur-3xl lg:hidden pt-48 px-12 pb-24 flex flex-col justify-between"
          >
            <div className="space-y-12">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Main Matrix Protocol</div>
              <div className="flex flex-col gap-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    onClick={() => setIsMenuOpen(false)}
                    className={cn("text-xl font-headline font-bold tracking-tighter uppercase", pathname === link.href ? "text-primary text-glow" : "text-white/40")}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-12">
              <div className="h-[1px] bg-gradient-to-r from-primary/40 via-transparent to-transparent" />
              <div className="grid grid-cols-2 gap-6">
                <button onClick={() => { setIsSettingsOpen(true); setIsMenuOpen(false); }} className="flex flex-col gap-3 p-6 rounded-3xl bg-white/5 border border-white/10 text-left">
                  <Zap className="w-6 h-6 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Settings</span>
                </button>
                <button onClick={handleLogout} className="flex flex-col gap-3 p-6 rounded-3xl bg-destructive/10 border border-destructive/20 text-left">
                  <LogOut className="w-6 h-6 text-destructive" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-destructive">Logout</span>
                </button>
              </div>
              <div className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-white/10 italic">Secure Identity Nexus v2.4</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <SettingsDialog isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
};
