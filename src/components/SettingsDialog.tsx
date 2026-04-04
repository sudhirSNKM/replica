
"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { User, Shield, Video, BellRing, Check, Save, Globe, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({ isOpen, onOpenChange }: SettingsDialogProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Settings State
  const [displayName, setDisplayName] = useState("Guest User");
  const [autoPlay, setAutoPlay] = useState(true);
  const [highQuality, setHighQuality] = useState(true);
  const [immersiveAudio, setImmersiveAudio] = useState(true);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate a network delay for "updating protocols"
    setTimeout(() => {
      setIsSaving(false);
      onOpenChange(false);
      toast({
        title: "Protocols Updated",
        description: "Your neural bridge settings have been synchronized.",
        variant: "default",
      });
    }, 1200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-white/10 text-white max-w-2xl overflow-hidden rounded-[2.5rem] p-0 gap-0">
        <div className="p-8 pb-4">
          <DialogHeader>
            <DialogTitle className="text-4xl font-headline font-bold tracking-tighter flex items-center gap-3">
              Nexus <span className="text-primary text-glow">Settings</span>
            </DialogTitle>
            <DialogDescription className="text-white/40 text-base">
              Customize your immersive synchronization protocols and neural interface.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <div className="px-8 mb-6">
            <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl w-full justify-start gap-1">
              <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl flex gap-2 py-2.5 px-6 transition-all">
                <User className="w-4 h-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="playback" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl flex gap-2 py-2.5 px-6 transition-all">
                <Video className="w-4 h-4" /> Playback
              </TabsTrigger>
              <TabsTrigger value="privacy" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl flex gap-2 py-2.5 px-6 transition-all">
                <Shield className="w-4 h-4" /> Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl flex gap-2 py-2.5 px-6 transition-all">
                <BellRing className="w-4 h-4" /> Alerts
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-8 pb-8">
            <TabsContent value="profile" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Display Name</Label>
                  <Input 
                    className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-primary focus:border-primary" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Interface Language</Label>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 h-12 rounded-xl px-4 text-white/60">
                    <Globe className="w-4 h-4 text-primary" />
                    <span>English (US) - Neural Default</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Neural Bio</Label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary min-h-[120px] text-white transition-colors" 
                  placeholder="Broadcast your identity to the matrix..." 
                />
              </div>
            </TabsContent>

            <TabsContent value="playback" className="space-y-4 mt-0">
              <div className="flex items-center justify-between p-6 glass-card rounded-3xl group">
                <div className="space-y-1">
                  <Label className="text-lg font-bold">Auto-Play Next Episode</Label>
                  <p className="text-sm text-white/40">Continuously stream your series without interruption.</p>
                </div>
                <Switch 
                  checked={autoPlay} 
                  onCheckedChange={setAutoPlay}
                  className="data-[state=checked]:bg-primary" 
                />
              </div>
              
              <div className="flex items-center justify-between p-6 glass-card rounded-3xl group">
                <div className="space-y-1">
                  <Label className="text-lg font-bold">4K High-Fidelity</Label>
                  <p className="text-sm text-white/40">Prioritize ultra-high definition neural streams.</p>
                </div>
                <Switch 
                  checked={highQuality} 
                  onCheckedChange={setHighQuality}
                  className="data-[state=checked]:bg-primary" 
                />
              </div>

              <div className="flex items-center justify-between p-6 glass-card rounded-3xl group">
                <div className="space-y-1">
                  <Label className="text-lg font-bold">Spatial Audio Protocol</Label>
                  <p className="text-sm text-white/40">Enable 3D audio mapping for your environment.</p>
                </div>
                <Switch 
                  checked={immersiveAudio} 
                  onCheckedChange={setImmersiveAudio}
                  className="data-[state=checked]:bg-primary" 
                />
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6 mt-0">
               <div className="p-6 bg-primary/10 border border-primary/20 rounded-[2rem] space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-primary font-bold">End-to-End Encryption Active</p>
                      <p className="text-xs text-white/40">Decentralized nodes are protecting your viewing history.</p>
                    </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <Button variant="outline" className="h-14 rounded-2xl border-white/10 glass hover:bg-white/10 text-white font-bold">
                    View Access Logs
                 </Button>
                 <Button variant="outline" className="h-14 rounded-2xl border-white/10 glass hover:bg-white/10 text-white font-bold">
                    Neural Backup
                 </Button>
               </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-2 mt-0">
               {[
                 { label: "New Arrival Alerts", icon: Zap },
                 { label: "AI Recommendations", icon: Save },
                 { label: "Security Protocol Changes", icon: Shield },
                 { label: "Replica Originals", icon: Video }
               ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors">
                     <div className="flex items-center gap-4">
                       <item.icon className="w-5 h-5 text-primary/60" />
                       <Label className="text-white/80 font-medium">{item.label}</Label>
                     </div>
                     <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                  </div>
               ))}
            </TabsContent>
          </div>
        </Tabs>

        <div className="px-8 py-6 bg-white/[0.02] border-t border-white/10">
          <DialogFooter className="flex items-center justify-between w-full sm:justify-between">
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)} 
              className="text-white/40 hover:text-white font-bold uppercase tracking-widest text-xs"
            >
              Discard Changes
            </Button>
            <Button 
              disabled={isSaving}
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 h-14 font-bold neon-glow-primary active:scale-95 transition-all"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Update Protocols
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
