'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { LogIn, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
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
  const [formData, setFormData] = useState({ email: '', password: '' });

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
      setErrorMessage("Por favor ingresa tus credenciales.");
      return;
    }

    if (!auth) {
      setErrorMessage("Servicio no disponible. Verifica la configuración.");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Acceso Correcto", description: "Bienvenido de nuevo a tu expediente nacional." });
      router.push('/profile');
    } catch (error: any) {
      console.error("Error de login:", error);
      let msg = "Credenciales incorrectas.";
      if (error.code === 'auth/invalid-credential') msg = "El correo o la contraseña son incorrectos.";
      if (error.code === 'auth/user-not-found') msg = "No existe una cuenta con este correo.";
      if (error.code === 'auth/api-key-not-valid') msg = "Error del sistema: API Key inválida.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-accent/5 px-4">
        <Card className="w-full max-w-md shadow-2xl rounded-3xl border-none overflow-hidden animate-in fade-in duration-500">
          <CardHeader className="text-center py-10 bg-white">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline">Ingresar al Portal</CardTitle>
            <CardDescription className="text-base">Accede a tu cuenta nacional de salud</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="bg-destructive/10 p-4 rounded-xl flex items-center gap-3 text-destructive text-sm font-medium border border-destructive/20">
                  <AlertCircle className="h-5 w-5 shrink-0" /> {errorMessage}
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    className="flex h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="ejemplo@correo.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    className="flex h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-full mt-2 shadow-lg shadow-primary/20 text-lg font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t py-6 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta? <Link href="/auth/register" className="text-primary font-bold hover:underline">Regístrate ahora</Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
