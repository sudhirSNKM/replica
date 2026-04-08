
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  Upload, Film, Database, Check, Loader2, Monitor, Calendar, Zap, 
  ShieldAlert, Activity, Trash2, Users as UsersIcon, Link as LinkIcon,
  Sparkles, Clock, AlertTriangle, Edit3, Search, MessageSquare, Plus,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { doc, setDoc, getDoc, collection, deleteDoc, query, orderBy } from "firebase/firestore";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/firebase/storage/use-upload";
import { Progress } from "@/components/ui/progress";
import { Movie } from "@/lib/types";
import { cn } from "@/lib/utils";

export const AdminPanel = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'content' | 'library' | 'identities' | 'analytics'>('content');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [posterMode, setPosterMode] = useState<'upload' | 'link'>('link');
  const [videoMode, setVideoMode] = useState<'upload' | 'link'>('link');

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      title: "",
      genres: "",
      type: "movie",
      releaseYear: "2024",
      duration: "2h 15m",
      publishDate: new Date().toISOString().slice(0, 16),
      description: "",
      tagline: "",
      cast: "",
      director: "",
      quality: "4K ULTRA HDR",
      thumbnailUrl: "",
      videoUrl: ""
    }
  });

  const firestore = useFirestore();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const thumbnailUrl = watch("thumbnailUrl");
  const videoUrl = watch("videoUrl");
  const selectedQuality = watch("quality");

  // Reactive Data Queries
  const contentQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "content"), orderBy("updatedAt", "desc"));
  }, [firestore]);

  const { data: allContent, isLoading: isContentLoading } = useCollection<Movie>(contentQuery);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "userAccounts");
  }, [firestore]);

  const { data: userList, isLoading: isUsersLoading } = useCollection(usersQuery);

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
      toast({ title: `${type === 'poster' ? 'Asset' : 'Protocol'} Synchronized`, description: "Media added to storage cluster." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync Error", description: err.message });
    }
  };

  const onEdit = (movie: Movie) => {
    setEditingId(movie.id);
    setValue("title", movie.title);
    setValue("description", movie.description);
    setValue("tagline", movie.tagline || "");
    setValue("genres", Array.isArray(movie.genres) ? movie.genres.join(", ") : movie.genres);
    setValue("type", movie.type);
    setValue("releaseYear", movie.releaseYear);
    setValue("duration", movie.duration);
    setValue("thumbnailUrl", movie.thumbnailUrl);
    setValue("videoUrl", movie.videoUrl);
    setValue("quality", (movie as any).quality || "4K ULTRA HDR");
    setValue("publishDate", (movie as any).publishDate?.substring(0, 16) || new Date().toISOString().substring(0, 16));
    setValue("cast", Array.isArray(movie.cast) ? movie.cast.join(", ") : (movie as any).cast || "");
    setValue("director", movie.director || "");
    
    setPosterMode('link');
    setVideoMode('link');
    setActiveTab('content');

    toast({ title: "Metadata Loaded", description: `Editing ${movie.title}.` });
  };

  const onDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to terminate the ${title} protocol? This cannot be undone.`)) return;
    if (!firestore) return;

    try {
      await deleteDoc(doc(firestore, "content", id));
      toast({ title: "Protocol Terminated", description: `${title} has been removed from the nexus.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: e.message });
    }
  };

  const onSubmit = async (data: any) => {
    if (!firestore || !isAdmin) {
      toast({ variant: "destructive", title: "Access Denied", description: "Authorization required." });
      return;
    }

    setIsSubmitting(true);
    const id = editingId || "c-" + Math.random().toString(36).substring(2, 9);
    const contentRef = doc(firestore, "content", id);
    
    const payload = {
      ...data,
      id,
      uploaderId: user?.uid,
      rating: data.rating || (Math.random() * 2 + 7.5).toFixed(1),
      genres: typeof data.genres === 'string' ? data.genres.split(",").map((g: string) => g.trim()) : data.genres,
      cast: typeof data.cast === 'string' ? data.cast.split(",").map((c: string) => c.trim()) : data.cast,
      isTrending: data.isTrending ?? true,
      isNew: !editingId,
      publishDate: new Date(data.publishDate).toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!editingId) {
      (payload as any).createdAt = new Date().toISOString();
    }

    try {
      await setDoc(contentRef, payload, { merge: true });
      toast({ title: editingId ? "Protocol Updated" : "Broadcast Finalized", description: `${data.title} is now synchronized.` });
      reset();
      setEditingId(null);
      setActiveTab('library');
    } catch (e: any) {
      toast({ variant: "destructive", title: "Integration Failed", description: e.message });
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
      toast({ title: "Neural Sync Complete", description: `${MOCK_MOVIES.length} protocols synchronized.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Error", description: e.message });
    } finally {
      setIsSeeding(false);
    }
  };

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

  const filteredContent = allContent?.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = [
    { label: 'Neural Throughput', value: `${((allContent?.length || 0) * 1.4).toFixed(1)} TB`, icon: Activity, color: 'text-primary' },
    { label: 'Neural Links (Users)', value: (userList?.length || 0).toLocaleString(), icon: UsersIcon, color: 'text-accent' },
    { label: 'Sync Protocols', value: (allContent?.length || 0).toString(), icon: Database, color: 'text-yellow-400' },
    { label: 'Stability Node', value: '99.9%', icon: ShieldAlert, color: 'text-emerald-400' }
  ];

  return (
    <div className="min-h-screen pt-36 px-6 md:px-12 pb-24 bg-background">
      <div className="max-w-6xl mx-auto space-y-16">
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
                { id: 'content', icon: Upload, label: editingId ? 'Edit Protocol' : 'Broadcast' },
                { id: 'library', icon: Film, label: 'Library' },
                { id: 'identities', icon: UsersIcon, label: 'Identities' },
                { id: 'analytics', icon: BarChart3, label: 'Stats' }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); if (tab.id !== 'content') setEditingId(null); }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <Button onClick={seedDatabase} disabled={isSeeding} variant="outline" className="h-14 px-8 rounded-2xl glass border-white/5 text-white/60 hover:text-white transition-all font-bold">
            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Database className="w-4 h-4 mr-3" />}
            Seed Nexus Data
          </Button>
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
                      <Sparkles className="w-8 h-8 text-primary" /> {editingId ? "Update Protocol" : "New Broadcast"}
                    </CardTitle>
                    <CardDescription className="text-white/40">Define cinematic metadata for the global matrix.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black">Title</Label>
                        <Input {...register("title")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6" placeholder="Enter Movie Title" required />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black">Genres</Label>
                        <Input {...register("genres")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6" placeholder="Cyberpunk, Sci-Fi" required />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-widest text-primary font-black">Tagline</Label>
                      <Input {...register("tagline")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6" placeholder="Reality is just a glitch..." />
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

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black">Cast (Comma separated)</Label>
                        <Input {...register("cast")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6" placeholder="Actor 1, Actor 2" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black">Director</Label>
                        <Input {...register("director")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6" placeholder="Director Name" />
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
                    <CardDescription className="text-white/40">Sync visual and stream protocols to the storage nexus.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 pt-0 space-y-12">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-white/30">Quality Tier</Label>
                      <Select onValueChange={(v: string) => setValue("quality", v)} value={selectedQuality}>
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
                            <p className="text-[10px] font-bold leading-relaxed uppercase tracking-tight">Large media may take several minutes to synchronize.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group">
                          <Monitor className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-accent" />
                          <Input {...register("videoUrl")} className="h-16 bg-white/5 border-white/10 text-white rounded-2xl pl-14" placeholder="Instant Link (https://...)" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      {editingId && (
                        <Button type="button" onClick={() => { setEditingId(null); reset(); }} variant="ghost" className="h-20 flex-1 text-white/40 uppercase font-black tracking-widest rounded-3xl">
                          Cancel
                        </Button>
                      )}
                      <Button type="submit" disabled={isSubmitting || isPosterUploading || isVideoUploading} className="flex-[2] h-20 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-3xl text-lg hover:neon-glow-primary transition-all shadow-2xl">
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : editingId ? <Edit3 className="w-6 h-6 mr-3" /> : <Sparkles className="w-6 h-6 mr-3" />}
                        {editingId ? "Update Metadata" : "Establish Broadcast"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.form>
          )}

          {activeTab === 'library' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <Card className="glass border-white/10 rounded-[3rem] p-10">
                <div className="flex items-center justify-between mb-8">
                  <CardTitle className="text-3xl font-headline font-bold text-white">Synchronized Library</CardTitle>
                  <div className="relative w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-12 bg-white/5 border-white/10 text-white rounded-xl pl-10" placeholder="Filter protocols..." />
                  </div>
                </div>
                
                {isContentLoading ? (
                  <div className="flex justify-center p-20"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>
                ) : filteredContent?.length === 0 ? (
                  <div className="text-center py-20 opacity-40 font-headline font-bold uppercase tracking-widest">Global Library Empty</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredContent?.map(item => (
                      <div key={item.id} className="p-6 rounded-[2rem] glass border-white/5 flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-28 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                            <img src={item.thumbnailUrl} className="w-full h-full object-cover" alt={item.title} />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold text-white">{item.title}</h3>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">{Array.isArray(item.genres) ? item.genres[0] : item.genres} • {item.type}</p>
                            <div className="flex items-center gap-2 pt-2">
                              <Badge variant="outline" className="text-[8px] border-primary/20 text-primary/60">{item.quality}</Badge>
                              <div className="flex items-center gap-1 text-[9px] text-white/20"><UsersIcon className="w-2 h-2" /> {(item as any).cast?.length || 0} Nodes</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => onEdit(item)} variant="ghost" className="w-12 h-12 rounded-full text-white/40 hover:text-primary hover:bg-primary/10">
                            <Edit3 className="w-6 h-6" />
                          </Button>
                          <Button onClick={() => onDelete(item.id, item.title)} variant="ghost" className="w-12 h-12 rounded-full text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-6 h-6" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {activeTab === 'identities' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="glass border-white/10 rounded-[3rem] p-10">
                <CardTitle className="text-3xl font-headline font-bold text-white mb-8">Active Identity Nodes</CardTitle>
                
                {isUsersLoading ? (
                  <div className="flex justify-center p-20"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>
                ) : userList?.length === 0 ? (
                  <div className="text-center py-20 opacity-40 font-headline font-bold uppercase tracking-widest">No Identity Nodes Detected</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userList?.map(u => (
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
                        <Badge className="bg-white/5 text-white/40 border-white/10 uppercase tracking-widest text-[9px] px-4 py-1.5 rounded-full">{(u as any).role || 'user'}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {stats.map((stat, i) => (
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
        </AnimatePresence>
      </div>
    </div>
  );
};
