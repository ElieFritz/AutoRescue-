'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Car, Clock, MapPin, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { breakdownsApi } from '@/lib/api';
import { BREAKDOWN_STATUS_LABELS, BREAKDOWN_STATUS_COLORS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function HistoryPage() {
  const [breakdowns, setBreakdowns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Historique</h1>
        <p className="text-muted-foreground">Consultez vos depannages passes</p>
      </div>

      {breakdowns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun historique</h3>
            <p className="text-muted-foreground">Vous n'avez pas encore de depannages</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {breakdowns.map((breakdown, index) => (
            <motion.div
              key={breakdown.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/motorist/breakdown/${breakdown.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <Car className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">{breakdown.title || 'Depannage'}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {formatDate(breakdown.created_at)}
                          </div>
                          {breakdown.address && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-4 w-4" />
                              {breakdown.address}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className={BREAKDOWN_STATUS_COLORS[breakdown.status] || ''}>
                        {BREAKDOWN_STATUS_LABELS[breakdown.status] || breakdown.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
