
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ProfileSelector } from "@/components/ProfileSelector";
import { ReplicaNavbar } from "@/components/ReplicaNavbar";

export default function ProfilesPage() {
  const router = useRouter();

  const handleSelect = (profileId: string) => {
    localStorage.setItem('replica_active_profile', profileId);
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-background">
      <ReplicaNavbar />
      <ProfileSelector onSelect={handleSelect} />
    </main>
  );
}
