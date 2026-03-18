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
import { User, Mail, Lock, Phone, ArrowLeft, Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

export default function Register() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    idNumber: ''
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/profile');
    }
  }, [user, isUserLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMessage(null);

    const email = (formData.email ?? '').trim();
    const password = (formData.password ?? '').trim();
    const fullName = (formData.fullName ?? '').trim();
    const username = (formData.username ?? '').trim();
    const idNumber = (formData.idNumber ?? '').trim();

    if (!email || !password || !fullName || !idNumber) {
      setErrorMessage("Por favor completa los campos obligatorios.");
      return;
    }

    if (!auth) {
      setErrorMessage("Servicio de autenticación no disponible.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Actualizar el perfil básico de Auth
      await updateProfile(firebaseUser, { displayName: fullName });

      // 3. Intentar guardar datos extra en Firestore (Opcional)
      if (db) {
        try {
          const [firstName = '', ...lastNameParts] = fullName.split(' ');
          const lastName = lastNameParts.join(' ');

          await setDoc(doc(db, 'users', firebaseUser.uid), {
            id: firebaseUser.uid,
            username,
            firstName,
            lastName,
            email,
            phoneNumber: formData.phone,
            idNumber,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            bloodType: 'Pendiente',
            allergies: 'Ninguna'
          });
          
          // Guardar referencia de cédula para unicidad
          await setDoc(doc(db, 'identifications', idNumber), { userId: firebaseUser.uid });
        } catch (fsError: any) {
          console.warn("[Firestore] No se pudo guardar el expediente extendido:", fsError.message);
        }
      }

      toast({ title: "Cuenta Creada", description: "Bienvenido a la Red Nacional de Salud." });
      router.push('/profile');
    } catch (error: any) {
      let friendlyMessage = "Error al completar el registro.";
      if (error.code === 'auth/email-already-in-use') friendlyMessage = "Este correo ya está registrado.";
      else if (error.code === 'auth/weak-password') friendlyMessage = "La contraseña debe ser de al menos 6 caracteres.";
      else friendlyMessage = error.message || "Error desconocido.";

      setErrorMessage(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-20 bg-accent/10 px-4">
        <Card className="w-full max-w-2xl shadow-2xl rounded-3xl border-none overflow-hidden">
          <div className="bg-primary p-6 text-white text-center">
             <h2 className="text-2xl font-bold font-headline">Registro Oficial de Salud CR</h2>
             <p className="text-white/80 text-sm">Crea tu expediente único nacional</p>
          </div>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-start gap-3 text-destructive animate-in fade-in duration-300">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{errorMessage}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input name="fullName" placeholder="José Pérez" className="pl-10 h-11 rounded-xl" required value={formData.fullName} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Usuario</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input name="username" placeholder="jperez" className="pl-10 h-11 rounded-xl" required value={formData.username} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Cédula</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input name="idNumber" placeholder="1-1111-1111" className="pl-10 h-11 rounded-xl" required value={formData.idNumber} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input name="phone" placeholder="8888-8888" className="pl-10 h-11 rounded-xl" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-bold">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input name="email" type="email" placeholder="correo@ejemplo.com" className="pl-10 h-11 rounded-xl" required value={formData.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-bold">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input name="password" type="password" placeholder="Mínimo 6 caracteres" className="pl-10 h-11 rounded-xl" required value={formData.password} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-lg rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Registrarse"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t py-6 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta? <Link href="/auth/login" className="text-primary font-bold hover:underline">Ingresa aquí</Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
