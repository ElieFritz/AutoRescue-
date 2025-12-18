'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Car, Plus, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    color: '',
    vehicle_type: 'car',
  });

  const fetchVehicles = async () => {
    try {
      const data = await vehiclesApi.getAll();
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', Crror);
      toast.error('Erreur lors du chargement des vehicules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedVehicle) {
        await vehiclesApi.update(selectedVehicle.id, formData);
        toast.success('Vehicule modifie avec succes');
      } else {
        await vehiclesApi.create(formData);
        toast.success('Vehicule ajoute avec succes');
      }
      setShowAddDialog(false);
      setSelectedVehicle(null);
      resetForm();
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'operation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVehicle) return;
    setIsSubmitting(true);

    try {
      await vehiclesApi.delete(selectedVehicle.id);
      toast.success('Vehicule supprime avec succes');
      setShowDeleteDialog(false);
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      license_plate: vehicle.license_plate,
      color: vehicle.color || '',
      vehicle_type: vehicle.vehicle_type,
    });
    setShowAddDialog(true);
  };

  const openDeleteDialog = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      license_plate: '',
      color: '',
      vehicle_type: 'car',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Mes vehicules</h1>
          <p className="text-muted-foreground">Gerez vos vehicules enregistres</p>
        </div>
        <Button onClick={() => { resetForm(); setSelectedVehicle(null); setShowAddDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un vehicule
        </Button>
      </div>

      {/* Vehicles grid */}
      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun vehicule</h3>
            <p className="text-muted-foreground mb-4">Ajoutez votre premier vehicule pour commencer</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un vehicule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rescue-100 dark:bg-rescue-900/30 flex items-center justify-center">
                      <Car className="h-5 w-5 text-rescue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{vehicle.brand} {vehicle.model}</CardTitle>
                      <p className="text-sm text-muted-foreground">{vehicle.license_plate}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Annee</span>
                      <span>{vehicle.year}</span>
                    </div>
                    {vehicle.color && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Couleur</span>
                        <span>{vehicle.color}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type</span>
                      <Badge variant="outline">
                        {VEHICLE_TYPES.find(t => t.value === vehicle.vehicle_type)?.label || vehicle.vehicle_type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(vehicle)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => openDeleteDialog(vehicle)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedVehicle ? 'Modifier le vehicule' : 'Ajouter un vehicule'}</DialogTitle>
            <DialogDescription>
              {selectedVehicle ? 'Modifiez les informations du vehicule' : 'Remplissez les informations de votre vehicule'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marque</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Toyota"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modele</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Corolla"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Annee</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_plate">Immatriculation</Label>
                  <Input
                    id="license_plate"
                    value={formData.license_plate}
                    onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
                    placeholder="LT-1234-AB"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Couleur</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Blanc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle_type">Type</Label>
                  <Select
                    value={formData.vehicle_type}
                    onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : (selectedVehicle ? 'Modifier' : 'Ajouter')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le vehicule</DialogTitle>
            <DialogDescription>
              Etes-vous sur de vouloir supprimer {selectedVehicle?.brand} {selectedVehicle?.model} ({selectedVehicle?.license_plate}) ?
              eette action est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
