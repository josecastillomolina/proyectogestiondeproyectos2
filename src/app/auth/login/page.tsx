'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { LogIn, Lock, ArrowLeft, Loader2, Mail, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    if (!email || !password) {
      setErrorMessage("Por favor ingresa tu correo y contraseña.");
      return;
    }

    if (!auth) {
      setErrorMessage("El servicio de autenticación no está disponible.");
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Acceso Exitoso", description: "Bienvenido de nuevo al portal nacional." });
      router.push('/profile');
    } catch (error: any) {
      let friendlyError = "No se pudo iniciar sesión.";
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        friendlyError = "Correo electrónico o contraseña incorrectos.";
      } else if (error.code === 'auth/too-many-requests') {
        friendlyError = "Demasiados intentos fallidos. Intenta más tarde.";
      } else {
        friendlyError = error.message || "Error al intentar ingresar.";
      }
      
      setErrorMessage(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-20 bg-accent/10 px-4">
        <Card className="w-full max-md shadow-2xl rounded-3xl border-none overflow-hidden">
          <CardHeader className="space-y-2 text-center pb-8 pt-10">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline text-foreground tracking-tight">Acceso al Portal</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Ingresa tus credenciales para gestionar tu salud.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-start gap-3 text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-xs uppercase tracking-wider">Aviso del Sistema</p>
                    <p className="leading-relaxed text-sm font-medium">{errorMessage}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="ejemplo@correo.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" title="password" className="text-sm font-bold">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    id="password"
                    type="password"
                    className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg rounded-full shadow-lg shadow-primary/20" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Ingresar"}
                </Button>
                <Button type="button" variant="ghost" className="w-full rounded-full" onClick={() => router.push('/')} disabled={isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t py-6 bg-muted/20">
            <p className="text-sm text-muted-foreground text-center">
              ¿No tienes cuenta activa? <Link href="/auth/register" className="text-primary font-bold hover:underline">Regístrate aquí</Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
