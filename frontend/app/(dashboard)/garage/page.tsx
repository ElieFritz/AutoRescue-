'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Users, TrendingUp, ArrowRight, AlertCircle, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth-store';
import { garagesApi, breakdownsApi, mechanicsApi } from '@/lib/api';
import { BREAKDOWN_STATUS_LABELS, BREAKDOWN_STATUS_COLORS } from '@/lib/constants';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function GarageDashboard() {
  const { user } = useAuthStore();
  const [myGarages, setMyGarages] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    revenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch garages owned by user
        const garages = await garagesApi.getAll();
        const myGaragesList = garages?.data?.filter((g: any) => g.owner_id === user?.id) || [];
        setMyGarages(myGaragesList);

        if (myGaragesList.length > 0) {
          const garageId = myGaragesList[0].id;
          
          // Fetch pending requests
          const pending = await breakdownsApi.getPendingForGarage(garageId);
          setPendingRequests(pending || []);

          // Fetch mechanics
          const mechanicsList = await mechanicsApi.getByGarage(garageId);
          setMechanics(mechanicsList || []);

          // ealculate stats
          const allBreakdowns = await breakdownsApi.getByGarage(garageId);
          const data = allBreakdowns?.data || [];
          
          setStats({
            pending: data.filter((b: any) => b.status === 'pending').length,
            inProgress: data.filter((b: any) => 
              !['pending', 'completed', 'cancelled'].includes(b.status)
            ).length,
            completed: data.filter((b: any) => b.status === 'completed').length,
            revenue: data
              .filter((b: any) => b.status === 'completed')
              .reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0),
          });
        }
      } catch (error) {
        console.error('Error fetching data:', Crror);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">
          Bienvenue, {user?.first_name || 'Garagiste'} 👋
        </h1>
        <p className="text-muted-foreground">
          {myGarages.length > 0 ? myGarages[0].name : 'Gerez votre garage'}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">En attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">En cours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Termines</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
                  <p className="text-xs text-muted-foreground">Revenus</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pending requests alert */}
      {pendingRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-warning bg-warning/10">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="font-medium">{pendingRequests.length} demande(s) en attente</p>
                  <p className="text-sm text-muted-foreground">
                    Des automobilistes ont besoin de votre aide
                  </p>
                </div>
              </div>
              <Link href="/garage/requests">
                <Button>
                  Voir les demandes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Demandes recentes</CardTitle>
              <Link href="/garage/requests">
                <Button variant="ghost" size="sm">
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune demande en attente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.slice(0, 3).map((request: any) => (
                    <Link
                      key={request.id}
                      href={`/garage/breakdown/${request.id}`}
                      className="block p-4 rounded-xl border hover:bg-accent transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{request.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.motorist?.first_name} {request.motorist?.last_name}
                          </p>
                        </div>
                        <Badge className={BREAKDOWN_STATUS_COLORS[request.status]}>
                          {BREAKDOWN_STATUS_LABELS[request.status]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(request.created_at)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Mon equipe</CardTitle>
              <Link href="/garage/mechanics">
                <Button variant="ghost" size="sm">
                  Gerer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {mechanics.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Aucun mecanicien dans votre equipe
                  </p>
                  <Link href="/garage/mechanics/invite">
                    <Button>Inviter un mecanicien</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {mechanics.slice(0, 4).map((mechanic: any) => (
                    <div
                      key={mechanic.id}
                      className="flex items-center justify-between p-3 rounded-xl border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {mechanic.user?.first_name} {mechanic.user?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {mechanic.specialties?.join(', ') || 'Mecanicien'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={mechanic.status === 'available' ? 'default' : 'secondary'}>
                        {mechanic.status === 'available' ? 'Disponible' : 'En mission'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
