
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
  Phone, UserCheck, Flag, CheckCircle2, Calendar, 
  Printer, Hospital, Stethoscope, Clock, AlertCircle, Edit3, Save
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

  // Estados para campos editables
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
    const savedUser = localStorage.getItem('usuario_registrado');
    const savedCitas = localStorage.getItem('citas_agendadas');
    const session = localStorage.getItem('sesion_activa');
    
    if (savedUser && session === 'true') {
      const parsedUser = JSON.parse(savedUser);
      setLocalUser(parsedUser);
      setFormData({
        fullName: parsedUser.fullName || parsedUser.nombreCompleto || '',
        idNumber: parsedUser.idNumber || parsedUser.numeroIdentificacion || '',
        phoneNumber: parsedUser.phoneNumber || parsedUser.phone || parsedUser.telefono || '',
        bloodType: parsedUser.bloodType || '',
        allergies: parsedUser.allergies || '',
        conditions: parsedUser.conditions || ''
      });
    } else if (!isUserLoading && !user) {
      router.push('/auth/login');
    }

    if (savedCitas) {
      const parsedCitas = JSON.parse(savedCitas);
      // Ordenar por fecha (más próxima primero)
      const sorted = parsedCitas.sort((a: any, b: any) => new Date(a.appointmentDateTime || a.fecha).getTime() - new Date(b.appointmentDateTime || b.fecha).getTime());
      setAppointments(sorted);
    }
  }, [user, isUserLoading, router]);

  // Actualizar formData cuando lleguen datos de Firebase
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
    localStorage.removeItem('sesion_activa');
    setLocalUser(null);
    router.push('/');
  };

  const handleSaveChanges = async () => {
    try {
      // Guardar en LocalStorage
      const updatedLocal = { ...localUser, ...formData };
      localStorage.setItem('usuario_registrado', JSON.stringify(updatedLocal));
      setLocalUser(updatedLocal);

      // Intentar guardar en Firebase si está disponible
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
            body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.6; padding: 40px; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #2563eb; margin: 0; font-size: 24px; }
            .header p { margin: 5px 0 0; font-weight: bold; }
            .section { margin-bottom: 25px; }
            .section-title { font-weight: bold; text-transform: uppercase; font-size: 12px; color: #666; border-bottom: 1px solid #eee; margin-bottom: 10px; padding-bottom: 5px; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; }
            .item { margin-bottom: 10px; }
            .label { font-size: 11px; color: #888; display: block; }
            .value { font-weight: 600; font-size: 14px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; border-top: 1px dashed #ccc; pt: 20px; }
            .confirmation { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #e2e8f0; }
            .confirmation-code { font-family: monospace; font-size: 20px; font-weight: bold; color: #2563eb; letter-spacing: 2px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>AgendaCitas Nacional CR</h1>
            <p>Portal Oficial de Salud de Costa Rica</p>
          </div>

          <div class="confirmation">
            <span class="label">NÚMERO DE CONFIRMACIÓN</span>
            <div class="confirmation-code">${appointment.voucherCode || appointment.numeroConfirmacion}</div>
          </div>

          <div class="section">
            <div class="section-title">Datos del Paciente</div>
            <div class="grid">
              <div class="item"><span class="label">Nombre Completo</span><span class="value">${formData.fullName}</span></div>
              <div class="item"><span class="label">Cédula / DIMEX</span><span class="value">${formData.idNumber}</span></div>
              <div class="item"><span class="label">Tipo de Sangre</span><span class="value">${formData.bloodType || 'No especificado'}</span></div>
              <div class="item"><span class="label">Teléfono</span><span class="value">${formData.phoneNumber}</span></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Detalles de la Cita</div>
            <div class="grid">
              <div class="item"><span class="label">Sede Médica</span><span class="value">${appointment.healthCenterName || appointment.hospital}</span></div>
              <div class="item"><span class="label">Especialidad</span><span class="value">${appointment.specialty || appointment.especialidad}</span></div>
              <div class="item"><span class="label">Fecha</span><span class="value">${fechaFormat}</span></div>
              <div class="item"><span class="label">Hora</span><span class="value">${horaFormat}</span></div>
              <div class="item"><span class="label">Estado</span><span class="value">${appointment.status || appointment.estado}</span></div>
            </div>
          </div>

          <div class="footer">
            <p>Por favor, presente este comprobante y su identificación 15 minutos antes de su cita.</p>
            <p>Generado el: ${new Date().toLocaleString()}</p>
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
    username: profileData?.username || localUser?.username || localUser?.nombreUsuario || "Cargando...",
    phone: formData.phoneNumber || "No registrado",
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
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sidebar de Usuario */}
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
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cédula / Identidad</p>
                        <p className="font-bold text-sm">{displayData.idNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-2xl">
                      <Mail className="h-5 w-5 text-primary" />
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Correo Principal</p>
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
                    <p className="font-bold">Privacidad Garantizada</p>
                  </div>
                  <p className="text-xs opacity-90 leading-relaxed">Tus datos médicos se almacenan de forma segura bajo estándares de salud nacional.</p>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                   <ShieldCheck className="h-24 w-24" />
                </div>
              </div>
            </div>

            {/* Contenido Principal */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Tarjeta de Detalles del Expediente */}
              <Card className="rounded-[35px] border-none shadow-xl p-10 bg-white">
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-dashed">
                  <div>
                    <h3 className="text-3xl font-bold font-headline text-foreground">Detalles del Expediente</h3>
                    <p className="text-muted-foreground text-sm mt-1">Información oficial y parámetros médicos</p>
                  </div>
                  <Button 
                    variant={isEditing ? "default" : "outline"} 
                    className="rounded-full gap-2 font-bold"
                    onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)}
                  >
                    {isEditing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                    {isEditing ? "Guardar Cambios" : "Editar Datos"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nombre Completo</Label>
                      {isEditing ? (
                        <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="rounded-xl h-12 bg-muted/30" />
                      ) : (
                        <p className="font-bold text-lg">{displayData.fullName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nombre de Usuario</Label>
                      <p className="font-bold text-lg">{displayData.username}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Número de Cédula</Label>
                      {isEditing ? (
                        <Input value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} className="rounded-xl h-12 bg-muted/30" />
                      ) : (
                        <p className="font-bold text-lg">{displayData.idNumber}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tipo de Sangre</Label>
                      {isEditing ? (
                        <Select value={formData.bloodType} onValueChange={val => setFormData({...formData, bloodType: val})}>
                          <SelectTrigger className="rounded-xl h-12 bg-muted/30">
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            {BLOOD_TYPES.map(bt => <SelectItem key={bt} value={bt}>{bt}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-bold text-lg">{formData.bloodType || 'No especificado'}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Teléfono de Contacto</Label>
                      {isEditing ? (
                        <Input value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="rounded-xl h-12 bg-muted/30" />
                      ) : (
                        <p className="font-bold text-lg">{displayData.phone}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Alergias Conocidas</Label>
                      {isEditing ? (
                        <Input value={formData.allergies} placeholder="Ej: Penicilina, Nueces..." onChange={e => setFormData({...formData, allergies: e.target.value})} className="rounded-xl h-12 bg-muted/30" />
                      ) : (
                        <p className="text-sm font-medium text-muted-foreground bg-muted/30 p-3 rounded-xl border italic min-h-[40px]">{formData.allergies || 'Ninguna reportada'}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Condiciones Médicas</Label>
                      {isEditing ? (
                        <Textarea value={formData.conditions} placeholder="Ej: Diabetes, Hipertensión..." onChange={e => setFormData({...formData, conditions: e.target.value})} className="rounded-xl bg-muted/30 resize-none min-h-[80px]" />
                      ) : (
                        <p className="text-sm font-medium text-muted-foreground bg-muted/30 p-3 rounded-xl border italic min-h-[80px]">{formData.conditions || 'Ninguna reportada'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Sección de Citas Agendadas */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold font-headline px-2 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" /> Citas del Historial
                </h3>
                
                {appointments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appointments.map((cita) => (
                      <Card key={cita.id} className="rounded-3xl border-none shadow-md overflow-hidden bg-white hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="p-6 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                              <Hospital className="h-6 w-6" />
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Voucher</p>
                              <p className="font-mono font-bold text-primary">{cita.voucherCode || cita.numeroConfirmacion}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-bold text-lg leading-tight">{cita.healthCenterName || cita.hospital}</h4>
                            <p className="text-sm font-bold text-muted-foreground flex items-center gap-2"><Stethoscope className="h-4 w-4" /> {cita.specialty || cita.especialidad}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs font-medium bg-muted/30 p-3 rounded-xl">
                            <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-primary" /> {new Date(cita.appointmentDateTime || cita.fecha).toLocaleDateString()}</div>
                            <div className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-primary" /> {new Date(cita.appointmentDateTime || cita.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${cita.status === 'Confirmada' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {cita.status || cita.estado}
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-full text-xs font-bold gap-2 hover:bg-primary/5" onClick={() => handlePrintVoucher(cita)}>
                              <Printer className="h-3 w-3" /> Imprimir
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="rounded-[35px] border-2 border-dashed border-muted p-12 text-center bg-white">
                    <Calendar className="h-16 w-16 text-muted/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium italic mb-6">No hay citas pendientes agendadas en el sistema.</p>
                    <Button className="rounded-full px-8 h-12 shadow-lg shadow-primary/20" onClick={() => router.push('/appointments')}>
                      Agendar en Hospital →
                    </Button>
                  </Card>
                )}
              </div>

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
