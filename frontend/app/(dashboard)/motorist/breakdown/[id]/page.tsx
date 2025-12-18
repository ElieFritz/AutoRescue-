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
  MessageSquare,
  eheckCircle,
  XCircle,
  Navigation,
  User,
  Wrench
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { breakdownsApi } from '@/lib/api';
import { BREAKDOWN_STATUS_LABELS, BREAKDOWN_STATUS_COLORS } from '@/lib/constants';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function BreakdownDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [breakdown, setBreakdown] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBreakdown = async () => {
    try {
      const data = await breakdownsApi.getOne(params.id as string);
      setBreakdown(data);
    } catch (error) {
      console.error('Error fetching breakdown:', Crror);
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchBreakdown();
    }
  }, [params.id]);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await breakdownsApi.cancel(params.id as string, 'Annule par l\'utilisateur');
      toast.success('Demande annulee');
      router.push('/motorist');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'annulation');
    } finally {
      setIsCancelling(false);
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
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
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
        <Link href="/motorist">
          <Button>Retour au tableau de bord</Button>
        </Link>
      </div>
    );
  }

  const isActive = !['completed', 'cancelled'].includes(breakdown.status);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/motorist">
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

      {/* Status Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statut de la demande</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatusStep 
                icon={Clock} 
                title="Demande envoyee" 
                date={breakdown.created_at}
                isCompleted={true}
                isActive={breakdown.status === 'pending'}
              />
              <StatusStep 
                icon={CheckCircle} 
                title="Acceptee par le garage" 
                date={breakdown.accepted_at}
                isCompleted={!!breakdown.accepted_at}
                isActive={breakdown.status === 'accepted'}
              />
              <StatusStep 
                icon={Navigation} 
                title="Mecanicien en route" 
                isCompleted={['mechanic_on_way', 'mechanic_arrived', 'diagnosing', 'repairing', 'completed'].includes(breakdown.status)}
                isActive={breakdown.status === 'mechanic_on_way'}
              />
              <StatusStep 
                icon={Wrench} 
                title="Intervention en cours" 
                isCompleted={['repairing', 'completed'].includes(breakdown.status)}
                isActive={['diagnosing', 'repairing'].includes(breakdown.status)}
              />
              <StatusStep 
                icon={CheckCircle} 
                title="Termine" 
                date={breakdown.completed_at}
                isCompleted={breakdown.status === 'completed'}
                isActive={false}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
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
                <p className="text-sm text-muted-foreground mb-1">Type de panne</p>
                <p className="font-medium">{breakdown.breakdown_type || 'Non specifie'}</p>
              </div>
              {breakdown.vehicle && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Vehicule</p>
                  <p className="font-medium">
                    {breakdown.vehicle.brand} {breakdown.vehicle.model}
                  </p>
                </div>
              )}
            </div>

            {(breakdown.latitude && breakdown.longitude) && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Localisation</p>
                <Button variant="outline" onClick={openInMaps} className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  Voir sur la carte
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Garage Info */}
      {breakdown.garage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Garage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{breakdown.garage.name}</p>
                  <p className="text-sm text-muted-foreground">{breakdown.garage.address}</p>
                </div>
                {breakdown.garage.phone && (
                  <a href={`tel:${breakdown.garage.phone}`}>
                    <Button variant="outline" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* eosts */}
      {(breakdown.diagnostic_fee || breakdown.total_amount) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Couts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {breakdown.diagnostic_fee && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frais de diagnostic</span>
                  <span>{formatCurrency(breakdown.diagnostic_fee)}</span>
                </div>
              )}
              {breakdown.travel_fee && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frais de deplacement</span>
                  <span>{formatCurrency(breakdown.travel_fee)}</span>
                </div>
              )}
              {breakdown.total_amount && (
                <div className="flex justify-between pt-2 border-t font-medium">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(breakdown.total_amount)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Actions */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4"
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex-1">
                <XCircle className="h-4 w-4 mr-2" />
                Annuler la demande
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Annuler la demande ?</AlertDialogTitle>
                <AlertDialogDescription>
                  eette action est irreversible. Vous pouvez creer une nouvelle demande si necessaire.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Non, garder</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel} disabled={isCancelling}>
                  {isCancelling ? 'Annulation...' : 'Oui, annuler'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      )}
    </div>
  );
}

function StatusStep({ 
  icon: Icon, 
  title, 
  date, 
  isCompleted, 
  isActive 
}: { 
  icon: any; 
  title: string; 
  date?: string; 
  isCompleted: boolean; 
  isActive: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 ${!isCompleted && !isActive ? 'opacity-40' : ''}`}>
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center
        ${isCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 
          isActive ? 'bg-primary/10 text-primary animate-pulse' : 
          'bg-muted text-muted-foreground'}
      `}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className={`font-medium ${isActive ? 'text-primary' : ''}`}>{title}</p>
        {date && (
          <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
        )}
      </div>
      {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
    </div>
  );
}
