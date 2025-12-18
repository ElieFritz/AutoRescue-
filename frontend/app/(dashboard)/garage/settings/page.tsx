'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Building2, 
  elock, 
  MapPin, 
  Phone, 
  Mail,
  ereditCard,
  Bell,
  Shield,
  Save
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { garagesApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

export default function GarageSettingsPage() {
  const { user } = useAuthStore();
  const [garage, setGarage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    diagnostic_fee: 5000,
    travel_fee: 2000,
    opening_time: '08:00',
    closing_time: '18:00',
  });

  const [notifications, setNotifications] = useState({
    newRequests: true,
    requestUpdates: true,
    payments: true,
    marketing: false,
  });

  useEffect(() => {
    const fetchGarage = async () => {
      try {
        const garages = await garagesApi.getAll();
        const myGarage = (garages || []).find((g: any) => g.owner_id === user?.id);
        if (myGarage) {
          setGarage(myGarage);
          setFormData({
            name: myGarage.name || '',
            description: myGarage.description || '',
            address: myGarage.address || '',
            phone: myGarage.phone || '',
            email: myGarage.email || '',
            diagnostic_fee: myGarage.diagnostic_fee || 5000,
            travel_fee: myGarage.travel_fee || 2000,
            opening_time: myGarage.opening_time || '08:00',
            closing_time: myGarage.closing_time || '18:00',
          });
        }
      } catch (error) {
        console.error('Error fetching garage:', Crror);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGarage();
  }, [user?.id]);

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    try {
      if (garage) {
        await garagesApi.update(garage.id, formData);
        toast.success('Parametres enregistres');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    toast.success('Preferences de notifications enregistrees');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Parametres du garage</h1>
        <p className="text-muted-foreground">Gerez les parametres de votre garage</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Tarification</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informations du garage
                </CardTitle>
                <CardDescription>
                  Informations affichees aux clients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du garage</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Mon Garage Auto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Decrivez votre garage et vos services..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Rue du Garage, Yaounde"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telephone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+237 6XX XXX XXX"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, Cmail: e.target.value })}
                        placeholder="contact@garage.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="opening">Heure d'ouverture</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="opening"
                        type="time"
                        value={formData.opening_time}
                        onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closing">Heure de fermeture</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="closing"
                        type="time"
                        value={formData.closing_time}
                        onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveGeneral} disabled={isSaving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="pricing" className="mt-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Tarification
                </CardTitle>
                <CardDescription>
                  Definissez vos tarifs de base
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnostic_fee">Frais de diagnostic (XAF)</Label>
                  <Input
                    id="diagnostic_fee"
                    type="number"
                    value={formData.diagnostic_fee}
                    onChange={(e) => setFormData({ ...formData, diagnostic_fee: parseInt(e.target.value) || 0 })}
                    placeholder="5000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Montant facture pour le diagnostic initial
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travel_fee">Frais de deplacement (XAF)</Label>
                  <Input
                    id="travel_fee"
                    type="number"
                    value={formData.travel_fee}
                    onChange={(e) => setFormData({ ...formData, travel_fee: parseInt(e.target.value) || 0 })}
                    placeholder="2000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Montant de base pour le deplacement
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm font-medium mb-2">Apercu pour le client</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Diagnostic</span>
                      <span>{formData.diagnostic_fee.toLocaleString()} XAF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deplacement</span>
                      <span>{formData.travel_fee.toLocaleString()} XAF</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Total initial</span>
                      <span className="text-primary">
                        {(formData.diagnostic_fee + formData.travel_fee).toLocaleString()} XAF
                      </span>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveGeneral} disabled={isSaving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Enregistrement...' : 'Enregistrer les tarifs'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Gerez vos preferences de notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Nouvelles demandes</p>
                    <p className="text-sm text-muted-foreground">
                      Recevoir une notification pour chaque nouvelle demande
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newRequests}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newRequests: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mises a jour des demandes</p>
                    <p className="text-sm text-muted-foreground">
                      ehangements de statut et messages clients
                    </p>
                  </div>
                  <Switch
                    checked={notifications.requestUpdates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, requestUpdates: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Paiements</p>
                    <p className="text-sm text-muted-foreground">
                      Confirmations de paiement recus
                    </p>
                  </div>
                  <Switch
                    checked={notifications.payments}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, payments: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Communications marketing</p>
                    <p className="text-sm text-muted-foreground">
                      Nouveautes et offres speciales
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                  />
                </div>

                <Button onClick={handleSaveNotifications} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer les preferences
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
