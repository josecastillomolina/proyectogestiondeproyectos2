'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Stethoscope, User, LogIn, Calendar, MapPin, LogOut } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

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
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/locations" className="text-foreground/70 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                <MapPin className="h-4 w-4" /> Sedes Nacionales
              </Link>
              <Link href="/appointments" className="text-foreground/70 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                <Calendar className="h-4 w-4" /> Agendar Cita
              </Link>
              
              {!isUserLoading && (
                <>
                  {user ? (
                    <>
                      <Link href="/profile" className="text-foreground/70 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                        <User className="h-4 w-4" /> Mi Expediente
                      </Link>
                      <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive rounded-full">
                        <LogOut className="h-4 w-4 mr-2" /> Salir
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline" size="sm" className="font-bold border-primary text-primary hover:bg-primary hover:text-white rounded-full px-6">
                        <Link href="/auth/login" className="flex items-center gap-2">
                          <LogIn className="h-4 w-4" /> Ingresar
                        </Link>
                      </Button>
                      <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/90 rounded-full font-bold px-6 shadow-md shadow-primary/20">
                        <Link href="/auth/register" className="flex items-center gap-2">
                          Registrarse
                        </Link>
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
