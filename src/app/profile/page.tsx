"use client";

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, LogOut, Loader2, Mail, CreditCard, ShieldCheck, MapPin, Phone } from 'lucide-react';
import { useUser, useAuth, useDoc, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';

export default function Profile() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  // Consultar datos extendidos del expediente en Firestore
  const userDocRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc(userDocRef);

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
        <main className="flex-grow flex items-center justify-center bg-accent/5">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <p className="text-muted-foreground font-medium">Cargando expediente nacional...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-accent/5 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Panel Lateral: Información de Identidad */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="rounded-3xl border-none shadow-xl overflow-hidden">
                <CardHeader className="bg-primary text-white text-center py-10">
                  <div className="mx-auto w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center mb-4 bg-white/10 backdrop-blur-sm">
                    <User className="h-12 w-12" />
                  </div>
                  <CardTitle className="text-xl font-headline">{user?.displayName || "Usuario Nacional"}</CardTitle>
                  <CardDescription className="text-white/80">Identificación Activa</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cédula</p>
                        <p className="font-bold truncate">{profileData?.idNumber || "No disponible"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <Mail className="h-5 w-5 text-primary" />
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Correo</p>
                        <p className="text-sm font-medium truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full rounded-full h-11 text-destructive border-destructive/20 hover:bg-destructive/5 font-bold" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
                  </Button>
                </CardContent>
              </Card>

              <div className="bg-secondary p-6 rounded-3xl text-white space-y-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  <p className="font-bold">Protección de Datos</p>
                </div>
                <p className="text-xs opacity-90 leading-relaxed">Tu información médica está cifrada bajo estándares nacionales de seguridad digital.</p>
              </div>
            </div>

            {/* Panel Principal: Detalles del Expediente */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-3xl border-none shadow-xl p-8">
                <div className="flex items-center justify-between mb-8 pb-4 border-b">
                  <h3 className="text-2xl font-bold font-headline">Resumen de Expediente</h3>
                  <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                    Estado: Verificado
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-accent p-3 rounded-2xl">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Nombre Completo</p>
                          <p className="font-semibold text-lg">{user?.displayName || "Pendiente"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="bg-accent p-3 rounded-2xl">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Teléfono</p>
                          <p className="font-semibold text-lg">{profileData?.phone || "No registrado"}</p>
                        </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-accent p-3 rounded-2xl">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Ubicación</p>
                          <p className="font-semibold text-lg">{profileData?.province || "Nacional"}</p>
                        </div>
                      </div>
                      <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                        <p className="text-xs font-bold text-primary uppercase mb-2">Próxima Cita</p>
                        <p className="text-sm italic text-muted-foreground">No hay citas agendadas para los próximos 7 días.</p>
                        <Button variant="link" className="p-0 h-auto text-primary text-xs font-bold mt-2" onClick={() => router.push('/appointments')}>
                          Agendar Cita Nacional →
                        </Button>
                      </div>
                   </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Button className="h-14 rounded-3xl font-bold text-lg shadow-lg shadow-primary/20" onClick={() => router.push('/appointments')}>
                   Nueva Cita
                </Button>
                <Button variant="outline" className="h-14 rounded-3xl font-bold text-lg border-2" onClick={() => router.push('/locations')}>
                   Sedes Cercanas
                </Button>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
