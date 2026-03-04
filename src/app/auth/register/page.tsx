
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Lock, Phone, ArrowLeft, Loader2, CreditCard, Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function Register() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    identificationType: '',
    idNumber: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !db || !auth) return;
    setIsLoading(true);

    try {
      // 1. Verificar unicidad de cédula en Costa Rica
      const idRef = doc(db, 'identifications', formData.idNumber);
      const idSnap = await getDoc(idRef);

      if (idSnap.exists()) {
        toast({
          title: "Identificación Duplicada",
          description: "Este número de cédula ya está registrado en la red nacional.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // 2. Crear cuenta de autenticación
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const [firstName, ...lastNameParts] = formData.fullName.split(' ');
      const lastName = lastNameParts.join(' ');

      // 3. Registrar el ID como ocupado
      await setDoc(idRef, { userId: user.uid });

      // 4. Crear el perfil de usuario
      setDocumentNonBlocking(doc(db, 'users', user.uid), {
        id: user.uid,
        username: formData.username,
        firstName: firstName || '',
        lastName: lastName || '',
        email: formData.email,
        phoneNumber: formData.phone,
        identificationType: formData.identificationType,
        idNumber: formData.idNumber,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({
        title: "Registro Exitoso",
        description: "Tu expediente nacional ha sido creado correctamente.",
      });
      
      router.push('/profile');
    } catch (error: any) {
      let errorMessage = "No se pudo crear la cuenta por un error técnico.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este correo electrónico ya está registrado.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "La contraseña debe ser más robusta (mínimo 6 caracteres).";
      }
      
      toast({
        title: "Aviso del Portal",
        description: errorMessage,
        variant: "destructive"
      });
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
             <h2 className="text-2xl font-bold">Registro de Salud Costa Rica</h2>
             <p className="text-white/80 text-sm">Crea tu expediente digital unificado</p>
          </div>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="fullName" 
                      name="fullName"
                      placeholder="Según su documento" 
                      className="pl-10 h-11 rounded-xl" 
                      required 
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de Usuario</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="username" 
                      name="username"
                      placeholder="usuario123" 
                      className="pl-10 h-11 rounded-xl" 
                      required 
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identificationType">Tipo de Identificación</Label>
                  <div className="relative">
                    <Flag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                    <Select 
                      onValueChange={(val) => setFormData({...formData, identificationType: val})}
                      required
                    >
                      <SelectTrigger className="pl-10 h-11 rounded-xl">
                        <SelectValue placeholder="Nacional o Extranjero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nacional">Nacional (Cédula)</SelectItem>
                        <SelectItem value="Extranjero">Extranjero (DIMEX/Pasaporte)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber">Número de Identificación</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="idNumber" 
                      name="idNumber"
                      placeholder={formData.identificationType === 'Nacional' ? "Ej: 1-1234-5678" : "Ej: 155..."} 
                      className="pl-10 h-11 rounded-xl" 
                      required 
                      value={formData.idNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground px-1 italic">Este número será validado como único en el sistema nacional.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      placeholder="correo@ejemplo.cr" 
                      className="pl-10 h-11 rounded-xl" 
                      required 
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono de Contacto</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      name="phone"
                      type="tel" 
                      placeholder="8888-8888" 
                      className="pl-10 h-11 rounded-xl" 
                      required 
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      name="password"
                      type="password" 
                      placeholder="Mínimo 6 caracteres" 
                      className="pl-10 h-11 rounded-xl" 
                      required 
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <Button type="submit" className="w-full h-12 text-lg rounded-full shadow-lg shadow-primary/20" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Registrar Expediente Nacional"}
                </Button>
                <Button type="button" variant="ghost" className="w-full rounded-full" onClick={() => router.push('/')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t py-6 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes expediente?{' '}
              <Link href="/auth/login" className="text-primary font-bold hover:underline">
                Acceder Aquí
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
