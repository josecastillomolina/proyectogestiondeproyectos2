
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
  User, Activity, ShieldAlert, Calendar, Ticket, MapPin, 
  Hospital, Loader2, LogOut, Printer, Clock, Stethoscope, 
  Trash2, Edit3, Save, Phone, Info, CheckCircle2, ChevronRight, AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, useAuth } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const CANTONS_BY_PROVINCE: Record<string, string[]> = {
  "San José": ["San José", "Escazú", "Desamparados", "Puriscal", "Tarrazú", "Aserrí", "Mora", "Goicoechea", "Santa Ana", "Alajuelita", "Vázquez de Coronado", "Acosta", "Tibás", "Moravia", "Montes de Oca", "Turrubares", "Dota", "Curridabat", "Pérez Zeledón", "León Cortés Castro"],
  "Alajuela": ["Alajuela", "San Ramón", "Grecia", "San Mateo", "Atenas", "Naranjo", "Palmares", "Poás", "Orotina", "San Carlos", "Zarcero", "Sarchí", "Upala", "Los Chiles", "Guatuso", "Río Cuarto"],
  "Cartago": ["Cartago", "Paraíso", "La Unión", "Jiménez", "Turrialba", "Alvarado", "Oreamuno", "El Guarco"],
  "Heredia": ["Heredia", "Barva", "Santo Domingo", "Santa Bárbara", "San Rafael", "San Isidro", "Belén", "Flores", "San Pablo", "Sarapiquí"],
  "Guanacaste": ["Liberia", "Nicoya", "Santa Cruz", "Bagaces", "Cañas", "Abangares", "Tilarán", "Nandayure", "La Cruz", "Hojancha"],
  "Puntarenas": ["Puntarenas", "Esparza", "Buenos Aires", "Montes de Oro", "Osa", "Quepos", "Golfito", "Coto Brus", "Parrita", "Corredores", "Garabito", "Monteverde", "Puerto Jiménez"],
  "Limón": ["Limón", "Pococí", "Siquirres", "Talamanca", "Matina", "Guácimo"]
};

const PROVINCES = Object.keys(CANTONS_BY_PROVINCE);
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Profile() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const db = useFirestore();

  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    province: '',
    canton: '',
    bloodType: '',
    allergies: '',
    address: ''
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isUserLoading, router]);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const appointmentsRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'appointments');
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);
  const { data: appointments, isLoading: isAppsLoading } = useCollection(appointmentsRef);

  useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
        province: profile.province || '',
        canton: profile.canton || '',
        bloodType: profile.bloodType || '',
        allergies: profile.allergies || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleUpdateProfile = () => {
    if (!user || !profileRef) return;
    
    setDocumentNonBlocking(profileRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    setIsEditingProfile(false);
    toast({
      title: "Perfil Actualizado",
      description: "Tus datos médicos y personales se han guardado con éxito."
    });
  };

  const handleDeleteAppointment = (appId: string) => {
    if (!user) return;
    const appDocRef = doc(db, 'users', user.uid, 'appointments', appId);
    deleteDocumentNonBlocking(appDocRef);
    toast({
      title: "Cita Cancelada",
      description: "La cita ha sido eliminada de tu registro.",
      variant: "destructive"
    });
  };

  if (isUserLoading || isProfileLoading) {
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

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-accent/5 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* User Sidebar */}
            <Card className="lg:col-span-1 rounded-3xl overflow-hidden border-none shadow-xl h-fit">
              <CardHeader className="bg-primary text-white text-center py-10">
                <div className="mx-auto w-20 h-20 rounded-full border-4 border-white overflow-hidden mb-4 bg-white/20 flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-xl font-headline">{profile?.firstName} {profile?.lastName}</CardTitle>
                <CardDescription className="text-white/80">@{profile?.username || "usuario"}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Email</p>
                      <p className="text-sm text-foreground font-medium truncate">{profile?.email}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Residencia</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3 w-3" /> 
                        {profile?.province ? `${profile.province}${profile.canton ? `, ${profile.canton}` : ''}` : "No definida"}
                      </p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Contacto</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone className="h-3 w-3" /> {profile?.phoneNumber || "Sin teléfono"}</p>
                   </div>
                </div>
                <div className="pt-4 border-t space-y-2">
                  <Button variant="outline" className="w-full justify-start rounded-xl" onClick={() => setIsEditingProfile(true)}>
                    <Edit3 className="h-4 w-4 mr-2" /> Editar Datos
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 rounded-xl" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="appointments" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-2xl p-1 h-14 mb-8 bg-white shadow-sm border">
                  <TabsTrigger value="appointments" className="rounded-xl font-bold flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Mis Citas
                  </TabsTrigger>
                  <TabsTrigger value="health" className="rounded-xl font-bold flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Salud & Expediente
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="appointments">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold font-headline">Historial de Citas</h2>
                      <Button className="rounded-full px-6" onClick={() => router.push('/appointments')}>Agendar Nueva</Button>
                    </div>

                    {isAppsLoading ? (
                      <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : appointments && appointments.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {appointments.map((app) => (
                          <Card key={app.id} className="rounded-3xl border-none shadow-lg overflow-hidden group hover:scale-[1.02] transition-transform">
                            <div className="bg-secondary p-4 flex justify-between items-center text-white">
                               <div className="flex items-center gap-2">
                                  <Ticket className="h-5 w-5" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider">Comprobante Digital</span>
                               </div>
                               <span className="text-xs font-mono font-bold">{app.voucherCode}</span>
                            </div>
                            <CardContent className="p-6 space-y-4">
                              <div className="space-y-2">
                                <h3 className="font-bold text-lg text-primary leading-tight truncate">{app.healthCenterName}</h3>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold flex items-center gap-2"><Stethoscope className="h-3 w-3" /> {app.specialty}</p>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${app.priority === 'Alta' ? 'bg-destructive/10 text-destructive' : 'bg-secondary/10 text-secondary'}`}>
                                    {app.priority === 'Alta' ? 'Urgente' : 'Programada'}
                                  </span>
                                </div>
                                {app.doctorName && (
                                   <p className="text-xs text-muted-foreground flex items-center gap-2"><User className="h-3 w-3" /> {app.doctorName}</p>
                                )}
                              </div>
                              <div className="bg-accent/30 p-4 rounded-2xl space-y-2 text-sm">
                                <p className="flex items-center gap-3"><Calendar className="h-4 w-4 text-secondary" /> {new Date(app.appointmentDateTime).toLocaleDateString('es-CR', { dateStyle: 'long' })}</p>
                                <p className="flex items-center gap-3"><Clock className="h-4 w-4 text-secondary" /> {new Date(app.appointmentDateTime).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  className="flex-1 rounded-xl group-hover:bg-secondary group-hover:text-white transition-colors"
                                  onClick={() => setSelectedApp(app)}
                                >
                                  Ver Comprobante
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="rounded-xl text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteAppointment(app.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="rounded-3xl border-dashed border-2 p-20 text-center space-y-4">
                         <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                         <div className="space-y-2">
                            <p className="text-xl font-bold text-muted-foreground">No tienes citas agendadas</p>
                            <p className="text-sm text-muted-foreground">Tus citas y comprobantes aparecerán aquí una vez que agendes.</p>
                         </div>
                         <Button onClick={() => router.push('/appointments')} className="rounded-full">Agendar mi primera cita</Button>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="health">
                  <Card className="rounded-3xl border-none shadow-xl p-8 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 bg-primary/5 p-6 rounded-3xl border border-primary/10 flex-grow mr-4">
                        <Activity className="h-12 w-12 text-primary" />
                        <div>
                            <h3 className="font-bold text-xl">Expediente Médico</h3>
                            <p className="text-sm text-muted-foreground">Información vital sincronizada con la red nacional.</p>
                        </div>
                      </div>
                      <Button variant="outline" className="rounded-full" onClick={() => setIsEditingProfile(true)}>
                        <Edit3 className="h-4 w-4 mr-2" /> Actualizar
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                       <Card className="p-6 rounded-2xl bg-muted/30 border-none shadow-sm space-y-3">
                          <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                             <Activity className="h-4 w-4 text-primary" /> Grupo Sanguíneo
                          </p>
                          <p className="text-3xl font-bold text-secondary">{profile?.bloodType || "Pendiente"}</p>
                       </Card>
                       <Card className="p-6 rounded-2xl bg-muted/30 border-none shadow-sm space-y-3">
                          <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                             <ShieldAlert className="h-4 w-4 text-destructive" /> Alergias Conocidas
                          </p>
                          <p className="text-lg font-bold text-foreground">{profile?.allergies || "Ninguna reportada"}</p>
                       </Card>
                    </div>

                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex gap-4">
                       <Info className="h-6 w-6 text-blue-500 shrink-0" />
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-blue-700">Resumen de Dirección</p>
                          <p className="text-xs text-blue-600 leading-relaxed">
                            {profile?.province ? `${profile.province}, ${profile.canton || ''}. ` : ''}
                            {profile?.address || "Dirección exacta no especificada"}
                          </p>
                       </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
          <DialogContent className="max-w-xl rounded-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold font-headline">Actualizar Expediente</DialogTitle>
              <DialogDescription>Completa tu información médica y personal para agilizar tus citas.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="bloodType">Grupo Sanguíneo</Label>
                <Select 
                  value={profileData.bloodType} 
                  onValueChange={(val) => setProfileData({...profileData, bloodType: val})}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map(bt => <SelectItem key={bt} value={bt}>{bt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Teléfono</Label>
                <Input 
                  id="phoneNumber" 
                  className="rounded-xl" 
                  placeholder="8888-8888" 
                  value={profileData.phoneNumber}
                  onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Provincia</Label>
                <Select 
                  value={profileData.province} 
                  onValueChange={(val) => setProfileData({...profileData, province: val, canton: ''})}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Provincia" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="canton">Cantón</Label>
                <Select 
                  value={profileData.canton} 
                  onValueChange={(val) => setProfileData({...profileData, canton: val})}
                  disabled={!profileData.province}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={profileData.province ? "Selecciona cantón" : "Primero elige provincia"} />
                  </SelectTrigger>
                  <SelectContent>
                    {profileData.province && CANTONS_BY_PROVINCE[profileData.province]?.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="allergies">Alergias Conocidas</Label>
                <Input 
                  id="allergies" 
                  className="rounded-xl" 
                  placeholder="Ej: Penicilina, Nueces, etc." 
                  value={profileData.allergies}
                  onChange={(e) => setProfileData({...profileData, allergies: e.target.value})}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Dirección Exacta</Label>
                <Input 
                  id="address" 
                  className="rounded-xl" 
                  placeholder="Distrito, barrio, señas exactas..." 
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" className="rounded-full" onClick={() => setIsEditingProfile(false)}>Cancelar</Button>
              <Button className="rounded-full px-8" onClick={handleUpdateProfile}>
                <Save className="h-4 w-4 mr-2" /> Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Digital Voucher Modal */}
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
            {selectedApp && (
              <div className="print:block">
                <div className="bg-primary p-6 text-white text-center space-y-2">
                  <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Hospital className="h-8 w-8" />
                  </div>
                  <DialogTitle className="text-xl font-bold">Comprobante de Cita</DialogTitle>
                  <DialogDescription className="text-white/80">AgendaCitas Nacional CR</DialogDescription>
                </div>
                
                <div className="p-8 space-y-8 relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-12">
                    <Hospital className="w-64 h-64" />
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-start border-b pb-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Paciente</p>
                        <p className="font-bold text-lg">{profile?.firstName} {profile?.lastName}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Voucher ID</p>
                        <p className="font-mono font-bold text-primary">{selectedApp.voucherCode}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Fecha Asignada</p>
                        <p className="text-sm font-semibold flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-primary" />
                          {new Date(selectedApp.appointmentDateTime).toLocaleDateString('es-CR')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Hora</p>
                        <p className="text-sm font-semibold flex items-center gap-2">
                          <Clock className="h-3 w-3 text-primary" />
                          {new Date(selectedApp.appointmentDateTime).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="bg-accent/10 p-4 rounded-2xl border border-primary/20 space-y-3">
                       <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Prioridad de Atención</p>
                          <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase ${selectedApp.priority === 'Alta' ? 'bg-destructive text-white shadow-sm' : 'bg-primary text-white shadow-sm'}`}>
                             {selectedApp.priority === 'Alta' ? 'Prioritaria' : 'Programada'}
                          </span>
                       </div>
                       
                       <div className="flex items-center gap-3">
                          <Hospital className="h-5 w-5 text-secondary" />
                          <div>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase">Centro Médico</p>
                             <p className="font-bold text-secondary">{selectedApp.healthCenterName}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-secondary" />
                          <div>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase">Médico Tratante</p>
                             <p className="font-bold">{selectedApp.doctorName || "Asignación en Sede"}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <Stethoscope className="h-5 w-5 text-secondary" />
                          <div>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase">Especialidad</p>
                             <p className="font-bold">{selectedApp.specialty}</p>
                          </div>
                       </div>
                    </div>

                    <div className="bg-muted p-4 rounded-xl space-y-2 border border-dashed">
                      <div className="flex items-center gap-2 text-primary">
                         <AlertTriangle className="h-3 w-3" />
                         <p className="text-[10px] font-bold uppercase tracking-wider">Nota Importante</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                        {selectedApp.priority === 'Alta' 
                          ? "Esta cita ha sido clasificada como URGENTE basándose en los síntomas reportados. Por favor asista puntualmente."
                          : "Esta es una cita programada para seguimiento regular. Si sus síntomas empeoran, acuda a emergencias."}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 no-print">
                    <Button className="flex-1 rounded-full h-12 shadow-md" onClick={handlePrint}>
                      <Printer className="h-4 w-4 mr-2" /> Imprimir / PDF
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-full h-12" onClick={() => setSelectedApp(null)}>
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}
