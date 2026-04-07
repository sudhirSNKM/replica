
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  Upload, Film, Database, Check, Loader2, Monitor, Calendar, Zap, 
  ShieldAlert, Key, Activity, BarChart3, Trash2, Edit3, Users as UsersIcon 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/firebase/storage/use-upload";
import { Progress } from "@/components/ui/progress";
import { Settings as SettingsIcon, LayoutGrid } from "lucide-react";

export const AdminPanel = () => {
  const { user, isUserLoading } = useUser();
  const [activeTab, setActiveTab] = useState<'content' | 'library' | 'analytics' | 'settings' | 'users'>('content');
  const [userList, setUserList] = useState<any[]>([]);
  const [contentList, setContentList] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  const selectedQuality = watch("quality", "4K ULTRA HDR");
  const { uploadFile: uploadPoster, progress: posterProgress, isUploading: isPosterUploading } = useUpload();
  const { uploadFile: uploadVideo, progress: videoProgress, isUploading: isVideoUploading } = useUpload();

  useEffect(() => {
    async function checkAdmin() {
      if (!firestore || !user) return;
      const adminRef = doc(firestore, "roles_admin", user.uid);
      const snap = await getDoc(adminRef);
      setIsAdmin(snap.exists());
    }
    checkAdmin();
  }, [firestore, user]);

  const handlePromote = async () => {
    if (!firestore || !user) return;
    setIsPromoting(true);
    try {
      const adminRef = doc(firestore, "roles_admin", user.uid);
      await setDoc(adminRef, {
        uid: user.uid,
        email: user.email || "demo@replica.nexus",
        promotedAt: new Date().toISOString()
      });
      setIsAdmin(true);
      toast({ title: "Neural Promotion Success", description: "You are now an authorized Broadcast Admin." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Promotion Failed", description: e.message });
    } finally {
      setIsPromoting(false);
    }
  };

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
    if (!firestore || !isAdmin) {
      toast({ variant: "destructive", title: "Access Denied", description: "Only authorized admins can broadcast content." });
      return;
    }
    setIsSubmitting(true);

    const id = Math.random().toString(36).substring(2, 9);
    const contentRef = doc(firestore, "content", id);
    
    const payload = {
      ...data,
      id,
      uploaderId: user?.uid,
      type: data.type || 'movie',
      rating: (Math.random() * 2 + 7.5).toFixed(1),
      genres: [data.genre || "Action"],
      isTrending: true,
      isNew: true,
      quality: selectedQuality,
      publishDate: data.publishDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(contentRef, payload);
      toast({
        title: "Metadata Synchronized",
        description: `${data.title} has been scheduled for broadcast.`,
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
    if (!firestore || !isAdmin) return;
    setIsSeeding(true);

    try {
      for (const movie of MOCK_MOVIES) {
        const contentRef = doc(firestore, "content", movie.id);
        await setDoc(contentRef, {
          ...movie,
          quality: "4K ULTRA HDR",
          publishDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      toast({
        title: "Neural Sync Complete",
        description: `${MOCK_MOVIES.length} cinematic protocols synchronized.`,
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Error", description: e.message });
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && firestore) {
      const fetchUsers = async () => {
        setIsUsersLoading(true);
        try {
          const querySnapshot = await getDocs(collection(firestore, "userAccounts"));
          const usersData = querySnapshot.docs.map((doc: any) => ({
            ...doc.data(),
            id: doc.id
          }));
          setUserList(usersData);
        } catch (error: any) {
          toast({ variant: "destructive", title: "Identity Retrieval Failed", description: error.message });
        } finally {
          setIsUsersLoading(false);
        }
      };
      fetchUsers();
    }

    if (activeTab === 'library' && firestore) {
      const fetchContent = async () => {
        setIsContentLoading(true);
        try {
          const querySnapshot = await getDocs(collection(firestore, "content"));
          const contentData = querySnapshot.docs.map((doc: any) => ({
            ...doc.data(),
            id: doc.id
          }));
          setContentList(contentData);
        } catch (error: any) {
          toast({ variant: "destructive", title: "Library Sync Failed", description: error.message });
        } finally {
          setIsContentLoading(false);
        }
      };
      fetchContent();
    }
  }, [activeTab, firestore, toast]);

  const deleteContent = async (id: string) => {
    if (!firestore || !isAdmin) return;
    try {
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(firestore, "content", id));
      setContentList((prev: any[]) => prev.filter((c: any) => c.id !== id));
      toast({ title: "Node Deinitialized", description: "Content removed from the matrix." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: e.message });
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen pt-36 px-6 md:px-12 flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen pt-36 px-6 flex items-center justify-center bg-background">
        <Card className="glass border-white/5 w-full max-w-md p-12 rounded-[4rem] text-center space-y-8">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20">
            <ShieldAlert className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-white tracking-tighter">Neural Promotion</h2>
            <p className="text-white/40 font-medium leading-relaxed">Identity requires clearance to access broadcast controls.</p>
          </div>
          <Button onClick={handlePromote} disabled={isPromoting} className="w-full h-16 rounded-2xl bg-primary hover:neon-glow-primary text-white font-bold text-lg">
            {isPromoting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Request Admin Clearance"}
          </Button>
        </Card>
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
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'analytics' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                <Zap className="w-4 h-4" /> Neural Analytics
              </button>
              <button 
                onClick={() => setActiveTab('content')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'content' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                <Upload className="w-4 h-4" /> Broadcast Uplink
              </button>
              <button 
                onClick={() => setActiveTab('library')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'library' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                <Film className="w-4 h-4" /> Content Library
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

        {activeTab === 'analytics' ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Neural Throughput', value: '1.2 PB', change: '+12%', icon: Activity, color: 'text-primary' },
                { label: 'Active Identities', value: '42,081', change: '+5.2%', icon: UsersIcon, color: 'text-accent' },
                { label: 'Credits Generated', value: '₿ 4.82', change: '+8.1%', icon: Zap, color: 'text-yellow-400' },
                { label: 'Broadcast Uptime', value: '99.99%', change: 'Stable', icon: ShieldAlert, color: 'text-emerald-400' }
              ].map((stat, i) => (
                <Card key={i} className="glass border-white/5 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">{stat.change}</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">{stat.label}</p>
                    <p className="text-3xl font-headline font-bold text-white tracking-tighter mt-1">{stat.value}</p>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="glass border-white/10 rounded-[3rem] overflow-hidden">
               <CardHeader className="p-10 pb-0">
                <CardTitle className="text-3xl font-headline font-bold text-white tracking-tight">System Analysis</CardTitle>
                <CardDescription className="text-white/40">Real-time performance metrics across the Nexus nodes.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="h-64 flex items-end gap-2 px-4 border-b border-white/5 pb-2">
                  {[40, 70, 45, 90, 65, 80, 50, 95, 75, 85, 60, 100].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.05, duration: 1 }}
                      className="flex-1 bg-gradient-to-t from-primary/20 via-primary/60 to-primary rounded-t-lg shadow-[0_0_20px_rgba(255,46,99,0.2)]"
                    />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-12">
                   <div className="space-y-2">
                     <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Top Content Node</p>
                     <p className="text-xl font-bold text-white">Neon Protocol</p>
                     <p className="text-[10px] text-primary font-black uppercase">12.4k Views</p>
                   </div>
                   <div className="space-y-2">
                     <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Regional Density</p>
                     <p className="text-xl font-bold text-white">Neo-Tokyo</p>
                     <p className="text-[10px] text-accent font-black uppercase">Active Sector</p>
                   </div>
                   <div className="space-y-2">
                     <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Hardware Load</p>
                     <p className="text-xl font-bold text-white">NVIDIA A100 x8</p>
                     <p className="text-[10px] text-emerald-400 font-black uppercase">Nominal</p>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : activeTab === 'library' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <Card className="glass border-white/10 rounded-[3rem] overflow-hidden">
                <CardHeader className="p-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-3xl font-headline font-bold text-white tracking-tight">Content Library</CardTitle>
                      <CardDescription className="text-white/40">Synchronized cinematic protocols in the matrix.</CardDescription>
                    </div>
                    <Button onClick={() => setActiveTab('content')} className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white rounded-2xl px-6">
                      Add New Node
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-10 pt-0">
                  {isContentLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                      <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-black">Scanning Matrix</p>
                    </div>
                  ) : contentList.length === 0 ? (
                    <div className="text-center py-24 space-y-6">
                      <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto opacity-20">
                        <Database className="w-10 h-10" />
                      </div>
                      <p className="text-white/40 font-medium">No cinematic protocols found in the current sector.</p>
                      <Button onClick={seedDatabase} variant="outline" className="border-white/10 text-white/60">Initialize Seed Protocols</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contentList.map(item => (
                        <div key={item.id} className="p-6 rounded-[2rem] glass border-white/5 flex items-center justify-between hover:bg-white/[0.02] transition-all group/item">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 relative">
                               {item.thumbnailUrl ? (
                                 <img src={item.thumbnailUrl} className="w-full h-full object-cover opacity-60 group-hover/item:opacity-100 transition-opacity" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center"><Film className="w-6 h-6 text-white/10" /></div>
                               )}
                               <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 text-[8px] font-black uppercase text-white/60 leading-none">
                                 {item.quality?.split(' ')[0] || '4K'}
                               </div>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white tracking-tight">{item.title}</h3>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[10px] text-primary font-black uppercase tracking-widest">{item.type}</span>
                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                <span className="text-[10px] text-white/40 font-bold">{item.genre || "Cyberpunk"}</span>
                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                <span className="text-[10px] text-white/40 font-bold">{item.releaseYear || "2024"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <Button size="icon" className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10">
                               <Key className="w-5 h-5" />
                             </Button>
                             <Button onClick={() => deleteContent(item.id)} size="icon" className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10">
                               <ShieldAlert className="w-5 h-5" />
                             </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
             </Card>
          </div>
        ) : activeTab === 'content' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="lg:col-span-2 space-y-8">
              <Card className="glass border-white/10 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-0">
                  <CardTitle className="text-2xl font-headline font-bold text-white flex items-center gap-3">
                    <Film className="w-6 h-6 text-primary" /> Content Protocol
                  </CardTitle>
                  <CardDescription className="text-white/40">Core parameters for the cinematic library.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-white/30">Title</Label>
                      <Input {...register("title")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl" placeholder="Neon Protocol" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-white/30">Genre</Label>
                      <Input {...register("genre")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl" placeholder="Cyberpunk" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-white/30">Type</Label>
                      <select {...register("type")} className="w-full h-14 bg-white/5 border border-white/10 text-white rounded-2xl px-4 appearance-none focus:outline-none">
                        <option value="movie" className="bg-[#0B0B0F]">Movie</option>
                        <option value="show" className="bg-[#0B0B0F]">Show</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-white/30">Year</Label>
                      <Input {...register("releaseYear")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl" placeholder="2024" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-white/30">Duration</Label>
                      <Input {...register("duration")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl" placeholder="2h 15m" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/30">Publish Protocol (Launch Date)</Label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <Input type="datetime-local" {...register("publishDate")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl pl-12" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/30">Synopsis</Label>
                    <Textarea {...register("description")} className="min-h-[120px] bg-white/5 border-white/10 text-white rounded-2xl" placeholder="Plot overview..." required />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="glass border-white/10 rounded-[2.5rem]">
                <CardHeader className="p-8">
                  <CardTitle className="text-xl font-headline font-bold text-white flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-accent" /> Quality & Assets
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/30">Quality Tier</Label>
                    <Select onValueChange={(v) => setValue("quality", v)} defaultValue="4K ULTRA HDR">
                      <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-2xl">
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
                    <Label className="text-[10px] uppercase tracking-widest text-white/30">Visual Protocol (Poster)</Label>
                    <Input type="file" onChange={(e) => handleFileChange(e, 'poster')} className="hidden" id="poster-up" />
                    <label htmlFor="poster-up" className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-primary/50 transition-all bg-white/2">
                      {isPosterUploading ? <Progress value={posterProgress} className="w-2/3 h-1" /> : <><Upload className="w-6 h-6 text-white/20 mb-2" /><span className="text-xs text-white/40">Upload Image</span></>}
                    </label>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase tracking-widest text-white/30">Stream Protocol (Video)</Label>
                    <Input type="file" onChange={(e) => handleFileChange(e, 'video')} className="hidden" id="video-up" />
                    <label htmlFor="video-up" className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-accent/50 transition-all bg-white/2">
                      {isVideoUploading ? <Progress value={videoProgress} className="w-2/3 h-1" /> : <><Film className="w-6 h-6 text-white/20 mb-2" /><span className="text-xs text-white/40">Upload Video</span></>}
                    </label>
                  </div>
                  <Button type="submit" disabled={isSubmitting || isPosterUploading || isVideoUploading} className="w-full h-16 bg-primary text-white font-bold rounded-2xl text-lg hover:neon-glow-primary transition-all">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                    Finalize Broadcast
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        ) : activeTab === 'users' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Card className="glass border-white/10 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8">
                  <CardTitle className="text-2xl font-headline font-bold text-white flex items-center gap-3">
                    <UsersIcon className="w-6 h-6 text-primary" /> Neural Identities
                  </CardTitle>
                  <CardDescription className="text-white/40">Connected nodes in the matrix.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  {isUsersLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
                  ) : (
                    <div className="space-y-4">
                      {userList.map(u => (
                        <div key={u.id} className="p-6 rounded-2xl glass border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                              <span className="text-xs font-black text-primary">{u.role?.charAt(0).toUpperCase() || 'U'}</span>
                            </div>
                            <div>
                              <p className="text-white font-bold">{u.email || u.phoneNumber || "Anonymous Node"}</p>
                              <p className="text-[10px] text-white/40 uppercase tracking-widest">{u.id}</p>
                            </div>
                          </div>
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/40'}`}>
                            {u.role || 'user'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
             </Card>
          </div>
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
                <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex items-center justify-between group/status">
                   <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 group-hover/status:text-primary transition-colors">Admin Identity</p>
                    <p className="text-sm font-bold text-white truncate max-w-[200px]">{user?.email || user?.uid}</p>
                  </div>
                  <Key className="w-5 h-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
