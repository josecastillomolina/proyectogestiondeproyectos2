"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, LogOut, Loader2, Mail, CreditCard, ShieldCheck, 
  Phone, Calendar, Printer, Hospital, Stethoscope, Clock, Edit3, Save, MapPin
} from 'lucide-react';
import { useUser, useDoc } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { useToast } from '@/hooks/use-toast';

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Profile() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const [localUser, setLocalUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    phoneNumber: '',
    bloodType: '',
    allergies: '',
    conditions: ''
  });

  const userDocRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [user?.uid]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    const activeEmail = localStorage.getItem('sesion_activa_email');
    
    if (activeEmail) {
      // Cargar perfil específico del usuario
      const savedProfile = localStorage.getItem(`perfil_${activeEmail}`);
      const savedCitas = localStorage.getItem(`citas_${activeEmail}`);
      
      if (savedProfile) {
        const parsedUser = JSON.parse(savedProfile);
        setLocalUser(parsedUser);
        setFormData({
          fullName: parsedUser.fullName || parsedUser.nombreCompleto || '',
          idNumber: parsedUser.idNumber || parsedUser.numeroIdentificacion || '',
          phoneNumber: parsedUser.phoneNumber || parsedUser.phone || parsedUser.telefono || '',
          bloodType: parsedUser.bloodType || '',
          allergies: parsedUser.allergies || '',
          conditions: parsedUser.conditions || ''
        });
      }

      if (savedCitas) {
        const parsedCitas = JSON.parse(savedCitas);
        const sorted = parsedCitas.sort((a: any, b: any) => new Date(a.appointmentDateTime || a.fecha).getTime() - new Date(b.appointmentDateTime || b.fecha).getTime());
        setAppointments(sorted);
      }
    } else if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (profileData) {
      setFormData(prev => ({
        ...prev,
        fullName: profileData.fullName || prev.fullName,
        idNumber: profileData.idNumber || prev.idNumber,
        phoneNumber: profileData.phoneNumber || prev.phoneNumber,
        bloodType: profileData.bloodType || prev.bloodType,
        allergies: profileData.allergies || prev.allergies,
        conditions: profileData.conditions || prev.conditions
      }));
    }
  }, [profileData]);

  const handleSignOut = async () => {
    if (auth) await signOut(auth);
    localStorage.removeItem('sesion_activa_email');
    setLocalUser(null);
    router.push('/');
  };

  const handleSaveChanges = async () => {
    const activeEmail = localStorage.getItem('sesion_activa_email');
    if (!activeEmail) return;

    try {
      const updatedLocal = { ...localUser, ...formData };
      localStorage.setItem(`perfil_${activeEmail}`, JSON.stringify(updatedLocal));
      setLocalUser(updatedLocal);

      if (db && user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), formData);
      }

      setIsEditing(false);
      toast({ title: "Expediente Actualizado", description: "Tus datos médicos han sido guardados correctamente." });
    } catch (error) {
      console.warn("Fallo guardado en Firebase, datos mantenidos localmente.");
      setIsEditing(false);
      toast({ title: "Guardado Local", description: "Datos actualizados en este dispositivo." });
    }
  };

  const handlePrintVoucher = (appointment: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const fechaFormat = new Date(appointment.appointmentDateTime || appointment.fecha).toLocaleDateString('es-CR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    const horaFormat = new Date(appointment.appointmentDateTime || appointment.fecha).toLocaleTimeString('es-CR', {
      hour: '2-digit', minute: '2-digit'
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Comprobante de Cita - AgendaCitas CR</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; text-align: center; }
            .confirmation { background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px solid #e2e8f0; }
            .code { font-family: monospace; font-size: 24px; font-weight: bold; color: #2563eb; }
            .section { margin-top: 30px; }
            .section-title { font-weight: bold; font-size: 14px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; margin-bottom: 10px; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 10px; }
            .item { font-size: 14px; margin-bottom: 8px; }
            .label { color: #64748b; font-size: 12px; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin:0; color:#2563eb;">AgendaCitas Nacional CR</h1>
            <p style="margin:5px 0 0;">Portal Oficial de Salud de Costa Rica</p>
          </div>
          <div class="confirmation">
            <div class="label">NÚMERO DE CONFIRMACIÓN</div>
            <div class="code">${appointment.voucherCode || appointment.numeroConfirmacion}</div>
          </div>
          <div class="section">
            <div class="section-title">Datos del Paciente</div>
            <div class="grid">
              <div class="item"><div class="label">Nombre Completo</div>${formData.fullName}</div>
              <div class="item"><div class="label">Cédula</div>${formData.idNumber}</div>
              <div class="item"><div class="label">Teléfono</div>${formData.phoneNumber}</div>
              <div class="item"><div class="label">Sangre</div>${formData.bloodType || 'N/A'}</div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">Detalles de la Cita</div>
            <div class="grid">
              <div class="item"><div class="label">Sede Médica</div>${appointment.centroSalud?.nombre || appointment.healthCenterName || appointment.hospital}</div>
              <div class="item"><div class="label">Especialidad</div>${appointment.specialty || appointment.especialidad}</div>
              <div class="item"><div class="label">Fecha</div>${fechaFormat}</div>
              <div class="item"><div class="label">Hora</div>${horaFormat}</div>
            </div>
            <div class="item" style="margin-top: 10px;">
              <div class="label">Dirección de la Sede</div>
              ${appointment.centroSalud?.direccion || 'Consulte en el portal nacional'}
            </div>
          </div>
          <div style="margin-top: 40px; border-top: 1px dashed #ccc; padding-top: 20px; font-size: 12px; text-align: center; color: #666;">
            Presentar este comprobante el día de la cita. Generado el: ${new Date().toLocaleDateString()}
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const displayData = {
    fullName: formData.fullName || user?.displayName || "Usuario CR",
    email: user?.email || localUser?.email || "Sin correo",
    idNumber: formData.idNumber || "Pendiente",
    username: profileData?.username || localUser?.username || "Cargando...",
    phone: formData.phoneNumber || "No registrado"
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
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <Card className="rounded-[35px] border-none shadow-xl overflow-hidden bg-white">
                <CardHeader className="bg-primary text-white text-center py-12">
                  <div className="mx-auto w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center mb-4 bg-white/10">
                    <User className="h-12 w-12" />
                  </div>
                  <CardTitle className="text-2xl font-headline truncate px-4">{displayData.fullName}</CardTitle>
                  <CardDescription className="text-white/80">Expediente Digital Activo</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-2xl">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Identificación</p>
                        <p className="font-bold text-sm">{displayData.idNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-2xl">
                      <Mail className="h-5 w-5 text-primary" />
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Correo</p>
                        <p className="text-sm font-medium truncate">{displayData.email}</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full rounded-full h-12 text-destructive border-destructive/20 font-bold" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-[35px] border-none shadow-xl p-10 bg-white">
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-dashed">
                  <h3 className="text-3xl font-bold font-headline">Detalles del Expediente</h3>
                  <Button variant={isEditing ? "default" : "outline"} className="rounded-full gap-2 font-bold" onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)}>
                    {isEditing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                    {isEditing ? "Guardar" : "Editar"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase">Nombre Completo</Label>
                      {isEditing ? <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="rounded-xl h-12" /> : <p className="font-bold text-lg">{displayData.fullName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase">Número de Cédula</Label>
                      {isEditing ? <Input value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} className="rounded-xl h-12" /> : <p className="font-bold text-lg">{displayData.idNumber}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase">Tipo de Sangre</Label>
                      {isEditing ? (
                        <Select value={formData.bloodType} onValueChange={val => setFormData({...formData, bloodType: val})}>
                          <SelectTrigger className="rounded-xl h-12">
                            <SelectValue placeholder="Elegir" />
                          </SelectTrigger>
                          <SelectContent>
                            {BLOOD_TYPES.map(bt => <SelectItem key={bt} value={bt}>{bt}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : <p className="font-bold text-lg">{formData.bloodType || 'No registrado'}</p>}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase">Teléfono</Label>
                      {isEditing ? <Input value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="rounded-xl h-12" /> : <p className="font-bold text-lg">{displayData.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase">Alergias</Label>
                      {isEditing ? <Input value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} className="rounded-xl h-12" /> : <p className="text-sm italic">{formData.allergies || 'Ninguna'}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase">Condiciones</Label>
                      {isEditing ? <Textarea value={formData.conditions} onChange={e => setFormData({...formData, conditions: e.target.value})} className="rounded-xl min-h-[80px]" /> : <p className="text-sm italic">{formData.conditions || 'Ninguna'}</p>}
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold font-headline flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" /> Historial de Citas Nacionales
                </h3>
                {appointments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appointments.map((cita) => (
                      <Card key={cita.id} className="rounded-3xl border-none shadow-md bg-white overflow-hidden">
                        <div className="p-6 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <Hospital className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Número Confirmación</p>
                              <p className="font-mono font-bold text-primary">{cita.voucherCode || cita.numeroConfirmacion}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold text-lg leading-tight">{cita.centroSalud?.nombre || cita.healthCenterName || cita.hospital}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {cita.centroSalud?.direccion || 'Sede Regional'}</p>
                          </div>
                          <p className="text-sm font-medium flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" /> {cita.specialty || cita.especialidad}</p>
                          <div className="flex gap-4 text-xs bg-muted/30 p-2 rounded-xl">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(cita.appointmentDateTime || cita.fecha).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(cita.appointmentDateTime || cita.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-[10px] font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full uppercase tracking-widest">{cita.status || cita.estado}</span>
                            <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-primary/5 hover:text-primary rounded-full" onClick={() => handlePrintVoucher(cita)}>
                              <Printer className="h-3 w-3" /> Imprimir Comprobante
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="rounded-[35px] border-2 border-dashed p-12 text-center bg-white">
                    <div className="bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/30">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <p className="text-muted-foreground mb-6 italic">No hay citas pendientes agendadas en tu expediente nacional.</p>
                    <Button className="rounded-full px-8 h-12 font-bold shadow-lg" onClick={() => router.push('/appointments')}>Agendar en Hospital →</Button>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
