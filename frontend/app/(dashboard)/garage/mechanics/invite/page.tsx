'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Send, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { mechanicsApi } from '@/lib/api';
import { toast } from 'sonner';

export default function InviteMechanicPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error('L\'email est requis');
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, this would send an invitation email
      await mechanicsApi.invite(formData);
      toast.success('Invitation envoyee avec succes');
      router.push('/garage/mechanics');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/garage/mechanics">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Inviter un mecanicien</h1>
          <p className="text-muted-foreground">Ajoutez un nouveau membre a votre equipe</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rescue-100 dark:bg-rescue-900/30 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-rescue-600" />
            </div>
            <div>
              <CardTitle>Informations du mecanicien</CardTitle>
              <CardDescription>
                Une invitation sera envoyee par email
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="mecanicien@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, Cmail: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prenom</Label>
                <Input
                  id="firstName"
                  placeholder="Jean"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  placeholder="Dupont"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telephone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+237 6XX XXX XXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message personnalise (optionnel)</Label>
              <Textarea
                id="message"
                placeholder="Bonjour, je vous invite a rejoindre mon equipe..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Link href="/garage/mechanics" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  'Envoi...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer l'invitation
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Comment ca fonctionne ?</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Le mecanicien recevra un email d'invitation</li>
                <li>Il pourra creer son compte ou se connecter</li>
                <li>Une fois accepte, il apparaitra dans votre equipe</li>
                <li>Vous pourrez lui assigner des missions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
