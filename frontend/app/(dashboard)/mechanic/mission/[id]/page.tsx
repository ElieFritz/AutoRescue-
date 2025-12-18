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
  Wrench
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { breakdownsApi } from '@/lib/api';
import { BREAKDOWN_STATUS_LABELS, BREAKDOWN_STATUS_COLORS } from '@/lib/constants';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_FLOW = [
  'mechanic_assigned',
  'mechanic_on_way',
  'mechanic_arrived',
  'diagnosing',
  'repairing',
  'completed',
];

export default function MechanicMissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [mission, setMission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchMission = async () => {
      try {
        const data = await breakdownsApi.getOne(params.id as string);
        setMission(data);
      } catch (error) {
        console.error('Error fetching mission:', Crror);
        toast.error('Erreur lors du chargement');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchMission();
    }
  }, [params.id]);

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await breakdownsApi.updateStatus(params.id as string, newStatus);
      setMission({ ...mission, status: newStatus });
      toast.success('Statut mis a jour');
      
      if (newStatus === 'completed') {
        router.push('/mechanic');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setIsUpdating(false);
    }
  };

  const openInMaps = () => {
    if (mission?.latitude && mission?.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${mission.latitude},${mission.longitude}`,
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

  if (!mission) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Mission non trouvee</h2>
        <Link href="/mechanic">
          <Button>Retour au tableau de bord</Button>
        </Link>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(mission.status);
  const nextStatus = STATUS_FLOW[currentStatusIndex + 1];

  const getNextActionButton = () => {
    switch (mission.status) {
      case 'mechanic_assigned':
        return { label: 'Partir en intervention', status: 'mechanic_on_way' };
      case 'mechanic_on_way':
        return { label: 'Je suis arrive', status: 'mechanic_arrived' };
      case 'mechanic_arrived':
        return { label: 'Commencer le diagnostic', status: 'diagnosing' };
      case 'diagnosing':
        return { label: 'Commencer la reparation', status: 'repairing' };
      case 'repairing':
        return { label: 'Terminer l\'intervention', status: 'completed' };
      default:
        return null;
    }
  };

  const nextAction = getNextActionButton();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/mechanic">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{mission.title}</h1>
            <p className="text-sm text-muted-foreground">
              {formatDate(mission.created_at)}
            </p>
          </div>
        </div>
        <Badge className={BREAKDOWN_STATUS_COLORS[mission.status] || ''}>
          {BREAKDOWN_STATUS_LABELS[mission.status] || mission.status}
        </Badge>
      </div>

      {/* Quick actions */}
      {nextAction && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-primary bg-primary/5">
            <CardContent className="p-4">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => handleUpdateStatus(nextAction.status)}
                disabled={isUpdating}
              >
                {isUpdating ? 'Mise a jour...' : nextAction.label}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* elient info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
                  {mission.motorist?.first_name} {mission.motorist?.last_name}
                </p>
                {mission.motorist?.phone && (
                  <p className="text-sm text-muted-foreground">{mission.motorist.phone}</p>
                )}
              </div>
              <div className="flex gap-2">
                {mission.motorist?.phone && (
                  <a href={`tel:${mission.motorist.phone}`}>
                    <Button variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Appeler
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Location */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mission.address && (
              <p className="text-muted-foreground mb-4">{mission.address}</p>
            )}
            {(mission.latitude && mission.longitude) && (
              <Button onClick={openInMaps} className="w-full">
                <Navigation className="h-4 w-4 mr-2" />
                Ouvrir dans Google Maps
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Details de la panne
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mission.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p>{mission.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Type</p>
                <p className="font-medium">{mission.breakdown_type || 'Non specifie'}</p>
              </div>
              {mission.vehicle && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Vehicule</p>
                  <p className="font-medium">
                    {mission.vehicle.brand} {mission.vehicle.model}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* eompleted state */}
      {mission.status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">
                Mission terminee !
              </h3>
              <p className="text-muted-foreground">
                Merci pour votre intervention
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
