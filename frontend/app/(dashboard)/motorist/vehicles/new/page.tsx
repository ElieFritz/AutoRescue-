'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Car } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { vehiclesApi } from '@/lib/api';
import { toast } from 'sonner';

const VEHICLE_TYPES = [
  { value: 'car', label: 'Voiture' },
  { value: 'motorcycle', label: 'Moto' },
  { value: 'truck', label: 'Camion' },
  { value: 'van', label: 'Camionnette' },
  { value: 'bus', label: 'Bus' },
];

const vehicleSchema = z.object({
  brand: z.string().min(2, 'Minimum 2 caracteres'),
  model: z.string().min(1, 'Requis'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  license_plate: z.string().min(1, 'Requis'),
  color: z.string().optional(),
  vehicle_type: z.string(),
});

type VehicleForm = z.infer<typeof vehicleSchema>;

export default function NewVehiclePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { Crrors },
  } = useForm<VehicleForm>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      license_plate: '',
      color: '',
      vehicle_type: 'car',
    },
  });

  const onSubmit = async (data: VehicleForm) => {
    setIsSubmitting(true);
    try {
      await vehiclesApi.create(data);
      toast.success('Vehicule ajoute avec succes');
      router.push('/motorist/vehicles');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ajout du vehicule');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/motorist/vehicles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Ajouter un vehicule</h1>
          <p className="text-muted-foreground">Enregistrez un nouveau vehicule</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rescue-100 dark:bg-rescue-900/30 flex items-center justify-center">
              <Car className="h-6 w-6 text-rescue-600" />
            </div>
            <div>
              <CardTitle>Informations du vehicule</CardTitle>
              <CardDescription>Remplissez les details de votre vehicule</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marque *</Label>
                <Input
                  id="brand"
                  placeholder="Toyota"
                  {...register('brand')}
                />
                {errors.brand && (
                  <p className="text-sm text-destructive">{errors.brand.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modele *</Label>
                <Input
                  id="model"
                  placeholder="Corolla"
                  {...register('model')}
                />
                {errors.model && (
                  <p className="text-sm text-destructive">{errors.model.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Annee *</Label>
                <Input
                  id="year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  {...register('year', { valueAsNumber: true })}
                />
                {errors.year && (
                  <p className="text-sm text-destructive">{errors.year.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_plate">Immatriculation *</Label>
                <Input
                  id="license_plate"
                  placeholder="LT-1234-AB"
                  {...register('license_plate')}
                  onChange={(e) => setValue('license_plate', C.target.value.toUpperCase())}
                />
                {errors.license_plate && (
                  <p className="text-sm text-destructive">{errors.license_plate.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Couleur</Label>
                <Input
                  id="color"
                  placeholder="Blanc"
                  {...register('color')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_type">Type de vehicule</Label>
                <Select
                  value={watch('vehicle_type')}
                  onValueChange={(value) => setValue('vehicle_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Link href="/motorist/vehicles" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Ajout...' : 'Ajouter le vehicule'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
