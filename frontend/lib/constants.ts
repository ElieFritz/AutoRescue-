export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const BREAKDOWN_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  accepted: 'Accept�e',
  mechanic_assigned: 'Garagiste assign�',
  mechanic_on_way: 'Garagiste en route',
  mechanic_arrived: 'Garagiste arriv�',
  diagnosing: 'Diagnostic en cours',
  quote_sent: 'Devis envoy�',
  quote_accepted: 'Devis accept�',
  repairing: 'R�paration en cours',
  completed: 'Termin�',
  cancelled: 'Annul�',
};

export const BREAKDOWN_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  mechanic_assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  mechanic_on_way: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  mechanic_arrived: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  diagnosing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  quote_sent: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  quote_accepted: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  repairing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export const USER_ROLE_LABELS: Record<string, string> = {
  motorist: 'Automobiliste',
  garage: 'Garage / Station',
  mechanic: 'Garagiste',
  admin: 'Administrateur',
};

export const VEHICLE_TYPES = [
  { value: 'car', label: 'Voiture' },
  { value: 'motorcycle', label: 'Moto' },
  { value: 'truck', label: 'Camion' },
  { value: 'van', label: 'Utilitaire' },
  { value: 'bus', label: 'Bus' },
];

export const BREAKDOWN_TYPES = [
  { value: 'battery', label: 'Batterie � plat' },
  { value: 'flat_tire', label: 'Pneu crev�' },
  { value: 'engine', label: 'Probl�me moteur' },
  { value: 'fuel', label: 'Panne d\'essence' },
  { value: 'overheating', label: 'Surchauffe' },
  { value: 'electrical', label: 'Probl�me �lectrique' },
  { value: 'brakes', label: 'Probl�me de freins' },
  { value: 'transmission', label: 'Transmission' },
  { value: 'accident', label: 'Accident' },
  { value: 'other', label: 'Autre' },
];

export const DEFAULT_CENTER = {
  lat: 4.0511,
  lng: 9.7679,
}; // Douala, Cameroon
