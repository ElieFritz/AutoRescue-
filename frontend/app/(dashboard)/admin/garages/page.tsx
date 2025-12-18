'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, MoreVertical, MapPin, Phone, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { garagesApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminGaragesPage() {
  const [garages, setGarages] = useState<any[]>([]);
  const [filteredGarages, setFilteredGarages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchGarages = async () => {
      try {
        const data = await garagesApi.getAll();
        setGarages(Array.isArray(data) ? data : []);
        setFilteredGarages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching garages:', Crror);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGarages();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredGarages(garages.filter(g => 
        g.name?.toLowerCase().includes(query) ||
        g.address?.toLowerCase().includes(query)
      ));
    } else {
      setFilteredGarages(garages);
    }
  }, [searchQuery, garages]);

  const handleToggleActive = async (garageId: string, currentStatus: boolean) => {
    try {
      await garagesApi.update(garageId, { is_active: !currentStatus });
      setGarages(garages.map(g => 
        g.id === garageId ? { ...g, is_active: !currentStatus } : g
      ));
      toast.success('Statut mis a jour');
    } catch (error) {
      toast.error('Erreur lors de la mise a jour');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
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
      <div>
        <h1 className="text-2xl font-bold">Gestion des garages</h1>
        <p className="text-muted-foreground">{garages.length} garages enregistres</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un garage..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredGarages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun garage</h3>
            <p className="text-muted-foreground">Aucun garage ne correspond a votre recherche</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGarages.map((garage, index) => (
            <motion.div
              key={garage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={garage.is_active === false ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{garage.name}</h3>
                        <Badge variant={garage.is_active !== false ? 'default' : 'secondary'}>
                          {garage.is_active !== false ? 'Actif' : 'Inactif'}
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
                        <DropdownMenuItem>Voir les details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(garage.id, garage.is_active !== false)}>
                          {garage.is_active !== false ? 'Desactiver' : 'Activer'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 text-sm">
                    {garage.address && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {garage.address}
                      </div>
                    )}
                    {garage.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {garage.phone}
                      </div>
                    )}
                    {garage.rating && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {garage.rating} / 5
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      {garage.owner?.first_name} {garage.owner?.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {garage.created_at && `Depuis ${formatDate(garage.created_at)}`}
                    </span>
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
