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
import { User, Mail, Lock, Phone, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
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

    if (!email || !password || !fullName) {
      setErrorMessage("Completa los campos obligatorios.");
      return;
    }

    if (!auth) {
      setErrorMessage("Error de conexión con el servidor.");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });

      // Intento opcional de guardar en Firestore (no bloquea el registro)
      if (db) {
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            fullName,
            email,
            phone: formData.phone,
            createdAt: serverTimestamp()
          });
        } catch (e) {
          console.warn("Firestore no listo, continuando...");
        }
      }

      toast({ title: "Cuenta Creada", description: "Bienvenido a la red de salud." });
      router.push('/profile');
    } catch (error: any) {
      let msg = "No se pudo registrar.";
      if (error.code === 'auth/email-already-in-use') msg = "El correo ya está en uso.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-10 bg-accent/5 px-4">
        <Card className="w-full max-w-md shadow-xl rounded-3xl border-none overflow-hidden">
          <div className="bg-primary p-6 text-white text-center">
             <h2 className="text-xl font-bold">Registro Nacional CR</h2>
          </div>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="bg-destructive/10 p-3 rounded-lg flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" /> {errorMessage}
                </div>
              )}
              <div className="space-y-1">
                <Label>Nombre Completo</Label>
                <Input placeholder="José Pérez" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="rounded-xl h-10" />
              </div>
              <div className="space-y-1">
                <Label>Correo Electrónico</Label>
                <Input type="email" placeholder="correo@ejemplo.com" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="rounded-xl h-10" />
              </div>
              <div className="space-y-1">
                <Label>Contraseña</Label>
                <Input type="password" placeholder="Mínimo 6 caracteres" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="rounded-xl h-10" />
              </div>
              <Button type="submit" className="w-full h-11 rounded-full mt-4" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear Cuenta"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t py-4">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta? <Link href="/auth/login" className="text-primary font-bold">Ingresa</Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
