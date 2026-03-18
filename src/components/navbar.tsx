'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Stethoscope, User, LogIn, MapPin, LogOut } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [activeEmail, setActiveEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('sesion_activa_email');
    setActiveEmail(email);
  }, [user]);

  const handleSignOut = async () => {
    if (auth) await signOut(auth);
    localStorage.removeItem('sesion_activa_email');
    setActiveEmail(null);
    router.push('/');
  };

  const isLoggedIn = user || activeEmail;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary p-2 rounded-lg text-primary-foreground group-hover:rotate-12 transition-transform">
                <Stethoscope className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold font-headline tracking-tight text-primary">AgendaCitas Nacional CR</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/locations" className="hidden md:flex text-foreground/70 hover:text-primary px-3 py-2 rounded-md text-sm font-medium items-center gap-2 transition-colors">
              <MapPin className="h-4 w-4" /> Sedes Nacionales
            </Link>
            
            {isLoggedIn ? (
              <>
                <Link href="/profile" className="text-foreground/70 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                  <User className="h-4 w-4" /> Mi Expediente
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden md:flex text-muted-foreground hover:text-destructive rounded-full">
                  <LogOut className="h-4 w-4 mr-2" /> Salir
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="sm" className="font-bold border-primary text-primary hover:bg-primary hover:text-white rounded-full px-6 transition-all">
                  <Link href="/auth/login" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" /> Ingresar
                  </Link>
                </Button>
                <Button asChild variant="default" size="sm" className="hidden sm:flex bg-primary hover:bg-primary/90 rounded-full font-bold px-6">
                  <Link href="/auth/register">Registrarse</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
