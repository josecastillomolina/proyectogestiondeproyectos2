export interface CentroSalud {
  id: string;
  nombre: string;
  tipo: 'Hospital Nacional' | 'Hospital Regional' | 'EBAIS' | 'Clínica';
  provincia: string;
  direccion: string;
  telefono: string;
  horario: string;
  coordenadas: { lat: number, lng: number };
  imagen: string;
}

export const CENTROS_SALUD: CentroSalud[] = [
  // San José
  {
    id: 'h-mexico',
    nombre: 'Hospital México',
    tipo: 'Hospital Nacional',
    provincia: 'San José',
    direccion: 'La Uruca, San José',
    telefono: '2242-6700',
    horario: '24 Horas',
    coordenadas: { lat: 9.9472, lng: -84.1114 },
    imagen: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=200&fit=crop'
  },
  {
    id: 'h-sj-dios',
    nombre: 'Hospital San Juan de Dios',
    tipo: 'Hospital Nacional',
    provincia: 'San José',
    direccion: 'Paseo Colón, San José',
    telefono: '2257-6282',
    horario: '24 Horas',
    coordenadas: { lat: 9.9333, lng: -84.0854 },
    imagen: 'https://images.unsplash.com/photo-1586773860418-d319a221f52c?w=400&h=200&fit=crop'
  },
  {
    id: 'h-calderon',
    nombre: 'Hospital Calderón Guardia',
    tipo: 'Hospital Nacional',
    provincia: 'San José',
    direccion: 'Barrio Aranjuez, San José',
    telefono: '2212-1000',
    horario: '24 Horas',
    coordenadas: { lat: 9.9385, lng: -84.0722 },
    imagen: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=400&h=200&fit=crop'
  },
  {
    id: 'h-ninos',
    nombre: 'Hospital de Niños',
    tipo: 'Hospital Nacional',
    provincia: 'San José',
    direccion: 'Paseo Colón, Calle 22, San José',
    telefono: '2258-2173',
    horario: '24 Horas',
    coordenadas: { lat: 9.9337, lng: -84.0888 },
    imagen: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=200&fit=crop'
  },
  {
    id: 'h-psiquiatrico',
    nombre: 'Hospital Psiquiátrico',
    tipo: 'Hospital Nacional',
    provincia: 'San José',
    direccion: 'Pavas, San José',
    telefono: '2232-2155',
    horario: '24 Horas',
    coordenadas: { lat: 9.9392, lng: -84.1256 },
    imagen: 'https://images.unsplash.com/photo-1576091160550-2173dad99901?w=400&h=200&fit=crop'
  },
  {
    id: 'ebais-sj-centro',
    nombre: 'EBAIS San José Centro',
    tipo: 'EBAIS',
    provincia: 'San José',
    direccion: 'Calle 10, Ave 6 y 8, San José',
    telefono: '2221-5122',
    horario: '7:00 AM - 4:00 PM',
    coordenadas: { lat: 9.9312, lng: -84.0812 },
    imagen: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=200&fit=crop'
  },
  // Alajuela
  {
    id: 'h-sj-alajuela',
    nombre: 'Hospital San Rafael de Alajuela',
    tipo: 'Hospital Nacional',
    provincia: 'Alajuela',
    direccion: 'Radial Francisco Orlich, Alajuela',
    telefono: '2436-1000',
    horario: '24 Horas',
    coordenadas: { lat: 10.0031, lng: -84.2058 },
    imagen: 'https://images.unsplash.com/photo-1538108149393-fdfd81895907?w=400&h=200&fit=crop'
  },
  {
    id: 'h-san-ramon',
    nombre: 'Hospital Carlos Luis Valverde',
    tipo: 'Hospital Regional',
    provincia: 'Alajuela',
    direccion: 'San Ramón, Alajuela',
    telefono: '2456-9700',
    horario: '24 Horas',
    coordenadas: { lat: 10.0881, lng: -84.4705 },
    imagen: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400&h=200&fit=crop'
  },
  {
    id: 'ebais-alajuela-norte',
    nombre: 'EBAIS Alajuela Norte',
    tipo: 'EBAIS',
    provincia: 'Alajuela',
    direccion: 'Barrio San José, Alajuela',
    telefono: '2441-2133',
    horario: '7:00 AM - 4:00 PM',
    coordenadas: { lat: 10.0123, lng: -84.2154 },
    imagen: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=200&fit=crop'
  },
  {
    id: 'ebais-alajuela-sur',
    nombre: 'EBAIS Alajuela Sur',
    tipo: 'EBAIS',
    provincia: 'Alajuela',
    direccion: 'Villa Bonita, Alajuela',
    telefono: '2442-9088',
    horario: '7:00 AM - 4:00 PM',
    coordenadas: { lat: 9.9981, lng: -84.2123 },
    imagen: 'https://images.unsplash.com/photo-1586773860418-d319a221f52c?w=400&h=200&fit=crop'
  },
  // Cartago
  {
    id: 'h-max-peralta',
    nombre: 'Hospital Dr. Max Peralta',
    tipo: 'Hospital Nacional',
    provincia: 'Cartago',
    direccion: 'Centro de Cartago',
    telefono: '2550-6400',
    horario: '24 Horas',
    coordenadas: { lat: 9.8644, lng: -83.9194 },
    imagen: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=400&h=200&fit=crop'
  },
  {
    id: 'h-william-allen',
    nombre: 'Hospital William Allen',
    tipo: 'Hospital Regional',
    provincia: 'Cartago',
    direccion: 'Turrialba, Cartago',
    telefono: '2556-4322',
    horario: '24 Horas',
    coordenadas: { lat: 9.9044, lng: -83.6822 },
    imagen: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=200&fit=crop'
  },
  {
    id: 'ebais-cartago-centro',
    nombre: 'EBAIS Cartago Centro',
    tipo: 'EBAIS',
    provincia: 'Cartago',
    direccion: 'Barrio El Molino, Cartago',
    telefono: '2552-0122',
    horario: '7:00 AM - 4:00 PM',
    coordenadas: { lat: 9.8623, lng: -83.9212 },
    imagen: 'https://images.unsplash.com/photo-1576091160550-2173dad99901?w=400&h=200&fit=crop'
  },
  // Heredia
  {
    id: 'h-sv-paul',
    nombre: 'Hospital San Vicente de Paúl',
    tipo: 'Hospital Nacional',
    provincia: 'Heredia',
    direccion: 'Heredia Centro',
    telefono: '2261-0000',
    horario: '24 Horas',
    coordenadas: { lat: 9.9922, lng: -84.1167 },
    imagen: 'https://images.unsplash.com/photo-1538108149393-fdfd81895907?w=400&h=200&fit=crop'
  },
  {
    id: 'ebais-heredia-centro',
    nombre: 'EBAIS Heredia Centro',
    tipo: 'EBAIS',
    provincia: 'Heredia',
    direccion: 'Heredia Centro',
    telefono: '2237-6031',
    horario: '7:00 AM - 4:00 PM',
    coordenadas: { lat: 9.9981, lng: -84.1212 },
    imagen: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=200&fit=crop'
  },
  {
    id: 'ebais-sto-domingo',
    nombre: 'EBAIS Santo Domingo',
    tipo: 'EBAIS',
    provincia: 'Heredia',
    direccion: 'Santo Domingo, Heredia',
    telefono: '2244-1122',
    horario: '7:00 AM - 4:00 PM',
    coordenadas: { lat: 9.9823, lng: -84.0888 },
    imagen: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=200&fit=crop'
  },
  // Guanacaste
  {
    id: 'h-baltodano',
    nombre: 'Hospital Enrique Baltodano',
    tipo: 'Hospital Regional',
    provincia: 'Guanacaste',
    direccion: 'Liberia, Guanacaste',
    telefono: '2690-2300',
    horario: '24 Horas',
    coordenadas: { lat: 10.6358, lng: -85.4411 },
    imagen: 'https://images.unsplash.com/photo-1586773860418-d319a221f52c?w=400&h=200&fit=crop'
  },
  {
    id: 'h-anexion',
    nombre: 'Hospital La Anexión',
    tipo: 'Hospital Regional',
    provincia: 'Guanacaste',
    direccion: 'Nicoya, Guanacaste',
    telefono: '2685-5066',
    horario: '24 Horas',
    coordenadas: { lat: 10.1472, lng: -85.4514 },
    imagen: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=400&h=200&fit=crop'
  },
  {
    id: 'ebais-liberia',
    nombre: 'EBAIS Liberia',
    tipo: 'EBAIS',
    provincia: 'Guanacaste',
    direccion: 'Centro de Liberia',
    telefono: '2666-0211',
    horario: '7:00 AM - 4:00 PM',
    coordenadas: { lat: 10.6312, lng: -85.4388 },
    imagen: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=200&fit=crop'
  },
  // Puntarenas
  {
    id: 'h-monseñor',
    nombre: 'Hospital Monseñor Sanabria',
    tipo: 'Hospital Regional',
    provincia: 'Puntarenas',
    direccion: 'El Roble, Puntarenas',
    telefono: '2630-1200',
    horario: '24 Horas',
    coordenadas: { lat: 9.9722, lng: -84.7356 },
    imagen: 'https://images.unsplash.com/photo-1576091160550-2173dad99901?w=400&h=200&fit=crop'
  },
  {
    id: 'h-neilly',
    nombre: 'Hospital Ciudad Neilly',
    tipo: 'Hospital Regional',
    provincia: 'Puntarenas',
    direccion: 'Ciudad Neilly, Puntarenas',
    telefono: '2783-3111',
    horario: '24 Horas',
    coordenadas: { lat: 8.6472, lng: -82.9411 },
    imagen: 'https://images.unsplash.com/photo-1538108149393-fdfd81895907?w=400&h=200&fit=crop'
  },
  {
    id: 'ebais-puntarenas-centro',
    nombre: 'EBAIS Puntarenas Centro',
    tipo: 'EBAIS',
    provincia: 'Puntarenas',
    direccion: 'Calle Central, Puntarenas',
    telefono: '2661-2233',
    horario: '7:00 AM - 4:00 PM',
    coordenadas: { lat: 9.9767, lng: -84.8312 },
    imagen: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=200&fit=crop'
  },
  // Limón
  {
    id: 'h-tony-facio',
    nombre: 'Hospital Tony Facio',
    tipo: 'Hospital Regional',
    provincia: 'Limón',
    direccion: 'Centro de Limón',
    telefono: '2758-2222',
    horario: '24 Horas',
    coordenadas: { lat: 9.9972, lng: -83.0256 },
    imagen: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400&h=200&fit=crop'
  },
  {
    id: 'ebais-limon-centro',
    nombre: 'EBAIS Limón Centro',
    tipo: 'EBAIS',
    provincia: 'Limón',
    direccion: 'Av 2, Calle 4, Limón',
    telefono: '2758-0122',
    horario: '7:00 AM - 4:00 PM',
    coordenadas: { lat: 9.9912, lng: -83.0212 },
    imagen: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=200&fit=crop'
  }
];
