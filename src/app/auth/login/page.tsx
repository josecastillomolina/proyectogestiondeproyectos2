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

    // Verificación de configuración
    if (!auth) {
      const msg = "Sincronización de llaves pendiente en el navegador. Haz clic en 'Trigger deploy' -> 'Deploy project without cache' en tu panel de Netlify.";
      setErrorMessage(msg);
      toast({
        title: "Paso Final Requerido",
        description: "Haz clic en 'Deploy project without cache' en Netlify para activar las llaves.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      toast({
        title: "Acceso Exitoso",
        description: "Bienvenido al portal AgendaCitas Nacional CR.",
      });
      router.push('/profile');
    } catch (error: any) {
      let friendlyError = "Credenciales incorrectas o problema de comunicación.";
      
      if (error.code === 'auth/invalid-credential') friendlyError = "El correo o la contraseña son incorrectos.";
      else if (error.code === 'auth/too-many-requests') friendlyError = "Demasiados intentos. Espera unos minutos.";
      else if (error.code === 'auth/network-request-failed') friendlyError = "Error de red. Asegúrate de haber hecho el 'Deploy project without cache' en Netlify.";
      
      setErrorMessage(friendlyError);
      toast({
        title: "Error de Acceso",
        description: friendlyError,
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
        <Card className="w-full max-w-md shadow-2xl rounded-3xl border-none">
          <CardHeader className="space-y-2 text-center pb-10">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline text-foreground">Acceso al Portal</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Ingresa para gestionar tus citas médicas nacionales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-start gap-3 text-destructive text-sm animate-in fade-in duration-300">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-xs uppercase tracking-wider">Aviso de Configuración</p>
                    <p className="leading-relaxed font-medium">{errorMessage}</p>
                    <div className="mt-2 pt-2 border-t border-destructive/20">
                      <p className="text-[10px] font-bold opacity-70">EN TU CAPTURA DE PANTALLA:</p>
                      <p className="text-[11px]">Haz clic en <strong>Trigger deploy</strong> y selecciona <strong>Deploy project without cache</strong>.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="ejemplo@correo.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    id="password"
                    type="password"
                    className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Ingresar al Sistema"}
                </Button>
                <Button type="button" variant="ghost" className="w-full rounded-full" onClick={() => router.push('/')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t py-6 bg-muted/20 rounded-b-3xl">
            <p className="text-sm text-muted-foreground text-center">
              ¿Aún no tienes expediente digital?{' '}
              <Link href="/auth/register" className="text-primary font-bold hover:underline">
                Regístrate Aquí
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
