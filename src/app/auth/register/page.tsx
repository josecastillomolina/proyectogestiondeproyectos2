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
import { User, Mail, Lock, Phone, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
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
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    idType: 'Nacional',
    idNumber: '',
    email: '',
    phone: '',
    password: ''
  });

  const saveToLocalStorage = (data: any) => {
    const userPayload = {
      ...data,
      uid: 'local-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(`perfil_${data.email}`, JSON.stringify(userPayload));
    localStorage.setItem('sesion_activa_email', data.email);
    localStorage.setItem('usuario_registrado', JSON.stringify(userPayload));
    return userPayload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!formData.email || !formData.password || !formData.fullName || !formData.idNumber) {
      toast({ title: "Campos incompletos", description: "Por favor llena todos los datos obligatorios.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      // Verificación segura de Auth
      const isAuthReady = !!(auth && auth.config && (auth.config as any).apiKey !== 'none');

      if (isAuthReady) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth!, formData.email, formData.password);
          await updateProfile(userCredential.user, { displayName: formData.fullName });

          if (db) {
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              ...formData,
              createdAt: serverTimestamp()
            });
          }
          // También guardamos en local como respaldo
          saveToLocalStorage(formData);
        } catch (fbErr: any) {
          console.warn("[Firebase Register] Fallo silencioso:", fbErr.message);
          saveToLocalStorage(formData);
        }
      } else {
        saveToLocalStorage(formData);
      }

      setIsSuccess(true);
      toast({ title: "¡Expediente Creado!", description: "Bienvenido a SmartCitas." });
      
      setTimeout(() => {
        router.push('/profile');
      }, 2000);

    } catch (error: any) {
      saveToLocalStorage(formData);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-accent/5">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="max-w-md w-full rounded-[40px] shadow-2xl border-none p-10 text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-primary">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h1 className="text-3xl font-bold font-headline">¡Registro Exitoso!</h1>
            <p className="text-muted-foreground">Tu expediente nacional ha sido creado en SmartCitas.</p>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/50" />
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-accent/5">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-3xl">
          <Card className="rounded-[40px] shadow-2xl border-none overflow-hidden bg-white">
            <div className="bg-primary p-10 text-white text-center">
              <h1 className="text-3xl font-bold font-headline mb-2">Registro de SmartCitas</h1>
              <p className="opacity-90">Crea tu expediente digital unificado en Costa Rica</p>
            </div>
            
            <CardContent className="p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Nombre Completo</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="Juan Pérez" 
                        required 
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="rounded-2xl h-14 pl-12 bg-muted/30 border-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Nombre de Usuario</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="jperez123" 
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className="rounded-2xl h-14 pl-12 bg-muted/30 border-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Tipo de Identificación</Label>
                    <Select onValueChange={(val) => setFormData({...formData, idType: val})} defaultValue="Nacional">
                      <SelectTrigger className="rounded-2xl h-14 bg-muted/30 border-none">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nacional">Nacional</SelectItem>
                        <SelectItem value="Extranjero">Extranjero</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Número de Cédula / DIMEX</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="Ej: 1-1234-5678" 
                        required 
                        value={formData.idNumber}
                        onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                        className="rounded-2xl h-14 pl-12 bg-muted/30 border-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        type="email" 
                        placeholder="correo@ejemplo.cr" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="rounded-2xl h-14 pl-12 bg-muted/30 border-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="8888-8888" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="rounded-2xl h-14 pl-12 bg-muted/30 border-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      type="password" 
                      placeholder="Mínimo 6 caracteres" 
                      required 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="rounded-2xl h-14 pl-12 bg-muted/30 border-none"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-16 rounded-full mt-6 shadow-xl shadow-primary/20 text-lg font-bold" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Crear Expediente SmartCitas"}
                </Button>

                <div className="text-center pt-4">
                  <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-primary font-medium">
                    ¿Ya tienes cuenta? Ingresa aquí
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
