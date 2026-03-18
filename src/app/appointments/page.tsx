
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Calendar, MapPin, Stethoscope, Loader2, CheckCircle2, Hospital, User, Clock, AlertTriangle } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

const PROVINCES = ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"];
const SPECIALTIES = ["Medicina General", "Pediatría", "Ginecología", "Odontología", "Psicología", "Nutrición"];

const REASONS_BY_SPECIALTY: Record<string, { label: string, severity: 'high' | 'standard' }[]> = {
  "Medicina General": [
    { label: "Dolor de pecho / Emergencia potencial", severity: "high" },
    { label: "Dificultad severa para respirar", severity: "high" },
    { label: "Fiebre persistente o Malestar general", severity: "standard" },
    { label: "Tos leve o resfriado", severity: "standard" },
    { label: "Control médico de rutina / Chequeo", severity: "standard" },
    { label: "Renovación de recetas médicas", severity: "standard" },
  ],
  "Pediatría": [
    { label: "Fiebre alta en lactante", severity: "high" },
    { label: "Dificultad respiratoria (Pediatría)", severity: "high" },
    { label: "Control de crecimiento y desarrollo", severity: "standard" },
    { label: "Vacunación esquemas nacionales", severity: "standard" },
    { label: "Infección de oído o garganta", severity: "standard" },
  ],
  "Ginecología": [
    { label: "Dolor abdominal agudo / Hemorragia", severity: "high" },
    { label: "Control prenatal de alto riesgo", severity: "high" },
    { label: "Citología (Papanicolau) de rutina", severity: "standard" },
    { label: "Control prenatal mensual", severity: "standard" },
    { label: "Planificación familiar", severity: "standard" },
  ],
  "Odontología": [
    { label: "Absceso dental con inflamación facial", severity: "high" },
    { label: "Dolor de muela severo e insoportable", severity: "high" },
    { label: "Limpieza y profilaxis", severity: "standard" },
    { label: "Extracción programada", severity: "standard" },
    { label: "Calza o restauración dental", severity: "standard" },
  ],
  "Psicología": [
    { label: "Crisis de pánico / Ideación severa", severity: "high" },
    { label: "Ansiedad o estrés laboral/personal", severity: "standard" },
    { label: "Seguimiento terapéutico", severity: "standard" },
    { label: "Trastornos del sueño", severity: "standard" },
    { label: "Terapia de pareja o familiar", severity: "standard" },
  ],
  "Nutrición": [
    { label: "Desnutrición severa o anemia aguda", severity: "high" },
    { label: "Plan alimenticio para pérdida de peso", severity: "standard" },
    { label: "Control de diabetes o hipertensión", severity: "standard" },
    { label: "Educación nutricional", severity: "standard" },
    { label: "Alergias o intolerancias alimentarias", severity: "standard" },
  ],
};

const DOCTORS: Record<string, string[]> = {
  "Medicina General": ["Dr. Esteban Rodríguez", "Dra. María Alfaro", "Dr. Luis Chaves"],
  "Pediatría": ["Dra. Lucía Méndez", "Dr. Pablo Soto"],
  "Ginecología": ["Dra. Silvia Castro", "Dra. Patricia Mora"],
  "Odontología": ["Dr. Jorge Herrera", "Dra. Rebeca Salazar"],
  "Psicología": ["Dra. Elena Vargas", "Dr. Roberto Guillén"],
  "Nutrición": ["Dra. Sofía Jiménez", "Dr. Andrés Fallas"]
};

const HEALTH_CENTERS = [
  { id: "h-mexico", name: "Hospital México", province: "San José", type: "Hospital Nacional" },
  { id: "h-calderon", name: "Hospital Calderón Guardia", province: "San José", type: "Hospital Nacional" },
  { id: "h-baltodano", name: "Hospital Enrique Baltodano Briceño", province: "Guanacaste", type: "Hospital Nacional" },
  { id: "h-anexion", name: "Hospital La Anexión", province: "Guanacaste", type: "Hospital Nacional" },
  { id: "h-max", name: "Hospital Max Peralta Jiménez", province: "Cartago", type: "Hospital Nacional" },
  { id: "ebais-cartago", name: "EBAIS Cartago Oriente", province: "Cartago", type: "EBAIS" },
  { id: "ebais-curri", name: "EBAIS Curridabat Centro", province: "San José", type: "EBAIS" },
  { id: "ebais-ala", name: "EBAIS Alajuela Norte", province: "Alajuela", type: "EBAIS" },
  { id: "h-svpaul", name: "Hospital San Vicente de Paúl", province: "Heredia", type: "Hospital Nacional" },
  { id: "ebais-heredia", name: "EBAIS Heredia Centro", province: "Heredia", type: "EBAIS" },
  { id: "h-monseñor", name: "Hospital Monseñor Sanabria", province: "Puntarenas", type: "Hospital Nacional" }
];

export default function Appointments() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [province, setProvince] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [selectedReason, setSelectedReason] = useState<{ label: string, severity: 'high' | 'standard' } | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  const availableReasons = specialty ? REASONS_BY_SPECIALTY[specialty] || [] : [];

  useEffect(() => {
    setSelectedReason(null);
  }, [specialty]);

  const suggestedCenter = HEALTH_CENTERS.find(c => c.province === province) || HEALTH_CENTERS[0];
  
  const getSuggestedDate = (severity: string) => {
    const d = new Date();
    let daysToAdd;
    if (severity === 'high') {
      daysToAdd = Math.floor(Math.random() * 2) + 1;
    } else {
      daysToAdd = Math.floor(Math.random() * 5) + 12;
    }
    d.setDate(d.getDate() + daysToAdd);
    const hour = Math.floor(Math.random() * 8) + 8;
    const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    d.setHours(hour, minutes, 0, 0);
    return d;
  };

  const getRandomDoctor = (spec: string) => {
    const list = DOCTORS[spec] || ["Médico de Guardia"];
    return list[Math.floor(Math.random() * list.length)];
  };

  const handleBooking = () => {
    if (!user && !localStorage.getItem('sesion_activa')) {
      toast({ title: "Acceso Requerido", description: "Inicia sesión para agendar tu cita nacional." });
      router.push('/auth/login');
      return;
    }

    if (!province || !specialty || !selectedReason) {
      toast({ title: "Datos Incompletos", description: "Por favor elige provincia, especialidad y motivo.", variant: "destructive" });
      return;
    }

    setIsBooking(true);
    const appointmentDate = getSuggestedDate(selectedReason.severity);
    const appointmentId = Date.now().toString();
    const voucherCode = `AC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const doctorName = getRandomDoctor(specialty);

    const newAppointment = {
      id: appointmentId,
      userId: user?.uid || 'local-user',
      healthCenterId: suggestedCenter.id,
      healthCenterName: suggestedCenter.name,
      specialty: specialty,
      doctorName: doctorName,
      appointmentDateTime: appointmentDate.toISOString(),
      status: "Confirmada",
      voucherCode: voucherCode,
      createdAt: new Date().toISOString(),
      province: province,
      reason: selectedReason.label,
      priority: selectedReason.severity === 'high' ? 'Alta' : 'Estándar'
    };

    // Guardar en Firestore (Si disponible)
    if (db && user?.uid) {
      const appointmentRef = doc(db, 'users', user.uid, 'appointments', appointmentId);
      setDocumentNonBlocking(appointmentRef, newAppointment, { merge: true });
    }

    // Guardar en LocalStorage (SÍ O SÍ)
    const existingCitas = JSON.parse(localStorage.getItem('citas_agendadas') || '[]');
    existingCitas.push(newAppointment);
    localStorage.setItem('citas_agendadas', JSON.stringify(existingCitas));
    
    setBookedAppointment(newAppointment);
    toast({ title: "Cita Agendada SÍ O SÍ", description: "Tu espacio ha sido reservado y guardado en tu expediente local." });
    setIsBooking(false);
  };

  if (bookedAppointment) {
    return (
      <div className="flex flex-col min-h-screen bg-accent/5">
        <Navbar />
        <main className="flex-grow py-20 flex items-center justify-center px-4">
          <Card className="max-w-md w-full rounded-3xl shadow-2xl border-none overflow-hidden animate-in zoom-in-95 duration-300">
            <CardHeader className="bg-primary text-white text-center py-8">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
              <CardTitle className="text-2xl font-headline">¡Reserva Exitosa!</CardTitle>
              <CardDescription className="text-white/80">Cita agendada con prioridad {bookedAppointment.priority}</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="bg-muted/50 p-6 rounded-2xl border-2 border-dashed border-muted-foreground/20 space-y-4">
                 <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Código Voucher</span>
                    <span className="font-mono font-bold text-primary text-lg">{bookedAppointment.voucherCode}</span>
                 </div>
                 <div className="space-y-3">
                    <p className="flex items-center gap-3 text-sm font-medium"><Hospital className="h-4 w-4 text-primary" /> {bookedAppointment.healthCenterName}</p>
                    <p className="flex items-center gap-3 text-sm font-medium"><Stethoscope className="h-4 w-4 text-primary" /> {bookedAppointment.specialty}</p>
                    <p className="flex items-center gap-3 text-sm font-medium"><User className="h-4 w-4 text-primary" /> {bookedAppointment.doctorName}</p>
                    <p className="flex items-center gap-3 text-sm font-medium"><Calendar className="h-4 w-4 text-primary" /> {new Date(bookedAppointment.appointmentDateTime).toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    <p className="flex items-center gap-3 text-sm font-medium"><Clock className="h-4 w-4 text-primary" /> {new Date(bookedAppointment.appointmentDateTime).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}</p>
                 </div>
              </div>
              <p className="text-xs text-center text-muted-foreground italic leading-relaxed">Presenta tu identificación en la recepción de la sede 15 minutos antes.</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pb-8 px-8">
               <Button className="w-full rounded-full h-12 shadow-lg shadow-primary/20" onClick={() => router.push('/profile')}>Ver en Mi Expediente</Button>
               <Button variant="ghost" className="w-full rounded-full" onClick={() => setBookedAppointment(null)}>Agendar Otra Cita</Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-accent/5 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-extrabold font-headline text-foreground tracking-tight">Agendamiento de Citas CR</h1>
            <p className="text-lg text-muted-foreground">Priorización automática según necesidad médica en la red nacional.</p>
          </div>

          <Card className="rounded-3xl shadow-xl border-none overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 space-y-6 bg-white">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Ubicación (Provincia)
                    </label>
                    <Select onValueChange={setProvince}>
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Elige donde vives" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" /> Especialidad Requerida
                    </label>
                    <Select onValueChange={setSpecialty}>
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Elige especialidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Motivo de Consulta
                    </label>
                    <Select 
                      onValueChange={(val) => {
                        const reason = availableReasons.find(r => r.label === val);
                        if (reason) setSelectedReason(reason);
                      }}
                      disabled={!specialty}
                      key={specialty}
                    >
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder={specialty ? "Elige el motivo" : "Elige primero la especialidad"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableReasons.map(r => <SelectItem key={r.label} value={r.label}>{r.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl space-y-2 min-h-[80px] flex flex-col justify-center">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nota de Agendamiento</p>
                   {selectedReason?.severity === 'high' ? (
                     <p className="text-sm text-destructive font-bold flex items-center gap-2 animate-in fade-in duration-300">
                        <AlertTriangle className="h-4 w-4" /> Prioridad Alta: Cita para esta semana.
                     </p>
                   ) : selectedReason?.severity === 'standard' ? (
                     <p className="text-sm text-secondary font-bold flex items-center gap-2 animate-in fade-in duration-300">
                        <Clock className="h-4 w-4" /> Prioridad Estándar: Cita en ~2 semanas.
                     </p>
                   ) : (
                     <p className="text-sm text-muted-foreground italic">Selecciona especialidad y motivo para ver disponibilidad.</p>
                   )}
                </div>

                <Button 
                  className="w-full h-14 text-lg rounded-full shadow-lg shadow-primary/20" 
                  onClick={handleBooking}
                  disabled={isBooking || !province || !specialty || !selectedReason}
                >
                  {isBooking ? <Loader2 className="animate-spin h-5 w-5" /> : "Agendar Ahora"}
                </Button>
              </div>

              <div className="bg-primary p-8 text-white flex flex-col justify-center space-y-6">
                <div className="flex items-center gap-3">
                   <Hospital className="h-8 w-8 text-white/80" />
                   <h3 className="text-2xl font-bold font-headline">Red de Salud CR</h3>
                </div>
                {province ? (
                  <div className="space-y-4 animate-in slide-in-from-right duration-300">
                    <div className="bg-white/10 p-5 rounded-2xl border border-white/20">
                      <p className="text-[10px] uppercase font-bold opacity-70 mb-2 tracking-widest">Sede Sugerida</p>
                      <p className="text-xl font-bold">{suggestedCenter.name}</p>
                      <p className="text-sm opacity-90">{suggestedCenter.type}</p>
                    </div>
                    <div className="bg-white/10 p-5 rounded-2xl border border-white/20">
                      <p className="text-[10px] uppercase font-bold opacity-70 mb-2 tracking-widest">Garantía de Tiempo</p>
                      <p className="text-xl font-bold">
                        {selectedReason?.severity === 'high' ? "Atención Prioritaria" : "Atención Programada"}
                      </p>
                      <p className="text-sm opacity-90">Basado en la urgencia reportada para {province}.</p>
                    </div>
                  </div>
                ) : (
                  <p className="opacity-80 italic leading-relaxed">Selecciona tus datos para encontrar el espacio médico más eficiente en la red nacional.</p>
                )}
                <div className="pt-6 border-t border-white/20">
                   <p className="text-[10px] opacity-70 italic leading-tight">
                     * El sistema optimiza las agendas nacionales para dar respuesta inmediata a casos urgentes según disponibilidad técnica.
                   </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
