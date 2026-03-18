
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
      setErrorMessage("Servicios no disponibles. Verifica tu conexión.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Verificar si la cédula ya existe
      const idRef = doc(db, 'identifications', formData.idNumber);
      let idSnap;
      
      try {
        idSnap = await getDoc(idRef);
      } catch (err: any) {
        if (err.code === 'unavailable') {
          throw new Error("El servidor de base de datos no responde. ¿Has creado la base de datos Firestore en el console?");
        }
        throw err;
      }
      
      if (idSnap.exists()) {
        setErrorMessage("Esta cédula ya posee un expediente registrado.");
        setIsLoading(false);
        return;
      }

      // 2. Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseUser = userCredential.user;

      // 3. Actualizar perfil
      await updateProfile(firebaseUser, {
        displayName: formData.fullName
      });

      // 4. Guardar expediente
      const [firstName = '', ...lastNameParts] = formData.fullName.split(' ');
      const lastName = lastNameParts.join(' ');

      await setDoc(idRef, { userId: firebaseUser.uid, idNumber: formData.idNumber });
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        id: firebaseUser.uid,
        username: formData.username,
        firstName: firstName,
        lastName: lastName,
        email: formData.email,
        phoneNumber: formData.phone,
        identificationType: 'Nacional',
        idNumber: formData.idNumber,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        bloodType: 'Pendiente',
        allergies: 'Ninguna reportada'
      });

      toast({ title: "Expediente Creado", description: "Bienvenido a la Red Nacional de Salud." });
      router.push('/profile');
    } catch (error: any) {
      let friendlyMessage = "Error al completar el registro.";
      
      if (error.code === 'auth/email-already-in-use') {
        friendlyMessage = "Este correo ya está en uso.";
      } else if (error.code === 'auth/operation-not-allowed') {
        friendlyMessage = "El ingreso con correo/contraseña no está habilitado en Firebase Console.";
      } else if (error.code === 'unavailable' || error.message.includes('unavailable')) {
        friendlyMessage = "Servicio de Salud no disponible temporalmente. Verifica que Firestore esté habilitado.";
      } else {
        friendlyMessage = `Error: ${error.message || error.code}`;
      }

      setErrorMessage(friendlyMessage);
      toast({ title: "Aviso de Sistema", description: friendlyMessage, variant: "destructive" });
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
             <h2 className="text-2xl font-bold font-headline">Portal Nacional de Salud CR</h2>
             <p className="text-white/80 text-sm">Crea tu expediente digital único</p>
          </div>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-start gap-3 text-destructive animate-in fade-in duration-300">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-xs uppercase tracking-wider">Aviso del Sistema</p>
                    <p className="text-sm font-medium">{errorMessage}</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input name="fullName" placeholder="Ej: José Ángel Castillo" className="pl-10 h-11 rounded-xl" required value={formData.fullName} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Nombre de Usuario</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input name="username" placeholder="shura" className="pl-10 h-11 rounded-xl" required value={formData.username} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Cédula de Identidad</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input name="idNumber" placeholder="2-0885-0663" className="pl-10 h-11 rounded-xl" required value={formData.idNumber} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Teléfono de Contacto</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input name="phone" placeholder="6028-5415" className="pl-10 h-11 rounded-xl" required value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-bold">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input name="email" type="email" placeholder="ejemplo@gmail.com" className="pl-10 h-11 rounded-xl" required value={formData.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-bold">Contraseña Segura</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input name="password" type="password" placeholder="Mínimo 6 caracteres" className="pl-10 h-11 rounded-xl" required value={formData.password} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-lg rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Crear Expediente"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t py-6 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes un expediente? <Link href="/auth/login" className="text-primary font-bold hover:underline">Ingresa aquí</Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
