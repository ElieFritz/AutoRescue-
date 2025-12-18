'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Shield, 
  Bell, 
  Mail,
  Globe,
  Database,
  Save,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'AutoRescue',
    siteDescription: 'Plateforme de depannage automobile',
    contactEmail: 'contact@authelp.com',
    supportPhone: '+237 6XX XXX XXX',
  });

  const [featureFlags, setFeatureFlags] = useState({
    registrationEnabled: true,
    garageApprovalRequired: true,
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
  });

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Parametres generaux enregistres');
    setIsSaving(false);
  };

  const handleSaveFeatures = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('Parametres des fonctionnalites enregistres');
    setIsSaving(false);
  };

  const handleClearCache = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Cache vide avec succes');
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Parametres systeme</h1>
        <p className="text-muted-foreground">Configuration globale de la plateforme</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Fonctionnalites</TabsTrigger>
          <TabsTrigger value="system">Systeme</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Informations generales
                </CardTitle>
                <CardDescription>
                  eonfiguration de base de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nom du site</Label>
                    <Input
                      id="siteName"
                      value={generalSettings.siteName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email de contact</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={generalSettings.contactEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Description</Label>
                  <Input
                    id="siteDescription"
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Telephone support</Label>
                  <Input
                    id="supportPhone"
                    value={generalSettings.supportPhone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, supportPhone: e.target.value })}
                  />
                </div>

                <Button onClick={handleSaveGeneral} disabled={isSaving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="features" className="mt-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Fonctionnalites
                </CardTitle>
                <CardDescription>
                  Activer ou desactiver des fonctionnalites
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Inscription ouverte</p>
                    <p className="text-sm text-muted-foreground">
                      Permettre aux nouveaux utilisateurs de s'inscrire
                    </p>
                  </div>
                  <Switch
                    checked={featureFlags.registrationEnabled}
                    onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, registrationEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Approbation des garages</p>
                    <p className="text-sm text-muted-foreground">
                      Les garages doivent etre approuves par un admin
                    </p>
                  </div>
                  <Switch
                    checked={featureFlags.garageApprovalRequired}
                    onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, garageApprovalRequired: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-orange-600">Mode maintenance</p>
                    <p className="text-sm text-muted-foreground">
                      Desactiver l'acces a la plateforme
                    </p>
                  </div>
                  <Switch
                    checked={featureFlags.maintenanceMode}
                    onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, maintenanceMode: checked })}
                  />
                </div>

                <hr />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notifications email</p>
                    <p className="text-sm text-muted-foreground">
                      Envoyer des emails de notification
                    </p>
                  </div>
                  <Switch
                    checked={featureFlags.emailNotifications}
                    onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, CmailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notifications SMS</p>
                    <p className="text-sm text-muted-foreground">
                      Envoyer des SMS de notification
                    </p>
                  </div>
                  <Switch
                    checked={featureFlags.smsNotifications}
                    onCheckedChange={(checked) => setFeatureFlags({ ...featureFlags, smsNotifications: checked })}
                  />
                </div>

                <Button onClick={handleSaveFeatures} disabled={isSaving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="system" className="mt-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Maintenance systeme
                </CardTitle>
                <CardDescription>
                  Operations de maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <h4 className="font-medium mb-2">Vider le cache</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supprime les donnees en cache pour forcer le rechargement
                  </p>
                  <Button variant="outline" onClick={handleClearCache} disabled={isSaving}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
                    Vider le cache
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-muted/50">
                  <h4 className="font-medium mb-2">Informations systeme</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version</span>
                      <span>1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Environnement</span>
                      <span>Production</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base de donnees</span>
                      <span className="text-green-600">Connectee</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">API Backend</span>
                      <span className="text-green-600">En ligne</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
