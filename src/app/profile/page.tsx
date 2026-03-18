
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, Activity, Calendar, Ticket, MapPin, 
  Loader2, LogOut, Stethoscope, 
  Trash2, Edit3, Save, CreditCard, Mail, Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, useAuth } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Profile() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const db = useFirestore();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    province: '',
    bloodType: 'Pendiente',
    allergies: 'Ninguna reportada',
    address: '',
    idNumber: ''
  });

  // Guard de seguridad para evitar spinner infinito
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
  const { data: appointments, isLoading: isAppsLoading } = useCollection(
    useMemoFirebase(() => (db && user ? collection(db, 'users', user.uid, 'appointments') : null), [db, user])
  );

  useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
        province: profile.province || '',
        bloodType: profile.bloodType || 'Pendiente',
        allergies: profile.allergies || 'Ninguna reportada',
        address: profile.address || '',
        idNumber: profile.idNumber || ''
      });
    }
  }, [profile]);

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  const handleUpdateProfile = () => {
    if (!user || !profileRef) return;
    setDocumentNonBlocking(profileRef, { ...profileData, updatedAt: new Date().toISOString() }, { merge: true });
    setIsEditingProfile(false);
    toast({ title: "Perfil Actualizado", description: "Datos guardados en el expediente nacional." });
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

  // Prioridad: Firestore -> Auth Session
  const displayUser = profile?.username || user?.email?.split('@')[0] || "usuario";
  const displayEmail = profile?.email || user?.email || "No disponible";
  const displayId = profile?.idNumber || "Consultando registro...";
  const displayFullName = profile?.firstName ? `${profile.firstName} ${profile.lastName}` : (user?.displayName || "Expediente Digital");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-accent/5 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Perfil */}
            <Card className="lg:col-span-1 rounded-3xl overflow-hidden border-none shadow-xl h-fit">
              <CardHeader className="bg-primary text-white text-center py-10">
                <div className="mx-auto w-20 h-20 rounded-full border-4 border-white overflow-hidden mb-4 bg-white/20 flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-xl font-headline truncate px-2">{displayFullName}</CardTitle>
                <CardDescription className="text-white/80">@{displayUser}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Cédula de Identidad</p>
                      <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
                        <CreditCard className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-bold text-foreground">{displayId}</span>
                      </div>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Correo Electrónico</p>
                      <div className="flex items-center gap-2 px-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm text-foreground font-medium truncate">{displayEmail}</p>
                      </div>
                   </div>
                </div>
                <div className="pt-4 border-t space-y-2">
                  <Button variant="outline" className="w-full justify-start rounded-xl" onClick={() => setIsEditingProfile(true)}>
                    <Edit3 className="h-4 w-4 mr-2" /> Editar Expediente
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/5 rounded-xl" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contenido Principal */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="appointments" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-2xl p-1 h-14 mb-8 bg-white shadow-sm border">
                  <TabsTrigger value="appointments" className="rounded-xl font-bold flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Mis Citas
                  </TabsTrigger>
                  <TabsTrigger value="health" className="rounded-xl font-bold flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Mi Expediente
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="appointments">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold font-headline">Citas Programadas</h2>
                      <Button className="rounded-full shadow-md" onClick={() => router.push('/appointments')}>Nueva Cita</Button>
                    </div>

                    {isAppsLoading ? (
                      <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : appointments && appointments.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {appointments.map((app) => (
                          <Card key={app.id} className="rounded-3xl border-none shadow-lg overflow-hidden hover:scale-[1.02] transition-transform">
                            <div className="bg-secondary p-4 flex justify-between items-center text-white">
                               <Ticket className="h-5 w-5" />
                               <span className="text-xs font-mono font-bold bg-white/20 px-2 py-1 rounded">{app.voucherCode}</span>
                            </div>
                            <CardContent className="p-6 space-y-4">
                              <h3 className="font-bold text-lg text-primary truncate">{app.healthCenterName}</h3>
                              <p className="text-sm font-semibold flex items-center gap-2"><Stethoscope className="h-3 w-3" /> {app.specialty}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-2"><Calendar className="h-3 w-3" /> {new Date(app.appointmentDateTime).toLocaleDateString('es-CR')}</p>
                              <Button variant="ghost" className="w-full text-destructive text-xs h-9" onClick={() => deleteDocumentNonBlocking(doc(db!, 'users', user!.uid, 'appointments', app.id))}>Cancelar Cita</Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="rounded-3xl border-dashed border-2 p-20 text-center bg-white/50">
                         <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                         <p className="text-xl font-bold text-muted-foreground">No hay citas activas.</p>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="health">
                  <Card className="rounded-3xl border-none shadow-xl p-8 space-y-8 bg-white">
                    <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex items-center gap-6">
                        <Activity className="h-12 w-12 text-primary" />
                        <div>
                            <h3 className="font-bold text-xl">Información Clínica Nacional</h3>
                            <p className="text-sm text-muted-foreground">Vinculado a su cédula de identidad.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <Card className="p-6 rounded-2xl bg-muted/30 border-none shadow-sm">
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Grupo Sanguíneo</p>
                          <p className="text-3xl font-bold text-secondary">{profile?.bloodType || "Pendiente"}</p>
                       </Card>
                       <Card className="p-6 rounded-2xl bg-muted/30 border-none shadow-sm">
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Alergias</p>
                          <p className="text-lg font-bold">{profile?.allergies || "Ninguna reportada"}</p>
                       </Card>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Modal Edición */}
        <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
          <DialogContent className="max-w-xl rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Actualizar Expediente</DialogTitle>
              <DialogDescription>Modifica tus datos clínicos para agilizar la atención.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-2">
                <Label>Grupo Sanguíneo</Label>
                <Select value={profileData.bloodType} onValueChange={(val) => setProfileData({...profileData, bloodType: val})}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{BLOOD_TYPES.map(bt => <SelectItem key={bt} value={bt}>{bt}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Teléfono</Label><Input className="rounded-xl" value={profileData.phoneNumber} onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Alergias</Label><Input className="rounded-xl" value={profileData.allergies} onChange={(e) => setProfileData({...profileData, allergies: e.target.value})} /></div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" className="rounded-full" onClick={() => setIsEditingProfile(false)}>Cancelar</Button>
              <Button className="rounded-full px-8" onClick={handleUpdateProfile}><Save className="h-4 w-4 mr-2" /> Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}
