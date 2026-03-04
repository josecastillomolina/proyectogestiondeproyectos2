import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-card border-t pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-headline text-primary border-b-2 border-primary/20 pb-2 inline-block">Portal Nacional</h3>
            <p className="text-muted-foreground leading-relaxed">
              Sistema unificado de gestión de salud para la Red Nacional de Costa Rica. Facilitamos el acceso ágil y seguro a servicios médicos de alta calidad en todo el territorio nacional.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-headline text-primary border-b-2 border-primary/20 pb-2 inline-block">Compromiso CR</h3>
            <p className="text-muted-foreground leading-relaxed">
              Nuestro compromiso es la salud de cada ciudadano, integrando la tecnología para reducir tiempos de espera y mejorar la experiencia de atención médica.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-headline text-primary border-b-2 border-primary/20 pb-2 inline-block">Soporte al Usuario</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5 text-secondary" /> +506 60285415
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-secondary" /> consultas@agendacitascr.com
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-secondary" /> San José, Costa Rica. Distrito Médico.
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Facebook className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="h-6 w-6" />
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AgendaCitas Nacional CR. Portal de Salud de Costa Rica.
          </div>
        </div>
      </div>
    </footer>
  );
}
