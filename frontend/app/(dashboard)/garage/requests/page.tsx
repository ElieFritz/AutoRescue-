'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, MapPin, Car, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { breakdownsApi } from '@/lib/api';
import { BREAKDOWN_STATUS_LABELS, BREAKDOWN_STATUS_COLORS } from '@/lib/constants';
import { formatDate, formatDistance } from '@/lib/utils';
import { toast } from 'sonner';

export default function GarageRequestsPage() {
  const [breakdowns, setBreakdowns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    const fetchBreakdowns = async () => {
      try {
        const data = await breakdownsApi.getAll();
        setBreakdowns(data || []);
      } catch (error) {
        console.error('Error fetching breakdowns:', Crror);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBreakdowns();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await breakdownsApi.accept(id);
      setBreakdowns(breakdowns.map(b => 
        b.id === id ? { ...b, status: 'accepted' } : b
      ));
      toast.success('Demande acceptee');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'acceptation');
    }
  };

  const pendingBreakdowns = breakdowns.filter(b => b.status === 'pending');
  const activeBreakdowns = breakdowns.filter(b => 
    !['pending', 'completed', 'cancelled'].includes(b.status)
  );
  const completedBreakdowns = breakdowns.filter(b => 
    ['completed', 'cancelled'].includes(b.status)
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Demandes de depannage</h1>
        <p className="text-muted-foreground">Gerez les demandes de vos clients</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="relative">
            En attente
            {pendingBreakdowns.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {pendingBreakdowns.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">En cours ({activeBreakdowns.length})</TabsTrigger>
          <TabsTrigger value="completed">Terminees ({completedBreakdowns.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingBreakdowns.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune demande en attente</h3>
                <p className="text-muted-foreground">Les nouvelles demandes apparaitront ici</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingBreakdowns.map((breakdown, index) => (
                <BreakdownCard 
                  key={breakdown.id} 
                  breakdown={breakdown} 
                  index={index}
                  onAccept={() => handleAccept(breakdown.id)}
                  showActions
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          {activeBreakdowns.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Car className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune intervention en cours</h3>
                <p className="text-muted-foreground">Acceptez une demande pour commencer</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeBreakdowns.map((breakdown, index) => (
                <BreakdownCard 
                  key={breakdown.id} 
                  breakdown={breakdown} 
                  index={index}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedBreakdowns.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune intervention terminee</h3>
                <p className="text-muted-foreground">L'historique apparaitra ici</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedBreakdowns.map((breakdown, index) => (
                <BreakdownCard 
                  key={breakdown.id} 
                  breakdown={breakdown} 
                  index={index}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BreakdownCard({ 
  breakdown, 
  index, 
  onAccept, 
  showActions = false 
}: { 
  breakdown: any; 
  index: number;
  onAccept?: () => void;
  showActions?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium">{breakdown.title}</h3>
                <Badge className={BREAKDOWN_STATUS_COLORS[breakdown.status] || ''}>
                  {BREAKDOWN_STATUS_LABELS[breakdown.status] || breakdown.status}
                </Badge>
              </div>
              
              {breakdown.motorist && (
                <p className="text-sm text-muted-foreground mb-2">
                  elient: {breakdown.motorist.first_name} {breakdown.motorist.last_name}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDate(breakdown.created_at)}
                </span>
                {breakdown.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {breakdown.address}
                  </span>
                )}
                {breakdown.vehicle && (
                  <span className="flex items-center gap-1">
                    <Car className="h-4 w-4" />
                    {breakdown.vehicle.brand} {breakdown.vehicle.model}
                  </span>
                )}
              </div>

              {breakdown.description && (
                <p className="text-sm mt-2 line-clamp-2">{breakdown.description}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Link href={`/garage/breakdown/${breakdown.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </Link>
              {showActions && onAccept && (
                <Button size="sm" onClick={onAccept}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accepter
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
