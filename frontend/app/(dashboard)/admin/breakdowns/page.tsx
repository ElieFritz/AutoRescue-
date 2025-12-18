'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Search, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { breakdownsApi } from '@/lib/api';
import { BREAKDOWN_STATUS_LABELS, BREAKDOWN_STATUS_COLORS } from '@/lib/constants';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function AdminBreakdownsPage() {
  const [breakdowns, setBreakdowns] = useState<any[]>([]);
  const [filteredBreakdowns, setFilteredBreakdowns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchBreakdowns = async () => {
      try {
        const data = await breakdownsApi.getAll();
        setBreakdowns(Array.isArray(data) ? data : []);
        setFilteredBreakdowns(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching breakdowns:', Crror);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBreakdowns();
  }, []);

  useEffect(() => {
    let result = breakdowns;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.title?.toLowerCase().includes(query) ||
        b.motorist?.first_name?.toLowerCase().includes(query) ||
        b.motorist?.last_name?.toLowerCase().includes(query) ||
        b.garage?.name?.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(b => b.status === statusFilter);
    }
    
    setFilteredBreakdowns(result);
  }, [searchQuery, statusFilter, breakdowns]);

  const stats = {
    pending: breakdowns.filter(b => b.status === 'pending').length,
    inProgress: breakdowns.filter(b => !['pending', 'completed', 'cancelled'].includes(b.status)).length,
    completed: breakdowns.filter(b => b.status === 'completed').length,
    cancelled: breakdowns.filter(b => b.status === 'cancelled').length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestion des interventions</h1>
        <p className="text-muted-foreground">{breakdowns.length} interventions au total</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Car className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
              <p className="text-xs text-muted-foreground">En cours</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Terminees</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{stats.cancelled}</p>
              <p className="text-xs text-muted-foreground">Annulees</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="accepted">Accepte</SelectItem>
            <SelectItem value="mechanic_assigned">Mecanicien assigne</SelectItem>
            <SelectItem value="mechanic_on_way">En route</SelectItem>
            <SelectItem value="completed">Termine</SelectItem>
            <SelectItem value="cancelled">Annule</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredBreakdowns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune intervention</h3>
            <p className="text-muted-foreground">Aucune intervention ne correspond a votre recherche</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredBreakdowns.map((breakdown, index) => (
                <motion.div
                  key={breakdown.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between p-4 hover:bg-accent/50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      breakdown.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                      breakdown.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30' :
                      breakdown.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <Car className={`h-5 w-5 ${
                        breakdown.status === 'completed' ? 'text-green-600' :
                        breakdown.status === 'cancelled' ? 'text-red-600' :
                        breakdown.status === 'pending' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{breakdown.title || 'Intervention'}</p>
                      <p className="text-sm text-muted-foreground">
                        elient: {breakdown.motorist?.first_name} {breakdown.motorist?.last_name}
                        {breakdown.garage?.name && ` - Garage: ${breakdown.garage.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={BREAKDOWN_STATUS_COLORS[breakdown.status] || ''}>
                      {BREAKDOWN_STATUS_LABELS[breakdown.status] || breakdown.status}
                    </Badge>
                    {breakdown.total_amount && (
                      <span className="font-medium">{formatCurrency(breakdown.total_amount)}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(breakdown.created_at)}
                    </span>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
