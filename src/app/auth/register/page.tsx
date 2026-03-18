'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { User, Mail, Lock, Phone, ArrowLeft, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Register() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    email: '',
    password: '',
    phone: ''
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/profile');
    }
  }, [user, isUserLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage(null);

    const email = (formData.email ?? '').trim();
    const password = (formData.password ?? '').trim();
    const fullName = (formData.fullName ?? '').trim();
    const idNumber = (formData.idNumber ?? '').trim();

    if (!email || !password || !fullName || !idNumber) {
      setErrorMessage("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (!auth) {
      setErrorMessage("Servicio de autenticación no disponible. Verifica la API Key.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Actualizar perfil de Auth (Nombre)
      await updateProfile(userCredential.user, { displayName: fullName });

      // 3. Intento de guardar en Firestore (Opcional - No bloqueante si Firestore no está listo)
      if (db) {
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            fullName,
            idNumber,
            email,
            phone: formData.phone,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (dbError) {
          console.warn("[Firestore] No se pudo guardar el documento de perfil, pero la cuenta fue creada.", dbError);
        }
      }

      toast({ 
        title: "Registro Exitoso", 
        description: "Tu expediente nacional ha sido creado correctamente." 
      });
      router.push('/profile');
    } catch (error: any) {
      console.error("Error en el registro:", error);
      let msg = "No se pudo completar el registro.";
      if (error.code === 'auth/email-already-in-use') msg = "Este correo ya está registrado.";
      if (error.code === 'auth/invalid-email') msg = "El correo ingresado no es válido.";
      if (error.code === 'auth/weak-password') msg = "La contraseña es muy débil (mínimo 6 caracteres).";
      if (error.code === 'auth/api-key-not-valid') msg = "Error de configuración: API Key inválida.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12 bg-accent/5 px-4">
        <Card className="w-full max-w-md shadow-2xl rounded-3xl border-none overflow-hidden animate-in fade-in duration-500">
          <div className="bg-primary p-8 text-white text-center">
             <h2 className="text-2xl font-bold font-headline">Registro Nacional CR</h2>
             <p className="text-white/80 text-sm mt-2">Portal Oficial de Gestión de Salud</p>
          </div>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="bg-destructive/10 p-4 rounded-xl flex items-center gap-3 text-destructive text-sm font-medium border border-destructive/20">
                  <AlertCircle className="h-5 w-5 shrink-0" /> {errorMessage}
                </div>
              )}
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Juan Pérez" 
                    required 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                    className="rounded-xl h-11 pl-10" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cédula de Identidad</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="1-2345-6789" 
                    required 
                    value={formData.idNumber} 
                    onChange={(e) => setFormData({...formData, idNumber: e.target.value})} 
                    className="rounded-xl h-11 pl-10" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="email" 
                    placeholder="correo@ejemplo.com" 
                    required 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="rounded-xl h-11 pl-10" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="Mínimo 6 caracteres" 
                    required 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    className="rounded-xl h-11 pl-10" 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 rounded-full mt-6 shadow-lg shadow-primary/20 text-lg font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear Mi Expediente"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t py-6 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta activa? <Link href="/auth/login" className="text-primary font-bold hover:underline">Ingresa aquí</Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
