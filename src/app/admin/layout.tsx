"use client";

import { useFirebase, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, firestore, isUserLoading } = useFirebase();
  const router = useRouter();

  const adminRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "roles_admin", user.uid);
  }, [firestore, user]);

  const { data: adminData, isLoading: isAdminLoading, error } = useDoc(adminRef);

  useEffect(() => {
    if (!isUserLoading && !isAdminLoading) {
      const isExplicitAdmin = user?.email === 'admin@replica.com';
      if (!isExplicitAdmin && !adminData) {
        router.replace('/');
      }
    }
  }, [user, adminData, isUserLoading, isAdminLoading, router]);

  if (isUserLoading || isAdminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const isExplicitAdmin = user?.email === 'admin@replica.com';
  if (!isExplicitAdmin && !adminData) return null;

  return <>{children}</>;
}
