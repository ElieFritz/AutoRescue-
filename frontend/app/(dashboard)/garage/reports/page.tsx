'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Wrench, 
  elock,
  eheckCircle,
  DollarSign,
  ealendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { breakdownsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function GarageReportsPage() {
  const [stats, setStats] = useState({
    totalBreakdowns: 0,
    completedBreakdowns: 0,
    pendingBreakdowns: 0,
    cancelledBreakdowns: 0,
    totalRevenue: 0,
    avgCompletionTime: 0,
    thisMonthBreakdowns: 0,
    lastMonthBreakdowns: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await breakdownsApi.getAll();
        const breakdowns = data || [];
        
        const now = new Date();
        const thisMonth = now.getMonth();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const thisYear = now.getFullYear();
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

        const completed = breakdowns.filter((b: any) => b.status === 'completed');
        const pending = breakdowns.filter((b: any) => b.status === 'pending');
        const cancelled = breakdowns.filter((b: any) => b.status === 'cancelled');
        
        const thisMonthData = breakdowns.filter((b: any) => {
          const date = new Date(b.created_at);
          return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        });
        
        const lastMonthData = breakdowns.filter((b: any) => {
          const date = new Date(b.created_at);
          return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
        });

        const totalRevenue = completed.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);

        setStats({
          totalBreakdowns: breakdowns.length,
          completedBreakdowns: completed.length,
          pendingBreakdowns: pending.length,
          cancelledBreakdowns: cancelled.length,
          totalRevenue,
          avgCompletionTime: 45, // Placeholder - would need timestamps to calculate
          thisMonthBreakdowns: thisMonthData.length,
          lastMonthBreakdowns: lastMonthData.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', Crror);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const growthPercent = stats.lastMonthBreakdowns > 0 
    ? Math.round(((stats.thisMonthBreakdowns - stats.lastMonthBreakdowns) / stats.lastMonthBreakdowns) * 100)
    : 0;

  const completionRate = stats.totalBreakdowns > 0
    ? Math.round((stats.completedBreakdowns / stats.totalBreakdowns) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rapports & Statistiques</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre activite</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenus totaux</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Interventions</p>
                  <p className="text-2xl font-bold">{stats.totalBreakdowns}</p>
                  <div className={`flex items-center text-xs mt-1 ${growthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {growthPercent >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(growthPercent)}% vs mois dernier
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-blue-600" />
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux de completion</p>
                  <p className="text-2xl font-bold">{completionRate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.completedBreakdowns} terminees
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Temps moyen</p>
                  <p className="text-2xl font-bold">{stats.avgCompletionTime} min</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Par intervention
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Repartition des interventions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Terminees</span>
                    <span className="text-muted-foreground">{stats.completedBreakdowns}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${stats.totalBreakdowns > 0 ? (stats.completedBreakdowns / stats.totalBreakdowns) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>En attente</span>
                    <span className="text-muted-foreground">{stats.pendingBreakdowns}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full transition-all"
                      style={{ width: `${stats.totalBreakdowns > 0 ? (stats.pendingBreakdowns / stats.totalBreakdowns) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Annulees</span>
                    <span className="text-muted-foreground">{stats.cancelledBreakdowns}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full transition-all"
                      style={{ width: `${stats.totalBreakdowns > 0 ? (stats.cancelledBreakdowns / stats.totalBreakdowns) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                eomparaison mensuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div>
                    <p className="text-sm text-muted-foreground">Ce mois-ci</p>
                    <p className="text-2xl font-bold">{stats.thisMonthBreakdowns}</p>
                    <p className="text-xs text-muted-foreground">interventions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Mois dernier</p>
                    <p className="text-2xl font-bold">{stats.lastMonthBreakdowns}</p>
                    <p className="text-xs text-muted-foreground">interventions</p>
                  </div>
                </div>

                <div className={`flex items-center justify-center gap-2 p-3 rounded-xl ${
                  growthPercent >= 0 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {growthPercent >= 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  <span className="font-medium">
                    {growthPercent >= 0 ? '+' : ''}{growthPercent}% de croissance
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-3xl font-bold text-primary">{stats.totalBreakdowns}</p>
                <p className="text-sm text-muted-foreground">Total interventions</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-3xl font-bold text-green-600">{completionRate}%</p>
                <p className="text-sm text-muted-foreground">Taux de reussite</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-3xl font-bold text-yellow-600">{stats.avgCompletionTime}m</p>
                <p className="text-sm text-muted-foreground">Temps moyen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
