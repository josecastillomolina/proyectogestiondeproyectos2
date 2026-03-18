"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, LogOut, Loader2, Mail } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

export default function Profile() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-accent/5 py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="rounded-3xl border-none shadow-xl">
            <CardHeader className="bg-primary text-white text-center py-8">
              <div className="mx-auto w-16 h-16 rounded-full border-2 border-white flex items-center justify-center mb-2">
                <User className="h-8 w-8" />
              </div>
              <CardTitle>{user?.displayName || "Usuario Nacional"}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Correo Electrónico</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full rounded-full h-11 text-destructive hover:bg-destructive/5" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
