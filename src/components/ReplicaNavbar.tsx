
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, User, Menu, X, Settings, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "./SearchOverlay";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export const ReplicaNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[150] transition-all duration-500 py-6 px-6 md:px-12 flex items-center justify-between",
          isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent"
        )}
      >
        <div className="flex items-center gap-12">
          <Link href="/" className="text-3xl font-headline font-bold tracking-tighter text-white flex items-center gap-1 hover:scale-105 transition-transform">
            <span className="text-primary">RE</span>
            <span>PLICA</span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-10 text-sm font-bold text-white/50 uppercase tracking-widest">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/shows" className="hover:text-white transition-colors">TV Shows</Link>
            <Link href="/movies" className="hover:text-white transition-colors">Movies</Link>
            <Link href="/trending" className="hover:text-white transition-colors">Trending</Link>
            <Link href="/watchlist" className="hover:text-white transition-colors">My List</Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <Search className="w-5 h-5" />
          </button>
          
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all hidden sm:flex">
            <Bell className="w-5 h-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white/10 group-hover:border-primary transition-colors">
                  <img src="https://picsum.photos/seed/avatar1/40/40" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass border-white/10 text-white w-56 mt-2" align="end">
              <DropdownMenuLabel>Account Settings</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="hover:bg-white/10 cursor-pointer flex gap-3">
                <User className="w-4 h-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-white/10 cursor-pointer flex gap-3">
                <Settings className="w-4 h-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-white/10 cursor-pointer flex gap-3 text-primary font-bold">
                <Sparkles className="w-4 h-4" /> Upgrade to Pro
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="hover:bg-white/10 cursor-pointer flex gap-3 text-destructive">
                <LogOut className="w-4 h-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button 
            className="lg:hidden text-white/80"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-3xl p-8 border-b border-white/10 lg:hidden flex flex-col gap-6"
            >
              <Link href="/" className="text-2xl font-headline font-bold" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link href="/shows" className="text-2xl font-headline font-bold" onClick={() => setMobileMenuOpen(false)}>TV Shows</Link>
              <Link href="/movies" className="text-2xl font-headline font-bold" onClick={() => setMobileMenuOpen(false)}>Movies</Link>
              <Link href="/watchlist" className="text-2xl font-headline font-bold" onClick={() => setMobileMenuOpen(false)}>My List</Link>
              <DropdownMenuSeparator className="bg-white/10" />
              <div className="flex items-center gap-4 pt-4">
                <Search className="w-6 h-6 text-white/40" />
                <span className="text-lg">Search</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
