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
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

const PROVINCES = ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"];
const SPECIALTIES = ["Medicina General", "Pediatría", "Ginecología", "Odontología", "Psicología", "Nutrición"];

const REASONS_BY_SPECIALTY: Record<string, { label: string, severity: 'high' | 'standard' }[]> = {
  "Medicina General": [
    { label: "Dolor de pecho / Emergencia potencial", severity: "high" },
    { label: "Dificultad severa para respirar", severity: "high" },
    { label: "Fiebre persistente o Malestar general", severity: "standard" },
    { label: "Control médico de rutina", severity: "standard" },
  ],
  "Pediatría": [
    { label: "Fiebre alta en lactante", severity: "high" },
    { label: "Control de crecimiento", severity: "standard" },
    { label: "Esquema de vacunación", severity: "standard" },
  ],
  "Ginecología": [
    { label: "Control prenatal", severity: "standard" },
    { label: "Cita ginecológica rutinaria", severity: "standard" },
  ],
  "Odontología": [
    { label: "Dolor de muela severo", severity: "high" },
    { label: "Limpieza y revisión", severity: "standard" },
  ],
  "Psicología": [
    { label: "Crisis emocional", severity: "high" },
    { label: "Seguimiento terapéutico", severity: "standard" },
  ],
  "Nutrición": [
    { label: "Control de peso", severity: "standard" },
    { label: "Educación nutricional", severity: "standard" },
  ],
};

const DOCTORS: Record<string, string[]> = {
  "Medicina General": ["Dr. Esteban Rodríguez", "Dra. María Alfaro"],
  "Pediatría": ["Dra. Lucía Méndez", "Dr. Pablo Soto"],
  "Ginecología": ["Dra. Silvia Castro"],
  "Odontología": ["Dr. Jorge Herrera"],
  "Psicología": ["Dra. Elena Vargas"],
  "Nutrición": ["Dra. Sofía Jiménez"]
};

const HEALTH_CENTERS = [
  { id: "h-mexico", name: "Hospital México", province: "San José", type: "Hospital Nacional" },
  { id: "h-calderon", name: "Hospital Calderón Guardia", province: "San José", type: "Hospital Nacional" },
  { id: "h-baltodano", name: "Hospital Enrique Baltodano", province: "Guanacaste", type: "Hospital Nacional" },
  { id: "h-max", name: "Hospital Max Peralta", province: "Cartago", type: "Hospital Nacional" },
  { id: "h-svpaul", name: "Hospital San Vicente de Paúl", province: "Heredia", type: "Hospital Nacional" },
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
    d.setDate(d.getDate() + (severity === 'high' ? 2 : 14));
    d.setHours(9, 0, 0, 0);
    return d;
  };

  const getRandomDoctor = (spec: string) => {
    const list = DOCTORS[spec] || ["Dr. General"];
    return list[Math.floor(Math.random() * list.length)];
  };

  const handleBooking = () => {
    const activeEmail = localStorage.getItem('sesion_activa_email');

    if (!activeEmail && !user) {
      toast({ title: "Acceso Requerido", description: "Inicia sesión para agendar tu cita." });
      router.push('/auth/login');
      return;
    }

    if (!province || !specialty || !selectedReason) {
      toast({ title: "Datos Incompletos", description: "Elige provincia, especialidad y motivo.", variant: "destructive" });
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
      reason: selectedReason.label,
      priority: selectedReason.severity === 'high' ? 'Alta' : 'Estándar'
    };

    // Guardar en Firestore si está disponible
    if (db && user?.uid) {
      const appointmentRef = doc(db, 'users', user.uid, 'appointments', appointmentId);
      setDocumentNonBlocking(appointmentRef, newAppointment, { merge: true });
    }

    // Guardar en LocalStorage AISLADO por usuario
    const emailKey = activeEmail || user?.email || 'guest';
    const existingCitas = JSON.parse(localStorage.getItem(`citas_${emailKey}`) || '[]');
    existingCitas.push(newAppointment);
    localStorage.setItem(`citas_${emailKey}`, JSON.stringify(existingCitas));
    
    setBookedAppointment(newAppointment);
    toast({ title: "Cita Confirmada", description: "Tu espacio ha sido reservado en la red nacional." });
    setIsBooking(false);
  };

  if (bookedAppointment) {
    return (
      <div className="flex flex-col min-h-screen bg-accent/5">
        <Navbar />
        <main className="flex-grow py-20 flex items-center justify-center px-4">
          <Card className="max-w-md w-full rounded-3xl shadow-2xl border-none overflow-hidden animate-in zoom-in-95">
            <CardHeader className="bg-primary text-white text-center py-8">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
              <CardTitle>¡Reserva Exitosa!</CardTitle>
              <CardDescription className="text-white/80">Código: {bookedAppointment.voucherCode}</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <div className="space-y-2 text-sm font-medium">
                <p className="flex items-center gap-2"><Hospital className="h-4 w-4 text-primary" /> {bookedAppointment.healthCenterName}</p>
                <p className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" /> {bookedAppointment.specialty}</p>
                <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {new Date(bookedAppointment.appointmentDateTime).toLocaleDateString()}</p>
                <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {new Date(bookedAppointment.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </CardContent>
            <CardFooter className="pb-8 px-8">
               <Button className="w-full rounded-full" onClick={() => router.push('/profile')}>Ir a Mi Expediente</Button>
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
            <h1 className="text-4xl font-extrabold font-headline">Agendamiento de Citas CR</h1>
            <p className="text-lg text-muted-foreground">Sistema de priorización automática nacional.</p>
          </div>

          <Card className="rounded-3xl shadow-xl border-none overflow-hidden bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Provincia</Label>
                    <Select onValueChange={setProvince}>
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Elegir provincia" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Stethoscope className="h-4 w-4" /> Especialidad</Label>
                    <Select onValueChange={setSpecialty}>
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Elegir especialidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Motivo</Label>
                    <Select onValueChange={(v) => setSelectedReason(availableReasons.find(r => r.label === v) || null)} disabled={!specialty}>
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Elegir motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableReasons.map(r => <SelectItem key={r.label} value={r.label}>{r.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="w-full h-14 rounded-full text-lg shadow-lg" onClick={handleBooking} disabled={isBooking || !province || !specialty || !selectedReason}>
                  {isBooking ? <Loader2 className="animate-spin" /> : "Confirmar Cita"}
                </Button>
              </div>

              <div className="bg-primary p-8 text-white flex flex-col justify-center space-y-6">
                <Hospital className="h-12 w-12" />
                <h3 className="text-2xl font-bold font-headline">Red Nacional</h3>
                {province ? (
                  <div className="space-y-4">
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                      <p className="text-xs uppercase opacity-70">Sede más cercana</p>
                      <p className="text-xl font-bold">{suggestedCenter.name}</p>
                    </div>
                  </div>
                ) : (
                  <p className="opacity-80 italic">Completa el formulario para encontrar disponibilidad en tu región.</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
