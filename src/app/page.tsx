import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Calendar, UserPlus, MapPin, Search, ArrowRight, ShieldCheck, HeartPulse, Clock } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-medical') || PlaceHolderImages[0];
  const missionImage = PlaceHolderImages.find(img => img.id === 'mission-image') || PlaceHolderImages[1];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            {heroImage && (
              <Image 
                src={heroImage.imageUrl || "https://picsum.photos/seed/hosp-cr-hero/1200/600"} 
                alt={heroImage.description || "Hero"} 
                fill 
                className="object-cover brightness-50"
                priority
                data-ai-hint={heroImage.imageHint || "hospital"}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-5xl font-extrabold font-headline tracking-tight text-foreground lg:text-6xl">
                Red Nacional de Salud, <span className="text-primary underline decoration-secondary/30">Siempre Contigo</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Agenda tus citas médicas en hospitales y EBAIS de todo el país de forma rápida y segura a través de SmartCitas.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 px-8 py-6 text-lg" asChild>
                  <Link href="/appointments">
                    Gestionar Cita <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/5 px-8 py-6 text-lg" asChild>
                  <Link href="/locations">Sedes Nacionales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Action Grid */}
        <section className="py-20 bg-accent/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold font-headline text-foreground">Gestión de Salud con SmartCitas</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Servicios digitales integrados para la atención médica nacional.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'Nueva Cita', icon: Calendar, color: 'bg-primary', link: '/appointments', desc: 'Reserva consulta inmediata en tu zona.' },
                { title: 'Registro Digital', icon: UserPlus, color: 'bg-secondary', link: '/auth/register', desc: 'Crea tu expediente médico unificado.' },
                { title: 'Sedes Públicas', icon: MapPin, color: 'bg-blue-600', link: '/locations', desc: 'Hospitales y EBAIS en las 7 provincias.' },
                { title: 'Mi Expediente', icon: Search, color: 'bg-teal-600', link: '/profile', desc: 'Gestiona tus datos y comprobantes.' }
              ].map((item, idx) => (
                <Link key={idx} href={item.link} className="group">
                  <div className="bg-card p-8 rounded-3xl border shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 text-center space-y-4 h-full flex flex-col items-center">
                    <div className={`p-4 rounded-2xl ${item.color} text-white group-hover:rotate-6 transition-transform`}>
                      <item.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold font-headline">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    <div className="pt-4 mt-auto">
                      <span className="text-primary font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                        Acceder <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 space-y-8">
                <h2 className="text-4xl font-bold font-headline leading-tight">Garantía <span className="text-primary">SmartCitas</span></h2>
                <div className="space-y-6">
                  {[
                    { icon: ShieldCheck, title: 'Datos Protegidos', desc: 'Seguridad de grado bancario para tu información médica personal.' },
                    { icon: Clock, title: 'Disponibilidad Inmediata', desc: 'Sistema dinámico que encuentra la cita más próxima en tu región.' },
                    { icon: HeartPulse, title: 'Red Integrada', desc: 'Conexión total con los centros de salud de la Caja y servicios nacionales.' }
                  ].map((benefit, bIdx) => (
                    <div key={bIdx} className="flex gap-4">
                      <div className="mt-1 flex-shrink-0 bg-accent p-2 rounded-lg text-secondary">
                        <benefit.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold font-headline">{benefit.title}</h4>
                        <p className="text-muted-foreground">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:w-1/2 relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl">
                 <Image 
                  src={missionImage?.imageUrl || "https://picsum.photos/seed/med-mission/600/400"} 
                  alt="Servicios Médicos Nacionales" 
                  fill 
                  className="object-cover"
                  data-ai-hint="medical doctor"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
