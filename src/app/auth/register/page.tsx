"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Lock, Phone, ArrowLeft, Loader2, CreditCard, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

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
    identificationType: '',
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
      const msg = "Falta el paso final: Ve a Netlify > Deploys > Trigger Deploy > 'Clear cache and deploy site'. Sin esto, el sistema no detectará tus variables.";
      setErrorMessage(msg);
      toast({
        title: "Sincronización Pendiente",
        description: "Se requiere un re-despliegue limpio en Netlify para activar las llaves.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const idRef = doc(db, 'identifications', formData.idNumber);
      const idSnap = await getDoc(idRef).catch(() => null);
      
      if (idSnap && idSnap.exists()) {
        setErrorMessage("Esta identificación ya está registrada en el sistema nacional.");
        setIsLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const firebaseUser = userCredential.user;

      const [firstName, ...lastNameParts] = formData.fullName.split(' ');
      const lastName = lastNameParts.join(' ');

      await setDoc(idRef, { userId: firebaseUser.uid });

      setDocumentNonBlocking(doc(db, 'users', firebaseUser.uid), {
        id: firebaseUser.uid,
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

      toast({ title: "Expediente Creado", description: "Bienvenido al sistema unificado de salud." });
      router.push('/profile');
    } catch (error: any) {
      let friendlyMessage = "Error de comunicación con el sistema de salud.";
      
      if (error.code === 'auth/email-already-in-use') friendlyMessage = "Este correo ya está registrado.";
      else if (error.code === 'auth/weak-password') friendlyMessage = "La contraseña es muy débil.";
      else if (error.code === 'auth/network-request-failed' || error.message?.includes('offline')) {
        friendlyMessage = "El cliente está 'offline'. Por favor, limpia la caché de Netlify y vuelve a desplegar el sitio.";
      }

      setErrorMessage(friendlyMessage);
      toast({ title: "Fallo en el Registro", description: friendlyMessage, variant: "destructive" });
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
              {errorMessage && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-start gap-3 text-destructive text-sm animate-in fade-in duration-300">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Error de Configuración</p>
                    <p className="leading-relaxed">{errorMessage}</p>
                    <div className="pt-2">
                       <p className="text-[10px] uppercase font-bold opacity-70">Instrucciones Netlify:</p>
                       <p className="text-xs">Deploys > Trigger Deploy > Clear cache and deploy site.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="fullName" name="fullName" placeholder="Según su documento" className="pl-10 h-11 rounded-xl" required value={formData.fullName} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de Usuario</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="username" name="username" placeholder="usuario123" className="pl-10 h-11 rounded-xl" required value={formData.username} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="identificationType">Tipo de Identificación</Label>
                  <Select onValueChange={(val) => setFormData({...formData, identificationType: val})} required>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Nacional o Extranjero" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nacional">Nacional (Cédula)</SelectItem>
                      <SelectItem value="Extranjero">Extranjero (DIMEX/Pasaporte)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idNumber">Número de Identificación</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="idNumber" name="idNumber" placeholder="Número de cédula o DIMEX" className="pl-10 h-11 rounded-xl" required value={formData.idNumber} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" name="email" type="email" placeholder="correo@ejemplo.cr" className="pl-10 h-11 rounded-xl" required value={formData.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono de Contacto</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" name="phone" type="tel" placeholder="8888-8888" className="pl-10 h-11 rounded-xl" required value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" className="pl-10 h-11 rounded-xl" required value={formData.password} onChange={handleChange} />
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
              ¿Ya tienes expediente? <Link href="/auth/login" className="text-primary font-bold hover:underline">Acceder Aquí</Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
