
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
import { useFirebase, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({ isOpen, onOpenChange }: SettingsDialogProps) => {
  const { toast } = useToast();
  const { user } = useFirebase();
  const firestore = useFirestore();
  const [isSaving, setIsSaving] = useState(false);
  
  // Get active profile ID
  const [profileId, setProfileId] = useState<string | null>(null);
  
  React.useEffect(() => {
    if (isOpen) {
      const savedId = localStorage.getItem('replica_active_profile');
      setProfileId(savedId);
    }
  }, [isOpen]);

  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user || !profileId) return null;
    return doc(firestore, "userAccounts", user.uid, "userProfiles", profileId);
  }, [firestore, user, profileId]);

  const { data: profile } = useDoc(profileRef);

  // Settings State
  const [displayName, setDisplayName] = useState("");
  const [autoPlay, setAutoPlay] = useState(true);
  const [highQuality, setHighQuality] = useState(true);
  const [immersiveAudio, setImmersiveAudio] = useState(true);

  // Initialize state from profile data
  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.name || "");
      if (profile.settings) {
        setAutoPlay(profile.settings.autoPlay ?? true);
        setHighQuality(profile.settings.highQuality ?? true);
        setImmersiveAudio(profile.settings.immersiveAudio ?? true);
      }
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profileRef) return;
    
    setIsSaving(true);
    try {
      await updateDoc(profileRef, {
        name: displayName,
        settings: {
          autoPlay,
          highQuality,
          immersiveAudio,
          updatedAt: new Date().toISOString()
        }
      });

      setIsSaving(false);
      onOpenChange(false);
      toast({
        title: "Protocols Updated",
        description: "Your neural bridge settings have been synchronized.",
        variant: "default",
      });
    } catch (error) {
      console.error("Save failed:", error);
      setIsSaving(false);
      toast({
        title: "Sync Failed",
        description: "Communication with the neural nexus was interrupted.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-white/10 text-white w-[95vw] md:max-w-2xl overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] p-0 gap-0">
        <div className="p-6 md:p-8 pb-4">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-4xl font-headline font-bold tracking-tighter flex items-center gap-3">
              Nexus <span className="text-primary text-glow">Settings</span>
            </DialogTitle>
            <DialogDescription className="text-white/40 text-sm md:text-base">
              Customize your immersive synchronization protocols and neural interface.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <div className="px-6 md:px-8 mb-6 overflow-x-auto scrollbar-hide">
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl md:rounded-2xl w-full md:w-auto flex justify-start gap-1 min-w-max">
              <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg md:rounded-xl flex gap-2 py-2 md:py-2.5 px-4 md:px-6 transition-all text-xs md:text-sm">
                <User className="w-3.5 h-3.5 md:w-4 md:h-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="playback" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg md:rounded-xl flex gap-2 py-2 md:py-2.5 px-4 md:px-6 transition-all text-xs md:text-sm">
                <Video className="w-3.5 h-3.5 md:w-4 md:h-4" /> Playback
              </TabsTrigger>
              <TabsTrigger value="privacy" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg md:rounded-xl flex gap-2 py-2 md:py-2.5 px-4 md:px-6 transition-all text-xs md:text-sm">
                <Shield className="w-3.5 h-3.5 md:w-4 md:h-4" /> Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg md:rounded-xl flex gap-2 py-2 md:py-2.5 px-4 md:px-6 transition-all text-xs md:text-sm">
                <BellRing className="w-3.5 h-3.5 md:w-4 md:h-4" /> Alerts
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6 md:px-8 pb-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
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
               
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-14 rounded-2xl border-white/10 glass hover:bg-white/10 text-white font-bold">
                     View Access Logs
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      if (!firestore || !user) return;
                      const accountRef = doc(firestore, "userAccounts", user.uid);
                      await updateDoc(accountRef, { upgradeRequested: true });
                      toast({ title: "Request Sent", description: "Authorization request broadcasted to Nexus Admin." });
                    }}
                    className="h-14 rounded-2xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold"
                  >
                     Request Admin Clearance
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

        <div className="px-6 md:px-8 py-4 md:py-6 bg-white/[0.02] border-t border-white/10">
          <DialogFooter className="flex flex-col-reverse md:flex-row items-center justify-between w-full gap-4 md:gap-0">
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)} 
              className="text-white/40 hover:text-white font-bold uppercase tracking-widest text-[10px] md:text-xs w-full md:w-auto"
            >
              Discard Changes
            </Button>
            <Button 
              disabled={isSaving}
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 md:px-10 h-12 md:h-14 font-bold neon-glow-primary active:scale-95 transition-all w-full md:w-auto text-xs md:text-sm"
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
