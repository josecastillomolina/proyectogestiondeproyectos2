"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Activity, Calendar, MapPin, 
  Loader2, LogOut, Stethoscope, 
  CreditCard, Mail, Phone, Ticket
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, useAuth } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function Profile() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  // Guard de seguridad: si no carga en 3s y no hay usuario, redirigir
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isUserLoading && !user) {
        router.push('/auth/login');
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [user, isUserLoading, router]);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);
  const { data: appointments } = useCollection(
    useMemoFirebase(() => (db && user ? collection(db, 'users', user.uid, 'appointments') : null), [db, user])
  );

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  if (isUserLoading && !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  const displayFullName = profile?.firstName ? `${profile.firstName} ${profile.lastName}` : (user?.displayName || "Usuario de Salud");
  const displayEmail = user?.email || profile?.email || "Sin correo";
  const displayId = profile?.idNumber || "Cédula no registrada";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-accent/5 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <Card className="lg:col-span-1 rounded-3xl overflow-hidden border-none shadow-xl h-fit">
              <CardHeader className="bg-primary text-white text-center py-10">
                <div className="mx-auto w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 mb-4">
                  <User className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-xl font-headline truncate">{displayFullName}</CardTitle>
                <CardDescription className="text-white/80">Expediente Digital</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-bold">{displayId}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{displayEmail}</span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/5 rounded-xl" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="appointments">
                <TabsList className="grid w-full grid-cols-2 rounded-2xl mb-8">
                  <TabsTrigger value="appointments" className="rounded-xl font-bold">Mis Citas</TabsTrigger>
                  <TabsTrigger value="health" className="rounded-xl font-bold">Clínica</TabsTrigger>
                </TabsList>
                
                <TabsContent value="appointments">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Citas Próximas</h2>
                      <Button className="rounded-full" onClick={() => router.push('/appointments')}>Nueva Cita</Button>
                    </div>

                    {appointments && appointments.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {appointments.map((app) => (
                          <Card key={app.id} className="rounded-3xl border-none shadow-lg overflow-hidden">
                            <div className="bg-secondary p-3 text-white flex justify-between">
                              <Ticket className="h-4 w-4" />
                              <span className="text-xs font-mono">{app.voucherCode}</span>
                            </div>
                            <CardContent className="p-6">
                              <h3 className="font-bold text-lg text-primary">{app.healthCenterName}</h3>
                              <p className="text-sm font-medium">{app.specialty}</p>
                              <p className="text-xs text-muted-foreground mt-2">{new Date(app.appointmentDateTime).toLocaleDateString()}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-20 text-center rounded-3xl border-dashed">
                        <Calendar className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-muted-foreground font-bold">No tienes citas agendadas.</p>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="health">
                  <Card className="rounded-3xl p-8 bg-white border-none shadow-xl">
                    <div className="flex items-center gap-6 mb-8 bg-primary/5 p-6 rounded-2xl">
                      <Activity className="h-12 w-12 text-primary" />
                      <div>
                        <h3 className="font-bold text-xl">Expediente Clínico</h3>
                        <p className="text-sm text-muted-foreground">Información nacional vinculada.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-muted/30 p-6 rounded-2xl">
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Sangre</p>
                        <p className="text-2xl font-bold">{profile?.bloodType || "Pendiente"}</p>
                      </div>
                      <div className="bg-muted/30 p-6 rounded-2xl">
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Alergias</p>
                        <p className="text-lg font-bold">{profile?.allergies || "Ninguna"}</p>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
