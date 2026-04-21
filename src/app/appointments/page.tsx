
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Stethoscope, Loader2, CheckCircle2, Hospital, User, Clock, AlertTriangle, Phone, Activity, FileText, AlertCircle } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { CENTROS_SALUD, CentroSalud } from '@/data/centrosSalud';
import { cn } from '@/lib/utils';

const PROVINCES = ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"];
const SPECIALTIES = ["Medicina General", "Pediatría", "Ginecología", "Odontología", "Psicología", "Nutrición"];

const CHRONIC_DISEASES = [
  "Diabetes Tipo 1",
  "Diabetes Tipo 2",
  "Hipertensión Arterial",
  "Insuficiencia Renal Crónica",
  "Enfermedad Pulmonar Obstructiva (EPOC)",
  "Asma Crónica",
  "Insuficiencia Cardíaca",
  "Artritis Reumatoide",
  "Lupus Eritematoso",
  "Hipotiroidismo / Hipertiroidismo",
  "Epilepsia",
  "Ninguna"
];

const SYMPTOMS_BY_DISEASE: Record<string, string[]> = {
  "Diabetes Tipo 1": ["Glucosa en ayunas > 200 mg/dL", "Sed excesiva y orina frecuente", "Visión borrosa", "Heridas que no cicatrizan", "Entumecimiento en manos o pies"],
  "Diabetes Tipo 2": ["Glucosa en ayunas > 200 mg/dL", "Sed excesiva y orina frecuente", "Visión borrosa", "Heridas que no cicatrizan", "Entumecimiento en manos o pies"],
  "Hipertensión Arterial": ["Presión > 160/100 mmHg", "Dolor de cabeza severo", "Visión borrosa", "Dolor en el pecho", "Dificultad para respirar"],
  "Insuficiencia Renal Crónica": ["Creatinina elevada en examen", "Hinchazón en piernas o pies", "Orina con sangre o espuma", "Fatiga extrema", "Náuseas frecuentes"],
  "Insuficiencia Cardíaca": ["Dificultad para respirar en reposo", "Dolor en el pecho", "Hinchazón en piernas", "Palpitaciones irregulares", "Fatiga al mínimo esfuerzo"],
  "Enfermedad Pulmonar Obstructiva (EPOC)": ["Dificultad para respirar en reposo", "Silbidos al respirar", "Tos con sangre", "Saturación de oxígeno < 90%", "Uso frecuente de inhalador"],
  "Asma Crónica": ["Dificultad para respirar en reposo", "Silbidos al respirar", "Tos con sangre", "Saturación de oxígeno < 90%", "Uso frecuente de inhalador"],
  "Generic": ["Dolor severo persistente", "Fiebre alta (> 38.5°C)", "Pérdida de conciencia reciente", "Cambio brusco en medicación", "Empeoramiento en últimos 3 días"]
};

const CRITICAL_SYMPTOMS = [
  "Dolor en el pecho",
  "Dificultad para respirar en reposo",
  "Pérdida de conciencia reciente",
  "Saturación de oxígeno < 90%",
  "Presión > 160/100 mmHg",
  "Glucosa en ayunas > 200 mg/dL",
  "Tos con sangre"
];

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

export default function Appointments() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [province, setProvince] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<CentroSalud | null>(null);
  const [selectedReason, setSelectedReason] = useState<{ label: string, severity: 'high' | 'standard' } | null>(null);
  const [chronicDisease, setChronicDisease] = useState('Ninguna');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  const availableReasons = specialty ? REASONS_BY_SPECIALTY[specialty] || [] : [];
  const filteredCenters = province ? CENTROS_SALUD.filter(c => c.provincia === province) : [];
  const symptomsList = chronicDisease !== 'Ninguna' ? (SYMPTOMS_BY_DISEASE[chronicDisease] || SYMPTOMS_BY_DISEASE["Generic"]) : [];

  useEffect(() => {
    setSelectedReason(null);
  }, [specialty]);

  useEffect(() => {
    setSelectedCenter(null);
  }, [province]);

  useEffect(() => {
    setSelectedSymptoms([]);
  }, [chronicDisease]);

  const priorityData = useMemo(() => {
    if (chronicDisease === 'Ninguna') return { level: 'BAJO RIESGO', wait: '1 mes', color: 'text-green-600', bg: 'bg-green-100' };

    const hasCritical = selectedSymptoms.some(s => CRITICAL_SYMPTOMS.includes(s));
    const count = selectedSymptoms.length;

    if (hasCritical || count >= 3) {
      return { level: 'URGENTE', wait: '1 semana', color: 'text-red-600', bg: 'bg-red-100' };
    } else if (count >= 1) {
      return { level: 'MODERADO', wait: '3 semanas', color: 'text-amber-600', bg: 'bg-amber-100' };
    } else {
      return { level: 'BAJO RIESGO', wait: '1 mes', color: 'text-green-600', bg: 'bg-green-100' };
    }
  }, [chronicDisease, selectedSymptoms]);

  const getSuggestedDate = (level: string) => {
    const d = new Date();
    if (level === 'URGENTE') d.setDate(d.getDate() + 7);
    else if (level === 'MODERADO') d.setDate(d.getDate() + 21);
    else d.setDate(d.getDate() + 30);
    d.setHours(9, 0, 0, 0);
    return d;
  };

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const handleBooking = () => {
    const activeEmail = localStorage.getItem('sesion_activa_email');

    if (!activeEmail && !user) {
      toast({ title: "Acceso Requerido", description: "Inicia sesión para agendar tu cita." });
      router.push('/auth/login');
      return;
    }

    if (!province || !specialty || !selectedReason || !selectedCenter) {
      toast({ title: "Datos Incompletos", description: "Elige provincia, centro médico, especialidad y motivo.", variant: "destructive" });
      return;
    }

    setIsBooking(true);
    const appointmentDate = getSuggestedDate(priorityData.level);
    const appointmentId = Date.now().toString();
    const voucherCode = `AC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const doctorName = DOCTORS[specialty]?.[0] || "Dr. General";

    const newAppointment = {
      id: appointmentId,
      userId: user?.uid || 'local-user',
      healthCenterId: selectedCenter.id,
      healthCenterName: selectedCenter.nombre,
      centroSalud: {
        nombre: selectedCenter.nombre,
        tipo: selectedCenter.tipo,
        direccion: selectedCenter.direccion,
        telefono: selectedCenter.telefono,
        imagen: selectedCenter.imagen
      },
      specialty: specialty,
      doctorName: doctorName,
      appointmentDateTime: appointmentDate.toISOString(),
      status: "Confirmada",
      voucherCode: voucherCode,
      createdAt: new Date().toISOString(),
      reason: selectedReason.label,
      chronicDisease: chronicDisease,
      sintomasMarcados: selectedSymptoms,
      priority: priorityData.level,
      wait: priorityData.wait,
      hasAnalysis: hasAnalysis
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
    toast({ title: "Cita Confirmada", description: "Tu espacio ha sido reservado con prioridad automática." });
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
                <div className={cn("mt-4 p-3 rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-wider", 
                  bookedAppointment.priority === 'URGENTE' ? 'bg-red-100 text-red-700' : 
                  bookedAppointment.priority === 'MODERADO' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                )}>
                  <Activity className="h-4 w-4" /> Prioridad {bookedAppointment.priority}
                </div>
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
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-extrabold font-headline">Agendamiento de Citas CR</h1>
            <p className="text-lg text-muted-foreground">Sistema de priorización automática por enfermedades crónicas.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="rounded-[35px] shadow-xl border-none overflow-hidden bg-white">
                <CardContent className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground"><MapPin className="h-4 w-4" /> Provincia</Label>
                      <Select onValueChange={setProvince}>
                        <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-none">
                          <SelectValue placeholder="Elegir provincia" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground"><Hospital className="h-4 w-4" /> Centro de Salud</Label>
                      <Select onValueChange={(v) => setSelectedCenter(filteredCenters.find(c => c.id === v) || null)} disabled={!province}>
                        <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-none">
                          <SelectValue placeholder="Elegir centro médico" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCenters.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground"><Stethoscope className="h-4 w-4" /> Especialidad</Label>
                      <Select onValueChange={setSpecialty}>
                        <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-none">
                          <SelectValue placeholder="Elegir especialidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground"><AlertTriangle className="h-4 w-4" /> Motivo</Label>
                      <Select onValueChange={(v) => setSelectedReason(availableReasons.find(r => r.label === v) || null)} disabled={!specialty}>
                        <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-none">
                          <SelectValue placeholder="Elegir motivo" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableReasons.map(r => <SelectItem key={r.label} value={r.label}>{r.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-dashed space-y-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground"><Activity className="h-4 w-4" /> ¿Padece alguna enfermedad crónica?</Label>
                      <Select value={chronicDisease} onValueChange={setChronicDisease}>
                        <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-none">
                          <SelectValue placeholder="Seleccionar enfermedad" />
                        </SelectTrigger>
                        <SelectContent>
                          {CHRONIC_DISEASES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {chronicDisease !== 'Ninguna' && (
                      <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                        <Label className="text-sm font-bold block mb-2">Marque los síntomas que presenta actualmente:</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {symptomsList.map((symptom) => (
                            <div key={symptom} className="flex items-center space-x-3 p-3 rounded-xl bg-muted/20 border border-transparent hover:border-primary/20 transition-colors">
                              <Checkbox 
                                id={symptom} 
                                checked={selectedSymptoms.includes(symptom)}
                                onCheckedChange={() => handleSymptomToggle(symptom)}
                              />
                              <label htmlFor={symptom} className="text-xs font-medium leading-none cursor-pointer">
                                {symptom}
                              </label>
                            </div>
                          ))}
                        </div>
                        
                        <div className="pt-4">
                           <Button 
                             variant="outline" 
                             className="w-full rounded-xl border-dashed border-2 h-14 bg-muted/10 text-muted-foreground hover:text-primary gap-2"
                             onClick={() => setHasAnalysis(!hasAnalysis)}
                           >
                             <FileText className={cn("h-5 w-5", hasAnalysis ? "text-primary" : "")} />
                             {hasAnalysis ? "Archivo adjuntado correctamente" : "Adjuntar resultado de laboratorio (opcional)"}
                           </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button className="w-full h-16 rounded-full text-lg shadow-xl shadow-primary/20 font-bold" onClick={handleBooking} disabled={isBooking || !province || !specialty || !selectedReason || !selectedCenter}>
                    {isBooking ? <Loader2 className="animate-spin" /> : "Confirmar Cita Nacional"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-[35px] border-none shadow-xl overflow-hidden bg-primary text-white">
                <CardHeader className="pb-2">
                  <h3 className="text-xl font-bold font-headline flex items-center gap-2"><Hospital className="h-5 w-5" /> Sede Seleccionada</h3>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {selectedCenter ? (
                    <div className="space-y-6 animate-in fade-in duration-500">
                      <div className="relative h-40 w-full rounded-2xl overflow-hidden shadow-lg border border-white/20">
                        <Image src={selectedCenter.imagen} alt={selectedCenter.nombre} fill className="object-cover" />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold leading-tight">{selectedCenter.nombre}</h3>
                          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-[9px] font-bold uppercase mt-2 tracking-widest border border-white/10">
                            {selectedCenter.tipo}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm opacity-90">
                          <p className="flex items-start gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /> {selectedCenter.direccion}</p>
                          <p className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /> {selectedCenter.telefono}</p>
                          <p className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0" /> {selectedCenter.horario}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center space-y-4 opacity-60">
                      <Hospital className="h-12 w-12 mx-auto" />
                      <p className="text-sm italic">Seleccione un centro médico para ver los detalles.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-[35px] border-none shadow-xl overflow-hidden bg-white">
                <CardHeader className="bg-secondary p-6 text-white">
                   <h3 className="text-lg font-bold font-headline flex items-center gap-2"><Activity className="h-5 w-5" /> Análisis de Riesgo</h3>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                   <div className={cn("p-5 rounded-3xl flex flex-col items-center text-center space-y-3 transition-colors duration-500", priorityData.bg)}>
                      {priorityData.level === 'URGENTE' ? <AlertCircle className={cn("h-10 w-10", priorityData.color)} /> : 
                       priorityData.level === 'MODERADO' ? <Clock className={cn("h-10 w-10", priorityData.color)} /> : 
                       <CheckCircle2 className={cn("h-10 w-10", priorityData.color)} />}
                      
                      <div>
                        <p className={cn("text-xs font-bold uppercase tracking-widest mb-1", priorityData.color)}>Prioridad {priorityData.level}</p>
                        <p className="text-sm font-medium text-foreground/80">
                          {priorityData.level === 'URGENTE' ? "⚠️ Cita disponible esta semana" : 
                           priorityData.level === 'MODERADO' ? "⏰ Aproximadamente 3 semanas" : "✓ Disponible en 1 mes"}
                        </p>
                      </div>
                   </div>
                   
                   <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                     Este es un cálculo preliminar basado en su declaración. El personal médico validará estos datos durante su atención.
                   </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
