
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
import { doc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';

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
    identificationType: 'Nacional',
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

    if (!auth || !db) {
      setErrorMessage("Los servicios de salud digitales no están disponibles actualmente.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Verificar unicidad de identificación
      const idRef = doc(db, 'identifications', formData.idNumber);
      const idSnap = await getDoc(idRef);
      
      if (idSnap.exists()) {
        setErrorMessage("Esta identificación ya posee un expediente registrado en el sistema nacional.");
        setIsLoading(false);
        return;
      }

      // 2. Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseUser = userCredential.user;

      // Actualizar el nombre en el perfil de Auth para disponibilidad inmediata
      await updateProfile(firebaseUser, {
        displayName: formData.fullName
      });

      // 3. Guardar mapeo de identificación y Perfil (Estructura completa)
      const [firstName, ...lastNameParts] = formData.fullName.split(' ');
      const lastName = lastNameParts.join(' ');

      // Mapeo de unicidad
      await setDoc(idRef, { userId: firebaseUser.uid });
      
      // Documento de perfil de usuario
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        id: firebaseUser.uid,
        username: formData.username,
        firstName: firstName || '',
        lastName: lastName || '',
        email: formData.email,
        phoneNumber: formData.phone,
        identificationType: formData.identificationType,
        idNumber: formData.idNumber, // Aseguramos que se guarde el número de cédula
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast({ title: "Expediente Creado", description: "Bienvenido al Sistema Nacional de Salud de Costa Rica." });
      router.push('/profile');
    } catch (error: any) {
      let friendlyMessage = "No se pudo completar el registro oficial.";
      
      if (error.code === 'auth/email-already-in-use') {
        friendlyMessage = "Este correo electrónico ya está registrado en la base de datos nacional.";
      } else if (error.code === 'auth/weak-password') {
        friendlyMessage = "La contraseña debe tener al menos 6 caracteres por seguridad.";
      } else if (error.code === 'auth/invalid-email') {
        friendlyMessage = "El formato del correo electrónico no es válido.";
      }

      setErrorMessage(friendlyMessage);
      toast({ title: "Error en Registro", description: friendlyMessage, variant: "destructive" });
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
             <h2 className="text-2xl font-bold font-headline">Registro de Salud Nacional</h2>
             <p className="text-white/80 text-sm">Crea tu expediente digital único para la red de salud</p>
          </div>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-start gap-3 text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-xs uppercase tracking-wider">Aviso del Sistema</p>
                    <p className="leading-relaxed text-sm font-medium">{errorMessage}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-bold">Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="fullName" name="fullName" placeholder="Tu nombre y apellidos" className="pl-10 h-11 rounded-xl" required value={formData.fullName} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-bold">Nombre de Usuario</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="username" name="username" placeholder="usuario123" className="pl-10 h-11 rounded-xl" required value={formData.username} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber" className="text-sm font-bold">Número de Cédula</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="idNumber" name="idNumber" placeholder="1-1111-1111" className="pl-10 h-11 rounded-xl" required value={formData.idNumber} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-bold">Teléfono de Contacto</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" name="phone" placeholder="8888-8888" className="pl-10 h-11 rounded-xl" required value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email" className="text-sm font-bold">Correo Electrónico Oficial</Label>
                  <Input id="email" name="email" type="email" placeholder="correo@ejemplo.com" className="h-11 rounded-xl" required value={formData.email} onChange={handleChange} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password" title="password" className="text-sm font-bold">Nueva Contraseña</Label>
                  <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" className="h-11 rounded-xl" required value={formData.password} onChange={handleChange} />
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-6">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg rounded-full shadow-lg" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Crear Expediente"}
                </Button>
                <Button type="button" variant="ghost" className="w-full rounded-full" onClick={() => router.push('/')} disabled={isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t py-6 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta activa? <Link href="/auth/login" className="text-primary font-bold hover:underline">Inicia Sesión aquí</Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
