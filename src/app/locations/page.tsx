"use client";

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Phone, Clock, ExternalLink, Hospital, Info, Search, Navigation } from 'lucide-react';
import Image from 'next/image';

const PROVINCES = ["Todas", "San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"];

const ALL_CENTERS = [
  {
    id: "h-mexico",
    name: "Hospital México",
    province: "San José",
    address: "La Uruca, San José",
    phone: "2242-6700",
    hours: "24 Horas",
    type: "Hospital Nacional",
    image: "https://picsum.photos/seed/cr1/400/250",
    mapsQuery: "Hospital México, San José, Costa Rica"
  },
  {
    id: "h-baltodano",
    name: "Hospital Dr. Enrique Baltodano Briceño",
    province: "Guanacaste",
    address: "Liberia, Guanacaste",
    phone: "2690-2300",
    hours: "24 Horas",
    type: "Hospital Nacional",
    image: "https://picsum.photos/seed/gua1/400/250",
    mapsQuery: "Hospital Enrique Baltodano Briceño, Liberia, Costa Rica"
  },
  {
    id: "h-anexion",
    name: "Hospital La Anexión",
    province: "Guanacaste",
    address: "Nicoya, Guanacaste",
    phone: "2685-5066",
    hours: "24 Horas",
    type: "Hospital Nacional",
    image: "https://picsum.photos/seed/gua2/400/250",
    mapsQuery: "Hospital La Anexión, Nicoya, Costa Rica"
  },
  {
    id: "ebais-liberia",
    name: "EBAIS Liberia Centro",
    province: "Guanacaste",
    address: "Costado Norte de la Iglesia, Liberia",
    phone: "2666-0211",
    hours: "7:00 AM - 4:00 PM",
    type: "EBAIS",
    image: "https://picsum.photos/seed/gua3/400/250",
    mapsQuery: "EBAIS Liberia Centro, Guanacaste, Costa Rica"
  },
  {
    id: "h-max-peralta",
    name: "Hospital Dr. Max Peralta Jiménez",
    province: "Cartago",
    address: "Centro de Cartago",
    phone: "2550-6400",
    hours: "24 Horas",
    type: "Hospital Nacional",
    image: "https://picsum.photos/seed/car1/400/250",
    mapsQuery: "Hospital Max Peralta Jiménez, Cartago, Costa Rica"
  },
  {
    id: "ebais-cartago-oriente",
    name: "EBAIS Cartago Oriente",
    province: "Cartago",
    address: "Distrito Oriental, Cartago",
    phone: "2551-0315",
    hours: "7:00 AM - 4:00 PM",
    type: "EBAIS",
    image: "https://picsum.photos/seed/car2/400/250",
    mapsQuery: "EBAIS Cartago Oriente, Cartago, Costa Rica"
  },
  {
    id: "h-svpaul",
    name: "Hospital San Vicente de Paúl",
    province: "Heredia",
    address: "Heredia Centro",
    phone: "2261-0000",
    hours: "24 Horas",
    type: "Hospital Nacional",
    image: "https://picsum.photos/seed/her1/400/250",
    mapsQuery: "Hospital San Vicente de Paúl, Heredia, Costa Rica"
  },
  {
    id: "ebais-heredia-centro",
    name: "EBAIS Heredia Centro",
    province: "Heredia",
    address: "Centro de Heredia",
    phone: "2237-6031",
    hours: "7:00 AM - 4:00 PM",
    type: "EBAIS",
    image: "https://picsum.photos/seed/her2/400/250",
    mapsQuery: "EBAIS Heredia Centro, Heredia, Costa Rica"
  },
  {
    id: "h-calderon",
    name: "Hospital Dr. R. A. Calderón Guardia",
    province: "San José",
    address: "Barrio Aranjuez, San José",
    phone: "2212-1000",
    hours: "24 Horas",
    type: "Hospital Nacional",
    image: "https://picsum.photos/seed/cr2/400/250",
    mapsQuery: "Hospital Calderón Guardia, San José, Costa Rica"
  },
  {
    id: "ebais-curri",
    name: "EBAIS Curridabat Centro",
    province: "San José",
    address: "Costado Sur de la Iglesia, Curridabat",
    phone: "2271-2030",
    hours: "7:00 AM - 4:00 PM",
    type: "EBAIS",
    image: "https://picsum.photos/seed/cr3/400/250",
    mapsQuery: "EBAIS Curridabat Centro, San José, Costa Rica"
  },
  {
    id: "h-monseñor",
    name: "Hospital Monseñor Sanabria",
    province: "Puntarenas",
    address: "El Roble, Puntarenas",
    phone: "2630-1200",
    hours: "24 Horas",
    type: "Hospital Nacional",
    image: "https://picsum.photos/seed/cr4/400/250",
    mapsQuery: "Hospital Monseñor Sanabria, Puntarenas, Costa Rica"
  },
  {
    id: "h-san-juan",
    name: "Hospital San Juan de Dios",
    province: "San José",
    address: "Paseo Colón, San José",
    phone: "2257-6282",
    hours: "24 Horas",
    type: "Hospital Nacional",
    image: "https://picsum.photos/seed/cr5/400/250",
    mapsQuery: "Hospital San Juan de Dios, San José, Costa Rica"
  },
  {
    id: "h-san-rafael",
    name: "Hospital San Rafael de Alajuela",
    province: "Alajuela",
    address: "Radial Francisco Orlich, Alajuela",
    phone: "2436-1000",
    hours: "24 Horas",
    type: "Hospital Nacional",
    image: "https://picsum.photos/seed/cr6/400/250",
    mapsQuery: "Hospital San Rafael de Alajuela, Alajuela, Costa Rica"
  },
  {
    id: "h-tony-facio",
    name: "Hospital Tony Facio",
    province: "Limón",
    address: "Centro de Limón",
    phone: "2758-2222",
    hours: "24 Horas",
    type: "Hospital Nacional",
    image: "https://picsum.photos/seed/cr8/400/250",
    mapsQuery: "Hospital Tony Facio, Limón, Costa Rica"
  }
];

export default function Locations() {
  const [filterProvince, setFilterProvince] = useState("Todas");

  const filteredCenters = filterProvince === "Todas" 
    ? ALL_CENTERS 
    : ALL_CENTERS.filter(c => c.province === filterProvince);

  const openInGoogleMaps = (query: string) => {
    const encodedQuery = encodeURIComponent(query);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedQuery}`, '_blank');
  };

  const openInWaze = (query: string) => {
    const encodedQuery = encodeURIComponent(query);
    window.open(`https://waze.com/ul?q=${encodedQuery}&navigate=yes`, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-accent/5">
        <section className="bg-primary py-20 text-white text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl font-extrabold font-headline mb-6 tracking-tight">Red Nacional de Salud CR</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
              Encuentra tu centro de salud más cercano y accede a la mejor atención médica en las 7 provincias.
            </p>
          </div>
        </section>

        <section className="py-12 container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar with Filter */}
            <div className="lg:w-1/3 space-y-8">
              <Card className="rounded-3xl border-none shadow-xl overflow-hidden">
                <div className="bg-secondary p-6 text-white flex items-center gap-3">
                   <Search className="h-6 w-6" />
                   <h2 className="text-xl font-bold font-headline">Filtro de Búsqueda</h2>
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Provincia</label>
                    <Select onValueChange={setFilterProvince} defaultValue="Todas">
                      <SelectTrigger className="rounded-xl h-12 border-2 border-muted hover:border-primary transition-colors">
                        <SelectValue placeholder="Selecciona provincia" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-4 border-t border-dashed">
                     <p className="text-xs text-muted-foreground flex items-start gap-2 italic leading-relaxed">
                        <Info className="h-4 w-4 text-primary shrink-0" />
                        Mostrando {filteredCenters.length} sedes disponibles para atención inmediata en {filterProvince === "Todas" ? "todo el país" : filterProvince}.
                     </p>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-white p-8 rounded-3xl border shadow-lg space-y-4">
                 <h3 className="font-bold text-lg flex items-center gap-2"><Hospital className="h-5 w-5 text-primary" /> Red de Emergencias</h3>
                 <p className="text-sm text-muted-foreground leading-relaxed">Todos los hospitales nacionales listados cuentan con servicio de emergencias disponible las 24 horas del día.</p>
                 <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <p className="text-xs font-bold text-primary mb-1">CENTRO DE CONTACTO</p>
                    <p className="text-lg font-bold text-foreground">60285415</p>
                 </div>
              </div>
            </div>

            {/* List of Centers */}
            <div className="lg:w-2/3">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCenters.map((center) => (
                    <Card key={center.id} className="rounded-3xl overflow-hidden hover:shadow-2xl transition-all border-none shadow-md bg-white group animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image src={center.image} alt={center.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-4 left-4 bg-secondary/90 backdrop-blur-md text-white text-[10px] px-4 py-1.5 rounded-full font-bold uppercase shadow-lg">
                          {center.province}
                        </div>
                      </div>
                      <CardContent className="p-6 space-y-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-xl leading-tight text-foreground group-hover:text-primary transition-colors">{center.name}</h3>
                          <p className="text-xs font-bold text-muted-foreground/60 uppercase">{center.type}</p>
                        </div>
                        
                        <div className="space-y-3 text-sm text-muted-foreground">
                          <p className="flex items-start gap-3"><MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {center.address}</p>
                          <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary shrink-0" /> {center.phone}</p>
                          <p className="flex items-center gap-3"><Clock className="h-4 w-4 text-primary shrink-0" /> {center.hours}</p>
                        </div>

                        <div className="pt-4 grid grid-cols-2 gap-2">
                           <Button 
                              variant="outline"
                              className="rounded-full h-11 border-primary text-primary hover:bg-primary/5 flex items-center justify-center gap-2 text-xs"
                              onClick={() => openInGoogleMaps(center.mapsQuery)}
                           >
                              <ExternalLink className="h-4 w-4" /> Google Maps
                           </Button>
                           <Button 
                              variant="default"
                              className="rounded-full h-11 bg-secondary hover:bg-secondary/90 flex items-center justify-center gap-2 text-xs"
                              onClick={() => openInWaze(center.mapsQuery)}
                           >
                              <Navigation className="h-4 w-4" /> Abrir en Waze
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
               </div>

               {filteredCenters.length === 0 && (
                 <div className="text-center py-20 space-y-4 bg-white rounded-3xl border shadow-inner">
                    <MapPin className="h-16 w-16 text-muted-foreground/30 mx-auto" />
                    <p className="text-xl font-bold text-muted-foreground">No hay sedes registradas en esta provincia aún.</p>
                 </div>
               )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
