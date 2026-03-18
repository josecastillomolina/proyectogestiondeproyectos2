"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, LogOut, Loader2, Mail, CreditCard, ShieldCheck, Phone, UserCheck, Flag, CheckCircle2 } from 'lucide-react';
import { useUser, useDoc } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';

export default function Profile() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [localUser, setLocalUser] = useState<any>(null);

  const userDocRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [user?.uid]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    // Verificar sesión local
    const saved = localStorage.getItem('usuario_registrado');
    const session = localStorage.getItem('sesion_activa');
    
    if (saved && session === 'true') {
      setLocalUser(JSON.parse(saved));
    } else if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    if (auth) await signOut(auth);
    localStorage.removeItem('sesion_activa');
    setLocalUser(null);
    router.push('/');
  };

  // Determinar qué datos mostrar (Firebase tiene prioridad, LocalStorage es backup)
  const displayData = {
    fullName: user?.displayName || profileData?.fullName || localUser?.fullName || "Usuario CR",
    email: user?.email || profileData?.email || localUser?.email || "Sin correo",
    idNumber: profileData?.idNumber || localUser?.idNumber || "Cargando...",
    username: profileData?.username || localUser?.username || "Pendiente",
    phone: profileData?.phoneNumber || localUser?.phone || "No registrado",
    idType: profileData?.identificationType || localUser?.idType || "Nacional"
  };

  if (isUserLoading && !localUser) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-accent/5">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-accent/5 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="space-y-6">
              <Card className="rounded-[35px] border-none shadow-xl overflow-hidden bg-white">
                <CardHeader className="bg-primary text-white text-center py-12">
                  <div className="mx-auto w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center mb-4 bg-white/10 backdrop-blur-md">
                    <User className="h-12 w-12" />
                  </div>
                  <CardTitle className="text-2xl font-headline tracking-tight truncate px-4">{displayData.fullName}</CardTitle>
                  <CardDescription className="text-white/80 font-medium">Expediente Digital Activo</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-2xl">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cédula de Identidad</p>
                        <p className="font-bold text-sm">{displayData.idNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-2xl">
                      <Mail className="h-5 w-5 text-primary" />
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Correo</p>
                        <p className="text-sm font-medium truncate">{displayData.email}</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full rounded-full h-12 text-destructive border-destructive/20 hover:bg-destructive/5 font-bold mt-4" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
                  </Button>
                </CardContent>
              </Card>

              <div className="bg-secondary p-6 rounded-[30px] text-white space-y-2 shadow-lg relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-5 w-5" />
                    <p className="font-bold">Datos Protegidos</p>
                  </div>
                  <p className="text-xs opacity-90 leading-relaxed">Tu expediente nacional está cifrado bajo normativas oficiales de salud digital.</p>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                   <ShieldCheck className="h-24 w-24" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-[35px] border-none shadow-xl p-10 bg-white">
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-dashed">
                  <div>
                    <h3 className="text-3xl font-bold font-headline text-foreground">Detalles del Expediente</h3>
                    <p className="text-muted-foreground text-sm mt-1">Información oficial validada en la red nacional</p>
                  </div>
                  <div className="bg-primary/10 text-primary px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-primary/20 flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" /> Verificado
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/5 p-4 rounded-2xl">
                          <UserCheck className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1 tracking-widest">Nombre de Usuario</p>
                          <p className="font-bold text-lg">{displayData.username}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/5 p-4 rounded-2xl">
                          <Phone className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1 tracking-widest">Teléfono</p>
                          <p className="font-bold text-lg">{displayData.phone}</p>
                        </div>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/5 p-4 rounded-2xl">
                          <Flag className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1 tracking-widest">Tipo Identificación</p>
                          <p className="font-bold text-lg">{displayData.idType}</p>
                        </div>
                      </div>
                      <div className="bg-accent/30 p-5 rounded-3xl border-2 border-dashed">
                        <p className="text-[10px] font-bold text-primary uppercase mb-2 tracking-widest">Próxima Cita</p>
                        <p className="text-sm italic text-muted-foreground">No hay citas pendientes agendadas.</p>
                        <Button variant="link" className="p-0 h-auto text-primary text-xs font-bold mt-3" onClick={() => router.push('/appointments')}>
                          Agendar en Hospital →
                        </Button>
                      </div>
                   </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button className="h-16 rounded-[25px] font-bold text-lg shadow-xl shadow-primary/20 transition-all hover:-translate-y-1" onClick={() => router.push('/appointments')}>
                   Nueva Cita Médica
                </Button>
                <Button variant="outline" className="h-16 rounded-[25px] font-bold text-lg border-2 hover:bg-accent transition-all" onClick={() => router.push('/locations')}>
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