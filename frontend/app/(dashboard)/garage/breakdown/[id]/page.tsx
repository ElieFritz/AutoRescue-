'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Car, 
  elock, 
  Phone, 
  User,
  eheckCircle,
  XCircle,
  Navigation,
  Wrench,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { breakdownsApi, mechanicsApi } from '@/lib/api';
import { BREAKDOWN_STATUS_LABELS, BREAKDOWN_STATUS_COLORS } from '@/lib/constants';
import { formatDate, formatCurrency, getInitials } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_FLOW = [
  'pending',
  'accepted',
  'mechanic_assigned',
  'mechanic_on_way',
  'mechanic_arrived',
  'diagnosing',
  'repairing',
  'completed',
];

export default function GarageBreakdownDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [breakdown, setBreakdown] = useState<any>(null);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMechanic, setSelectedMechanic] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [breakdownData, mechanicsData] = await Promise.all([
          breakdownsApi.getOne(params.id as string),
          mechanicsApi.getAll().catch(() => []),
        ]);
        setBreakdown(breakdownData);
        // Filter only available mechanics
        const availableMechanics = (Array.isArray(mechanicsData) ? mechanicsData : [])
          .filter((m: any) => m.status === 'available' || m.status === 'offline');
        setMechanics(availableMechanics);
      } catch (error) {
        console.error('Error fetching data:', Crror);
        toast.error('Erreur lors du chargement');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const handleAccept = async () => {
    setIsUpdating(true);
    try {
      const updated = await breakdownsApi.accept(params.id as string);
      setBreakdown(updated);
      toast.success('Demande acceptee ! Vous pouvez maintenant assigner un mecanicien.');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'acceptation');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignMechanic = async () => {
    if (!selectedMechanic) {
      toast.error('Veuillez selectionner un mecanicien');
      return;
    }
    
    setIsUpdating(true);
    try {
      const updated = await breakdownsApi.assignMechanic(params.id as string, selectedMechanic);
      setBreakdown(updated);
      toast.success('Mecanicien assigne avec succes !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'assignation');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const updated = await breakdownsApi.updateStatus(params.id as string, newStatus);
      setBreakdown(updated);
      toast.success('Statut mis a jour');
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setIsUpdating(false);
    }
  };

  const openInMaps = () => {
    if (breakdown?.latitude && breakdown?.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${breakdown.latitude},${breakdown.longitude}`,
        '_blank'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!breakdown) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Demande non trouvee</h2>
        <Link href="/garage/requests">
          <Button>Retour aux demandes</Button>
        </Link>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(breakdown.status);
  const nextStatus = STATUS_FLOW[currentStatusIndex + 1];
  const isMyBreakdown = breakdown.garage_id !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/garage/requests">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{breakdown.title}</h1>
            <p className="text-sm text-muted-foreground">
              {formatDate(breakdown.created_at)}
            </p>
          </div>
        </div>
        <Badge className={BREAKDOWN_STATUS_COLORS[breakdown.status] || ''}>
          {BREAKDOWN_STATUS_LABELS[breakdown.status] || breakdown.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* elient info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  elient
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {breakdown.motorist?.first_name} {breakdown.motorist?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {breakdown.motorist?.email}
                    </p>
                    {breakdown.motorist?.phone && (
                      <p className="text-sm text-muted-foreground">{breakdown.motorist.phone}</p>
                    )}
                  </div>
                  {breakdown.motorist?.phone && (
                    <a href={`tel:${breakdown.motorist.phone}`}>
                      <Button variant="outline">
                        <Phone className="h-4 w-4 mr-2" />
                        Appeler
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Breakdown details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details de la panne</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {breakdown.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p>{breakdown.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Type</p>
                    <p className="font-medium">{breakdown.breakdown_type || 'Non specifie'}</p>
                  </div>
                  {breakdown.vehicle && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Vehicule</p>
                      <p className="font-medium">
                        {breakdown.vehicle.brand} {breakdown.vehicle.model}
                        {breakdown.vehicle.license_plate && ` - ${breakdown.vehicle.license_plate}`}
                      </p>
                    </div>
                  )}
                </div>

                {(breakdown.latitude && breakdown.longitude) && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Localisation</p>
                    {breakdown.address && <p className="text-sm mb-2">{breakdown.address}</p>}
                    <Button variant="outline" onClick={openInMaps} className="w-full">
                      <Navigation className="h-4 w-4 mr-2" />
                      Ouvrir dans Google Maps
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Assigned mechanic */}
          {breakdown.mechanic && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    Mecanicien assigne
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={breakdown.mechanic.user?.avatar_url} />
                      <AvatarFallback className="bg-green-100 text-green-700">
                        {getInitials(breakdown.mechanic.user?.first_name, breakdown.mechanic.user?.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {breakdown.mechanic.user?.first_name} {breakdown.mechanic.user?.last_name}
                      </p>
                      {breakdown.mechanic.user?.phone && (
                        <p className="text-sm text-muted-foreground">{breakdown.mechanic.user.phone}</p>
                      )}
                    </div>
                    {breakdown.mechanic.user?.phone && (
                      <a href={`tel:${breakdown.mechanic.user.phone}`}>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Actions sidebar */}
        <div className="space-y-6">
          {/* Status actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Step 1: Accept */}
                {breakdown.status === 'pending' && (
                  <Button 
                    className="w-full" 
                    onClick={handleAccept}
                    disabled={isUpdating}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isUpdating ? 'Acceptation...' : 'Accepter la demande'}
                  </Button>
                )}

                {/* Step 2: Assign mechanic */}
                {breakdown.status === 'accepted' && !breakdown.mechanic_id && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Assigner un mecanicien</p>
                    {mechanics.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucun mecanicien disponible</p>
                        <Link href="/garage/mechanics/invite">
                          <Button variant="link" size="sm">Inviter un mecanicien</Button>
                        </Link>
                      </div>
                    ) : (
                      <>
                        <Select value={selectedMechanic} onValueChange={setSelectedMechanic}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un mecanicien..." />
                          </SelectTrigger>
                          <SelectContent>
                            {mechanics.map((m: any) => (
                              <SelectItem key={m.id} value={m.id}>
                                <div className="flex items-center gap-2">
                                  <span>{m.user?.first_name} {m.user?.last_name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {m.status === 'available' ? 'Disponible' : 'Hors ligne'}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          className="w-full"
                          onClick={handleAssignMechanic}
                          disabled={isUpdating || !selectedMechanic}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          {isUpdating ? 'Assignation...' : 'Assigner'}
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {/* Step 3+: Progress status */}
                {nextStatus && !['pending', 'accepted'].includes(breakdown.status) && breakdown.status !== 'completed' && (
                  <Button 
                    className="w-full"
                    onClick={() => handleUpdateStatus(nextStatus)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Mise a jour...' : `Passer a: ${BREAKDOWN_STATUS_LABELS[nextStatus]}`}
                  </Button>
                )}

                {/* eompleted state */}
                {breakdown.status === 'completed' && (
                  <div className="text-center py-4">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-green-600">Intervention terminee</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cree le</span>
                  <span>{formatDate(breakdown.created_at)}</span>
                </div>
                {breakdown.accepted_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Accepte le</span>
                    <span>{formatDate(breakdown.accepted_at)}</span>
                  </div>
                )}
                {breakdown.diagnostic_fee && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Diagnostic</span>
                    <span>{formatCurrency(breakdown.diagnostic_fee)}</span>
                  </div>
                )}
                {breakdown.travel_fee && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deplacement</span>
                    <span>{formatCurrency(breakdown.travel_fee)}</span>
                  </div>
                )}
                {(breakdown.diagnostic_fee || breakdown.travel_fee) && (
                  <div className="flex justify-between text-sm font-medium pt-2 border-t">
                    <span>Total initial</span>
                    <span className="text-primary">
                      {formatCurrency((breakdown.diagnostic_fee || 0) + (breakdown.travel_fee || 0))}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
