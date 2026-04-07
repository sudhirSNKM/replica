"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  Upload, Film, Database, Check, Loader2, Monitor, Calendar, Zap, 
  ShieldAlert, Activity, Trash2, Users as UsersIcon, Link as LinkIcon,
  Sparkles, Info, Clock, AlertTriangle, Settings as SettingsIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useUser } from "@/firebase";
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/firebase/storage/use-upload";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const AdminPanel = () => {
  const { user, isUserLoading } = useUser();
  const [activeTab, setActiveTab] = useState<'content' | 'library' | 'analytics' | 'settings' | 'users'>('content');
  const [userList, setUserList] = useState<any[]>([]);
  const [contentList, setContentList] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);
  
  const [posterMode, setPosterMode] = useState<'upload' | 'link'>('upload');
  const [videoMode, setVideoMode] = useState<'upload' | 'link'>('link');

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      title: "",
      genre: "",
      type: "movie",
      releaseYear: "2024",
      duration: "2h 15m",
      publishDate: new Date().toISOString().slice(0, 16),
      description: "",
      quality: "4K ULTRA HDR",
      thumbnailUrl: "",
      videoUrl: ""
    }
  });

  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  const thumbnailUrl = watch("thumbnailUrl");
  const videoUrl = watch("videoUrl");

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
        email: user.email || "admin@replica.com",
        promotedAt: new Date().toISOString()
      });
      setIsAdmin(true);
      toast({ title: "Neural Promotion Success", description: "Identity authorized for broadcast management." });
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
      const timestamp = Date.now();
      const path = `broadcasts/${timestamp}_${file.name}`;
      
      const url = type === 'poster' 
        ? await uploadPoster(file, path) 
        : await uploadVideo(file, path);
      
      setValue(type === 'poster' ? 'thumbnailUrl' : 'videoUrl', url);
      
      toast({
        title: `${type === 'poster' ? 'Asset' : 'Protocol'} Synchronized`,
        description: "Media added to storage cluster.",
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
      toast({ variant: "destructive", title: "Access Denied", description: "Authorization required." });
      return;
    }

    if (!data.thumbnailUrl || !data.videoUrl) {
      toast({ variant: "destructive", title: "Missing Protocols", description: "Visual and stream assets required." });
      return;
    }

    setIsSubmitting(true);
    const id = "c-" + Math.random().toString(36).substring(2, 9);
    const contentRef = doc(firestore, "content", id);
    
    const payload = {
      ...data,
      id,
      uploaderId: user?.uid,
      rating: (Math.random() * 2 + 7.5).toFixed(1),
      genres: [data.genre || "Action"],
      isTrending: true,
      isNew: true,
      publishDate: new Date(data.publishDate).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(contentRef, payload);
      toast({
        title: "Broadcast Finalized",
        description: `${data.title} scheduled for launch.`,
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
        description: `${MOCK_MOVIES.length} protocols synchronized.`,
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
          toast({ variant: "destructive", title: "Retrieval Failed", description: error.message });
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

  const handleDeleteContent = async (id: string) => {
    if (!firestore || !isAdmin) return;
    try {
      await deleteDoc(doc(firestore, "content", id));
      setContentList((prev: any[]) => prev.filter((c: any) => c.id !== id));
      toast({ title: "Node Deinitialized", description: "Content removed from the matrix." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: e.message });
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen pt-36 px-6 flex items-center justify-center bg-background text-white">
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
            <h2 className="text-4xl font-headline font-bold text-white tracking-tighter">Clearance Required</h2>
            <p className="text-white/40 font-medium">Your node requires administrative promotion.</p>
          </div>
          <Button onClick={handlePromote} disabled={isPromoting} className="w-full h-16 rounded-2xl bg-primary hover:neon-glow-primary text-white font-bold text-lg">
            {isPromoting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Authorize Node"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-36 px-6 md:px-12 pb-24 bg-background">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[10px]">
              <div className="w-8 h-[1px] bg-primary" />
              Administrative Nexus 2.0
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold text-white tracking-tighter">
              Broadcast <span className="text-primary text-glow">Control</span>
            </h1>
            
            <div className="flex flex-wrap gap-2 p-1 bg-white/[0.03] border border-white/5 rounded-2xl w-fit mt-6">
              {[
                { id: 'content', icon: Upload, label: 'Broadcast' },
                { id: 'library', icon: Film, label: 'Library' },
                { id: 'users', icon: UsersIcon, label: 'Identities' },
                { id: 'analytics', icon: Zap, label: 'Stats' }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {activeTab === 'content' && (
            <Button 
              onClick={seedDatabase} 
              disabled={isSeeding}
              variant="outline" 
              className="h-14 px-8 rounded-2xl border-white/5 glass hover:border-primary/50 text-white/60 hover:text-white transition-all font-bold"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Database className="w-4 h-4 mr-3" />}
              Seed Nexus Data
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'content' && (
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit(onSubmit)} 
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              <div className="lg:col-span-7 space-y-8">
                <Card className="glass border-white/10 rounded-[3rem] overflow-hidden">
                  <CardHeader className="p-10 pb-0">
                    <CardTitle className="text-3xl font-headline font-bold text-white flex items-center gap-3">
                      <Sparkles className="w-8 h-8 text-primary" /> Core Protocol
                    </CardTitle>
                    <CardDescription className="text-white/40">Define the metadata for the cinematic experience.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black">Title</Label>
                        <Input {...register("title")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6" placeholder="Enter Movie Title" required />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black">Genre</Label>
                        <Input {...register("genre")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6" placeholder="e.g. Cyberpunk" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black">Type</Label>
                        <select {...register("type")} className="w-full h-14 bg-white/5 border border-white/10 text-white rounded-2xl px-6 appearance-none focus:outline-none">
                          <option value="movie" className="bg-[#0B0B0F]">Movie</option>
                          <option value="show" className="bg-[#0B0B0F]">Series</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black">Year</Label>
                        <Input {...register("releaseYear")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6" placeholder="2024" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black">Duration</Label>
                        <Input {...register("duration")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6" placeholder="2h 15m" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-widest text-primary font-black flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Scheduled Launch (Publish Date)
                      </Label>
                      <Input type="datetime-local" {...register("publishDate")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6" required />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-widest text-primary font-black">Synopsis</Label>
                      <Textarea {...register("description")} className="min-h-[140px] bg-white/5 border-white/10 text-white rounded-[2rem] p-6 text-base" placeholder="Describe the cinematic journey..." required />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-5 space-y-8">
                <Card className="glass border-white/10 rounded-[3rem]">
                  <CardHeader className="p-10">
                    <CardTitle className="text-2xl font-headline font-bold text-white flex items-center gap-3">
                      <Zap className="w-6 h-6 text-accent" /> Media Uplink
                    </CardTitle>
                    <CardDescription className="text-white/40">Choose between Direct Upload or Instant Sync.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 pt-0 space-y-12">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-white/30">Quality Tier</Label>
                      <Select onValueChange={(v: string) => setValue("quality", v)} defaultValue="4K ULTRA HDR">
                        <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-2xl px-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass text-white">
                          <SelectItem value="4K ULTRA HDR">4K ULTRA HDR</SelectItem>
                          <SelectItem value="1080P FULL HD">1080P FULL HD</SelectItem>
                          <SelectItem value="720P HD">720P HD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] uppercase tracking-widest text-white/60 font-black">Thumbnail Protocol</Label>
                        <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                          <button type="button" onClick={() => setPosterMode('upload')} className={cn("px-4 py-1.5 text-[8px] font-black uppercase rounded-lg transition-all", posterMode === 'upload' ? 'bg-primary text-white' : 'text-white/30')}>Upload</button>
                          <button type="button" onClick={() => setPosterMode('link')} className={cn("px-4 py-1.5 text-[8px] font-black uppercase rounded-lg transition-all", posterMode === 'link' ? 'bg-primary text-white' : 'text-white/30')}>Link</button>
                        </div>
                      </div>

                      {posterMode === 'upload' ? (
                        <div className="relative">
                          <Input type="file" onChange={(e) => handleFileChange(e, 'poster')} className="hidden" id="poster-up" accept="image/*" />
                          <label htmlFor="poster-up" className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:border-primary/50 transition-all bg-white/[0.02] overflow-hidden group">
                            {isPosterUploading ? (
                              <div className="w-full px-10 space-y-4 text-center">
                                <Progress value={posterProgress} className="h-1.5 bg-white/5" />
                                <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-black animate-pulse">Syncing Visuals</span>
                              </div>
                            ) : thumbnailUrl ? (
                              <div className="relative w-full h-full">
                                <img src={thumbnailUrl} className="w-full h-full object-cover opacity-60" alt="Thumbnail Preview" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                   <Check className="w-8 h-8 text-white" />
                                </div>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-white/20 mb-3 group-hover:text-primary transition-colors" />
                                <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Upload Static Asset</span>
                              </>
                            )}
                          </label>
                        </div>
                      ) : (
                        <div className="relative group">
                          <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary" />
                          <Input {...register("thumbnailUrl")} className="h-16 bg-white/5 border-white/10 text-white rounded-2xl pl-14" placeholder="Instant Link (https://...)" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] uppercase tracking-widest text-white/60 font-black flex items-center gap-2">
                          Stream Protocol <Badge variant="outline" className="text-[7px] py-0 px-1 border-accent/40 text-accent">FAST SYNC RECOMMENDED</Badge>
                        </Label>
                        <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                          <button type="button" onClick={() => setVideoMode('upload')} className={cn("px-4 py-1.5 text-[8px] font-black uppercase rounded-lg transition-all", videoMode === 'upload' ? 'bg-accent text-white' : 'text-white/30')}>Upload</button>
                          <button type="button" onClick={() => setVideoMode('link')} className={cn("px-4 py-1.5 text-[8px] font-black uppercase rounded-lg transition-all", videoMode === 'link' ? 'bg-accent text-white' : 'text-white/30')}>Link</button>
                        </div>
                      </div>

                      {videoMode === 'upload' ? (
                        <div className="space-y-4">
                          <Input type="file" onChange={(e) => handleFileChange(e, 'video')} className="hidden" id="video-up" accept="video/*" />
                          <label htmlFor="video-up" className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:border-accent/50 transition-all bg-white/[0.02] group">
                            {isVideoUploading ? (
                              <div className="w-full px-10 space-y-4 text-center">
                                <Progress value={videoProgress} className="h-1.5 bg-white/5" />
                                <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-black animate-pulse">Syncing Stream</span>
                              </div>
                            ) : videoUrl ? (
                              <div className="flex flex-col items-center gap-2">
                                <Check className="w-10 h-10 text-emerald-500" />
                                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Protocol Stored</span>
                              </div>
                            ) : (
                              <>
                                <Film className="w-8 h-8 text-white/20 mb-3 group-hover:text-accent transition-colors" />
                                <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Upload Dynamic Protocol</span>
                              </>
                            )}
                          </label>
                          <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                            <AlertTriangle className="w-5 h-5 flex-none" />
                            <p className="text-[10px] font-bold leading-relaxed uppercase tracking-tight">Large media may take several minutes to synchronize. Use Link for instant results.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group">
                          <Monitor className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-accent" />
                          <Input {...register("videoUrl")} className="h-16 bg-white/5 border-white/10 text-white rounded-2xl pl-14" placeholder="Instant Link (https://...)" />
                        </div>
                      )}
                    </div>

                    <Button type="submit" disabled={isSubmitting || isPosterUploading || isVideoUploading} className="w-full h-20 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-3xl text-lg hover:neon-glow-primary transition-all shadow-2xl">
                      {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 mr-3" />}
                      Establish Broadcast
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.form>
          )}

          {activeTab === 'library' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <Card className="glass border-white/10 rounded-[3rem] p-10">
                <CardTitle className="text-3xl font-headline font-bold text-white mb-8">Synchronized Library</CardTitle>
                {isContentLoading ? (
                  <div className="flex justify-center p-20"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {contentList.map(item => (
                      <div key={item.id} className="p-6 rounded-[2rem] glass border-white/5 flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-28 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                            <img src={item.thumbnailUrl} className="w-full h-full object-cover" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold text-white">{item.title}</h3>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">{item.genre} • {item.type}</p>
                            <div className="pt-2">
                              <Badge variant="outline" className="text-[8px] border-primary/20 text-primary/60">{item.quality}</Badge>
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => handleDeleteContent(item.id)} variant="ghost" className="w-12 h-12 rounded-full text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-6 h-6" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="glass border-white/10 rounded-[3rem] p-10">
                <CardTitle className="text-3xl font-headline font-bold text-white mb-8">Active Identity Nodes</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userList.map(u => (
                    <div key={u.id} className="p-8 rounded-[2rem] glass border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <UsersIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-xl">{u.email || u.phoneNumber || "Guest Node"}</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">ID: {u.id.slice(0, 12)}...</p>
                        </div>
                      </div>
                      <Badge className="bg-white/5 text-white/40 border-white/10 uppercase tracking-widest text-[9px] px-4 py-1.5 rounded-full">{u.role || 'user'}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {[
                { label: 'Throughput', value: '1.2 PB', icon: Activity, color: 'text-primary' },
                { label: 'Neural Links', value: '42.1K', icon: UsersIcon, color: 'text-accent' },
                { label: 'Matrix Credits', value: '₿ 4.8', icon: Zap, color: 'text-yellow-400' },
                { label: 'Node Uptime', value: '99.9%', icon: ShieldAlert, color: 'text-emerald-400' }
              ].map((stat, i) => (
                <Card key={i} className="glass border-white/5 p-10 space-y-6 rounded-[3rem]">
                  <div className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10", stat.color)}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-black">{stat.label}</p>
                    <p className="text-4xl font-headline font-bold text-white tracking-tighter mt-1">{stat.value}</p>
                  </div>
                </Card>
              ))}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <Card className="glass border-white/10 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8">
                  <CardTitle className="text-2xl font-headline font-bold text-white flex items-center gap-3">
                    <Monitor className="w-6 h-6 text-primary" /> General Config
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">Site Title</Label>
                    <Input defaultValue="REPLICA | NEXUS" className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">Maintenance Mode</Label>
                    <Select defaultValue="OFF">
                      <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass text-white">
                        <SelectItem value="OFF">DEACTIVATED</SelectItem>
                        <SelectItem value="ON">ACTIVATED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8">
                  <CardTitle className="text-2xl font-headline font-bold text-white flex items-center gap-3">
                    <Database className="w-6 h-6 text-accent" /> Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                  <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Firestore Cluster</p>
                      <p className="text-lg font-bold text-white">Operational</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10B981]" />
                  </div>
                  <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-500/60">Storage Nexus</p>
                      <p className="text-lg font-bold text-white">Synchronized</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_#3B82F6]" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};