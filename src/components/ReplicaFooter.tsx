
"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Globe, Github } from "lucide-react";
import { motion } from "framer-motion";

export const ReplicaFooter = () => {
  const footerLinks = [
    {
      title: "Protocol",
      links: [
        { label: "Audio Description", href: "#" },
        { label: "Help Center", href: "#" },
        { label: "Gift Cards", href: "#" },
        { label: "Media Center", href: "#" },
      ],
    },
    {
      title: "Nexus",
      links: [
        { label: "Investor Relations", href: "#" },
        { label: "Jobs", href: "#" },
        { label: "Terms of Use", href: "#" },
        { label: "Privacy", href: "#" },
      ],
    },
    {
      title: "Neural",
      links: [
        { label: "Legal Notices", href: "#" },
        { label: "Cookie Preferences", href: "#" },
        { label: "Corporate Information", href: "#" },
        { label: "Contact Us", href: "#" },
      ],
    },
    {
      title: "Legacy",
      links: [
        { label: "Speed Test", href: "#" },
        { label: "Ad Choices", href: "#" },
        { label: "Legal Notices", href: "#" },
        { label: "Only on Replica", href: "#" },
      ],
    },
  ];

  const socialIcons = [
    { icon: Facebook, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Youtube, href: "#" },
    { icon: Github, href: "#" },
  ];

  return (
    <footer className="relative bg-background pt-32 pb-20 overflow-hidden border-t border-white/5">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex flex-col lg:flex-row justify-between gap-16 lg:gap-32">
          {/* Brand Column */}
          <div className="lg:max-w-xs space-y-8">
            <Link href="/" className="text-4xl font-headline font-bold tracking-tighter text-white flex items-center gap-1 group">
              <span className="text-primary group-hover:text-glow transition-all">RE</span>
              <span>PLICA</span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed font-medium">
              The world's first decentralized neural streaming network. Experience cinematic protocols in high-fidelity 4K through the matrix.
            </p>
            <div className="flex items-center gap-6">
              {socialIcons.map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  className="text-white/40 hover:text-white transition-all transform hover:scale-110 active:scale-90"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-8">
            {footerLinks.map((section, i) => (
              <div key={i} className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link href={link.href} className="text-sm text-white/30 hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4 text-white/20 text-[10px] font-black uppercase tracking-widest">
            <button className="flex items-center gap-2 border border-white/10 px-4 py-2 rounded-full hover:bg-white/5 transition-colors">
              <Globe className="w-3 h-3" /> Language: English Protocol
            </button>
            <span>© 2024 Replica Systems Inc.</span>
          </div>

          <div className="flex items-center gap-8 text-[9px] font-bold text-white/10 uppercase tracking-tighter">
            <span>Neural Identity Verified</span>
            <span>Latency: 12ms</span>
            <span>Uptime: 99.99%</span>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-64 -right-64 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-64 -left-64 w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />
    </footer>
  );
};
