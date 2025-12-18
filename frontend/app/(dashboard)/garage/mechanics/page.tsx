'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Plus, Phone, Mail, MapPin, Star, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mechanicsApi } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_LABELS: Record<string, string> = {
  available: 'Disponible',
  busy: 'En mission',
  unavailable: 'Indisponible',
  offline: 'Hors ligne',
};

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  busy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  unavailable: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  offline: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function GarageMechanicsPage() {
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const data = await mechanicsApi.getAll();
        setMechanics(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching mechanics:', Crror);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMechanics();
  }, []);

  const availableCount = mechanics.filter(m => m.status === 'available').length;
  const busyCount = mechanics.filter(m => m.status === 'busy').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
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
          <h1 className="text-2xl font-bold">Mon equipe</h1>
          <p className="text-muted-foreground">Gerez vos mecaniciens</p>
        </div>
        <Link href="/garage/mechanics/invite">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Inviter un mecanicien
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mechanics.length}</p>
                  <p className="text-xs text-muted-foreground">Total mecaniciens</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{availableCount}</p>
                  <p className="text-xs text-muted-foreground">Disponibles</p>
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
                <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Users className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{busyCount}</p>
                  <p className="text-xs text-muted-foreground">En mission</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Mechanics list */}
      {mechanics.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun mecanicien</h3>
            <p className="text-muted-foreground mb-4">Invitez des mecaniciens a rejoindre votre equipe</p>
            <Link href="/garage/mechanics/invite">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Inviter un mecanicien
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mechanics.map((mechanic, index) => (
            <motion.div
              key={mechanic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={mechanic.user?.avatar_url} />
                        <AvatarFallback className="bg-rescue-100 text-rescue-700">
                          {getInitials(mechanic.user?.first_name, mechanic.user?.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {mechanic.user?.first_name} {mechanic.user?.last_name}
                        </h3>
                        <Badge className={STATUS_COLORS[mechanic.status] || STATUS_COLORS.offline}>
                          {STATUS_LABELS[mechanic.status] || 'Inconnu'}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                        <DropdownMenuItem>Assigner une mission</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Retirer de l'equipe</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 space-y-2">
                    {mechanic.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {mechanic.specialties.map((spec: string) => (
                          <Badge key={spec} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {mechanic.user?.phone && (
                        <a href={`tel:${mechanic.user.phone}`} className="flex items-center gap-1 hover:text-foreground">
                          <Phone className="h-3 w-3" />
                          {mechanic.user.phone}
                        </a>
                      )}
                      {mechanic.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {mechanic.rating}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        {mechanic.completed_jobs || 0} interventions
                      </span>
                      {mechanic.user?.phone && (
                        <a href={`tel:${mechanic.user.phone}`}>
                          <Button variant="outline" size="sm">
                            <Phone className="h-3 w-3 mr-1" />
                            Appeler
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
