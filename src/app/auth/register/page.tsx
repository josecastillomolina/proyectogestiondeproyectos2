'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { User, Mail, Lock, Phone, CreditCard, Flag, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Register() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    idType: '',
    idNumber: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage(null);

    const email = (formData.email ?? '').trim();
    const password = (formData.password ?? '').trim();

    if (!email || !password || !formData.fullName || !formData.idNumber) {
      setErrorMessage("Por favor completa los campos obligatorios.");
      return;
    }

    if (!auth || auth.config.apiKey === 'none') {
      setErrorMessage("El servicio de salud digital no está configurado correctamente. Verifica tus variables de entorno.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Crear Usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Actualizar Perfil de Auth para que el nombre sea visible de inmediato
      await updateProfile(userCredential.user, { 
        displayName: formData.fullName 
      });

      // 3. Guardar en Firestore (Opcional/Resiliente)
      try {
        if (db) {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            fullName: formData.fullName,
            username: formData.username,
            identificationType: formData.idType,
            idNumber: formData.idNumber,
            email: email,
            phoneNumber: formData.phone,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      } catch (fsError: any) {
        console.warn("[Firestore] No se pudieron guardar datos extra:", fsError.message);
      }

      toast({ 
        title: "Registro Exitoso", 
        description: "Tu expediente nacional ha sido creado correctamente." 
      });
      router.push('/profile');
    } catch (error: any) {
      console.error("Error en registro:", error);
      let msg = "No se pudo completar el registro oficial.";
      if (error.code === 'auth/email-already-in-use') msg = "Este correo ya está registrado.";
      if (error.code === 'auth/weak-password') msg = "La contraseña debe tener al menos 6 caracteres.";
      if (error.code === 'auth/api-key-not-valid') msg = "Error crítico: API Key inválida o no configurada.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-accent/5">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-3xl">
          <Card className="rounded-[40px] shadow-2xl border-none overflow-hidden bg-white">
            <div className="bg-primary p-10 text-white text-center">
              <h1 className="text-3xl font-bold font-headline mb-2">Registro de Salud Costa Rica</h1>
              <p className="opacity-90">Crea tu expediente digital unificado</p>
            </div>
            
            <CardContent className="p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {errorMessage && (
                  <div className="bg-destructive/10 p-4 rounded-2xl flex items-center gap-3 text-destructive text-sm font-medium border border-destructive/20 animate-in fade-in zoom-in-95">
                    <AlertCircle className="h-5 w-5 shrink-0" /> {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-foreground">Nombre Completo</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="Según su documento" 
                        required 
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="rounded-2xl h-14 pl-12 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-foreground">Nombre de Usuario</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="usuario123" 
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className="rounded-2xl h-14 pl-12 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-foreground">Tipo de Identificación</Label>
                    <div className="relative">
                      <Flag className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                      <Select onValueChange={(val) => setFormData({...formData, idType: val})}>
                        <SelectTrigger className="rounded-2xl h-14 pl-12 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary">
                          <SelectValue placeholder="Nacional o Extranjero" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="Nacional">Nacional</SelectItem>
                          <SelectItem value="Extranjero">Extranjero</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-foreground">Número de Identificación</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="Ej: 155..." 
                        required 
                        value={formData.idNumber}
                        onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                        className="rounded-2xl h-14 pl-12 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-foreground">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        type="email" 
                        placeholder="correo@ejemplo.cr" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="rounded-2xl h-14 pl-12 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-foreground">Teléfono de Contacto</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="8888-8888" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="rounded-2xl h-14 pl-12 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      type="password" 
                      placeholder="Mínimo 6 caracteres" 
                      required 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="rounded-2xl h-14 pl-12 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-16 rounded-full mt-8 shadow-xl shadow-primary/20 text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98]" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Registrar Expediente Nacional"}
                </Button>

                <div className="flex justify-center pt-4">
                  <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-medium transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Volver al Inicio
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
