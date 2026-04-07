
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Upload, Film, Database, Check, Loader2, Monitor, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/firebase/storage/use-upload";
import { Progress } from "@/components/ui/progress";

import { useUser } from "@/firebase";
import { Settings as SettingsIcon, ShieldAlert, Users as UsersIcon } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";

export const AdminPanel = () => {
  const { user, isUserLoading } = useUser();
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'users'>('content');
  const [userList, setUserList] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedQuality = watch("quality", "4K ULTRA HDR");
  const { uploadFile: uploadPoster, progress: posterProgress, isUploading: isPosterUploading } = useUpload();
  const { uploadFile: uploadVideo, progress: videoProgress, isUploading: isVideoUploading } = useUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'poster' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const path = `content/${Date.now()}_${file.name}`;
      const url = type === 'poster' 
        ? await uploadPoster(file, path) 
        : await uploadVideo(file, path);
      
      setValue(type === 'poster' ? 'thumbnailUrl' : 'videoUrl', url);
      
      toast({
        title: `${type === 'poster' ? 'Asset' : 'Protocol'} Synchronized`,
        description: "File has been uploaded to the media matrix.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: err.message,
      });
    }
  };

  const onSubmit = async (data: any) => {
    if (!firestore) return;
    setIsSubmitting(true);

    const id = Math.random().toString(36).substring(2, 9);
    const contentRef = doc(firestore, "content", id);
    
    const payload = {
      ...data,
      id,
      uploaderId: user?.uid,
      type: data.type || 'movie',
      rating: (Math.random() * 2 + 7.5).toFixed(1),
      releaseYear: data.releaseYear || new Date().getFullYear().toString(),
      duration: data.duration || (data.type === 'show' ? "Season 1" : "2h 00m"),
      genres: [data.genre || "Action"],
      isTrending: true,
      isNew: true,
      quality: selectedQuality,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(contentRef, payload);
      toast({
        title: "Metadata Synchronized",
        description: `${data.title} has been added to the library at ${selectedQuality}.`,
      });
      reset();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Integration Failed",
        description: e.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const seedDatabase = async () => {
    if (!firestore) return;
    setIsSeeding(true);

    try {
      for (const movie of MOCK_MOVIES) {
        const contentRef = doc(firestore, "content", movie.id);
        await setDoc(contentRef, {
          ...movie,
          quality: "4K ULTRA HDR",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      toast({
        title: "Neural Sync Complete",
        description: `${MOCK_MOVIES.length} cinematic protocols synchronized to live matrix.`,
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Sync Gate Error",
        description: e.message,
      });
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && firestore) {
      const fetchUsers = async () => {
        setIsUsersLoading(true);
        try {
          const querySnapshot = await getDocs(collection(firestore, "users"));
          const usersData = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          }));
          setUserList(usersData);
        } catch (error: any) {
          toast({ 
            variant: "destructive", 
            title: "Identity Retrieval Failed", 
            description: error.message 
          });
        } finally {
          setIsUsersLoading(false);
        }
      };
      fetchUsers();
    }
  }, [activeTab, firestore, toast]);

  if (isUserLoading) {
    return (
      <div className="min-h-screen pt-36 px-6 md:px-12 flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (user?.email !== 'admin@replica.com') {
    return (
      <div className="min-h-screen pt-36 px-6 md:px-12 flex flex-col items-center justify-center bg-background text-center">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-4xl font-headline font-bold text-white mb-4 tracking-tighter">Access Denied</h1>
        <p className="text-white/40 mb-8 max-w-md text-lg font-medium">Your neural signature does not have administrative clearance for this node.</p>
        <Button onClick={() => window.location.href = '/'} className="bg-primary shadow-[0_0_30px_rgba(255,46,99,0.3)] hover:neon-glow-primary rounded-2xl px-12 py-7 font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95">
          Return to Portal
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-36 px-6 md:px-12 pb-24 bg-background">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[10px]">
              <div className="w-8 h-[1px] bg-primary" />
              Administrative Nexus 1.4
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold text-white tracking-tighter">
              Nexus <span className="text-primary text-glow">Control</span>
            </h1>
            
            <div className="flex flex-wrap gap-2 p-1 bg-white/[0.03] border border-white/5 rounded-2xl w-fit mt-6">
              <button 
                onClick={() => setActiveTab('content')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'content' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                <LayoutGrid className="w-4 h-4" /> Content Manager
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                <UsersIcon className="w-4 h-4" /> Neural Identities
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                <SettingsIcon className="w-4 h-4" /> Nexus Settings
              </button>
            </div>
          </div>
          
          {activeTab === 'content' && (
            <div className="flex gap-4">
              <Button 
                onClick={seedDatabase} 
                disabled={isSeeding}
                variant="outline" 
                className="h-14 px-8 rounded-2xl border-white/5 glass hover:border-primary/50 text-white/60 hover:text-white transition-all font-bold group"
              >
                {isSeeding ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Database className="w-4 h-4 mr-3 group-hover:text-primary transition-colors" />}
                Seed Protocols
              </Button>
            </div>
          )}
        </div>

        {activeTab === 'content' ? (

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <Card className="glass border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-[2.5rem]">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-2xl font-headline font-bold text-white flex items-center gap-3">
                  <Film className="w-6 h-6 text-primary" /> Cinematic Metadata
                </CardTitle>
                <CardDescription className="text-white/40">Core parameters for the media protocol.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Title</Label>
                    <Input {...register("title")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:border-primary transition-all text-lg font-medium px-6" placeholder="Neural Protocol" required />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Genre</Label>
                    <Input {...register("genre")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:border-primary transition-all text-lg font-medium px-6" placeholder="Cyberpunk" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Type</Label>
                    <select 
                      {...register("type")} 
                      className="w-full h-14 bg-white/5 border border-white/10 text-white rounded-2xl px-6 focus:border-primary focus:outline-none transition-all text-lg font-medium appearance-none"
                    >
                      <option value="movie" className="bg-[#0B0B0F]">Cinematic Movie</option>
                      <option value="show" className="bg-[#0B0B0F]">TV Series Protocol</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Release Year</Label>
                    <Input {...register("releaseYear")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:border-primary transition-all text-lg font-medium px-6" placeholder="2024" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Duration</Label>
                    <Input {...register("duration")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:border-primary transition-all text-lg font-medium px-6" placeholder="2h 15m" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Synopsis</Label>
                  <Textarea {...register("description")} className="min-h-[160px] bg-white/5 border-white/10 text-white rounded-[2rem] p-6 focus:border-primary transition-all text-lg font-medium resize-none" placeholder="Synchronize plot overview..." required />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="glass border-white/10 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-headline font-bold text-white flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-accent" /> Quality & Assets
                </CardTitle>
                <CardDescription className="text-white/40">Upload high-fidelity protocols.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Stream Quality</Label>
                  <Select onValueChange={(v) => setValue("quality", v)} defaultValue="4K ULTRA HDR">
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-14 rounded-2xl">
                      <SelectValue placeholder="Select Quality" />
                    </SelectTrigger>
                    <SelectContent className="glass text-white">
                      <SelectItem value="4K ULTRA HDR">4K ULTRA HDR</SelectItem>
                      <SelectItem value="1080P FULL HD">1080P FULL HD</SelectItem>
                      <SelectItem value="720P HD">720P HD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Poster Image</Label>
                  <div className="relative group/upload">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'poster')}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      disabled={isPosterUploading}
                    />
                    <div className={`h-32 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 transition-all ${isPosterUploading ? 'border-primary bg-primary/5' : 'border-white/10 group-hover/upload:border-primary/50 bg-white/2'}`}>
                      {isPosterUploading ? (
                        <div className="flex flex-col items-center gap-2 px-6 w-full">
                          <span className="text-[10px] font-black text-primary uppercase">Synchronizing Asset...</span>
                          <Progress value={posterProgress} className="h-1 bg-white/5" indicatorClassName="bg-primary shadow-[0_0_10px_#FF2E63]" />
                        </div>
                      ) : (
                        <>
                          <LayoutGrid className="w-6 h-6 text-white/20 group-hover/upload:text-primary transition-colors" />
                          <span className="text-xs font-bold text-white/40 group-hover/upload:text-white transition-colors">Select Poster File</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Video Protocol</Label>
                  <div className="relative group/upload">
                    <input 
                      type="file" 
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, 'video')}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      disabled={isVideoUploading}
                    />
                    <div className={`h-32 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 transition-all ${isVideoUploading ? 'border-accent bg-accent/5' : 'border-white/10 group-hover/upload:border-accent/50 bg-white/2'}`}>
                      {isVideoUploading ? (
                        <div className="flex flex-col items-center gap-2 px-6 w-full">
                          <span className="text-[10px] font-black text-accent uppercase">Uploading Protocol...</span>
                          <Progress value={videoProgress} className="h-1 bg-white/5" indicatorClassName="bg-accent shadow-[0_0_10px_#00F5FF]" />
                        </div>
                      ) : (
                        <>
                          <Film className="w-6 h-6 text-white/20 group-hover/upload:text-accent transition-colors" />
                          <span className="text-xs font-bold text-white/40 group-hover/upload:text-white transition-colors">Select Video Stream</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || isPosterUploading || isVideoUploading}
                    className="w-full h-16 bg-primary text-white font-black rounded-2xl text-lg hover:neon-glow-primary active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,46,99,0.2)] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Check className="w-5 h-5 mr-3" />}
                    Broadcast Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="glass border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-headline font-bold text-white flex items-center gap-3">
                  <Monitor className="w-6 h-6 text-primary" /> General Nexus Config
                </CardTitle>
                <CardDescription className="text-white/40">Global parameters for the Replica frontend matrix.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Site Title Tag</Label>
                  <Input defaultValue="REPLICA | THE NEXUS" className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6 focus:border-primary transition-all text-lg font-medium" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Maintenance Lock</Label>
                  <Select defaultValue="OFF">
                    <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass text-white border-white/10">
                      <SelectItem value="OFF">DEACTIVATED (LIVE)</SelectItem>
                      <SelectItem value="ON">ACTIVATED (MAINTENANCE)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Neural Branding</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary shadow-[0_0_20px_rgba(255,46,99,0.3)] border border-white/10" />
                    <div className="w-12 h-12 rounded-xl bg-accent shadow-[0_0_20px_rgba(0,245,255,0.3)] border border-white/10" />
                    <div className="w-12 h-12 rounded-xl bg-[#050507] border border-white/10" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-headline font-bold text-white flex items-center gap-3">
                  <Database className="w-6 h-6 text-accent" /> Infrastructure Health
                </CardTitle>
                <CardDescription className="text-white/40">Nexus health and synchronization status.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between group/status">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 group-hover/status:text-emerald-500 transition-colors">Firestore Cluster</p>
                    <p className="text-lg font-bold text-white">Online & Operational</p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10B981]" />
                </div>
                <div className="p-6 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 flex items-center justify-between group/status">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500/60 group-hover/status:text-blue-500 transition-colors">Storage Uplink</p>
                    <p className="text-lg font-bold text-white">Synchronized (99.9%)</p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_#3B82F6]" />
                </div>
                <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-center justify-between group/status opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 group-hover/status:text-primary transition-colors">AI Processing Node</p>
                    <p className="text-lg font-bold text-white">Edge Integration Pending</p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
