# ?? AutoRescue

**Plateforme de dépannage automobile géolocalisé**

AutoRescue est une application complète permettant aux automobilistes de trouver rapidement des services de dépannage à proximité, et aux garages/mécaniciens de gérer leurs interventions.

## ?? Fonctionnalités

### Pour les Automobilistes
- ?? Géolocalisation et recherche de garages à proximité
- ?? Création de demandes de dépannage en temps réel
- ?? Gestion des véhicules
- ?? Paiement sécurisé via NotchPay
- ?? Historique des interventions

### Pour les Garages
- ?? Tableau de bord de gestion
- ????? Gestion des mécaniciens
- ?? Suivi des demandes de dépannage
- ?? Rapports et statistiques

### Pour les Mécaniciens
- ?? Réception des missions en temps réel
- ??? Navigation vers le client
- ? Validation des interventions
- ?? Rapports de mission

## ??? Technologies

### Backend
- **Framework**: NestJS
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: JWT avec refresh tokens
- **Documentation API**: Swagger
- **Temps réel**: WebSocket

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Cartographie**: Leaflet

## ?? Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Configurer les variables d'environnement
npm run dev
```

## ?? Variables d'environnement

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
API_PREFIX=api

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# NotchPay
NOTCHPAY_PUBLIC_KEY=your_notchpay_public_key
NOTCHPAY_SECRET_KEY=your_notchpay_secret_key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## ?? Documentation API

Une fois le backend lancé, accédez à la documentation Swagger :
```
http://localhost:3001/docs
```

## ?? Rôles utilisateurs

| Rôle | Description |
|------|-------------|
| `motorist` | Automobiliste - peut créer des demandes de dépannage |
| `garage` | Propriétaire de garage - gère son établissement et ses mécaniciens |
| `mechanic` | Mécanicien - reçoit et exécute les missions |
| `admin` | Administrateur - accès complet à la plateforme |

## ?? Structure du projet

```
AutoRescue/
??? backend/                 # API NestJS
?   ??? src/
?   ?   ??? auth/           # Authentification
?   ?   ??? users/          # Gestion utilisateurs
?   ?   ??? vehicles/       # Gestion véhicules
?   ?   ??? garages/        # Gestion garages
?   ?   ??? mechanics/      # Gestion mécaniciens
?   ?   ??? breakdowns/     # Demandes de dépannage
?   ?   ??? payments/       # Paiements NotchPay
?   ?   ??? notifications/  # Notifications temps réel
?   ?   ??? common/         # Utilitaires partagés
?   ??? ...
??? frontend/               # Application Next.js
?   ??? app/               # Pages (App Router)
?   ??? components/        # Composants React
?   ??? stores/            # State Zustand
?   ??? lib/               # Utilitaires
?   ??? ...
??? supabase/              # Migrations SQL
    ??? migrations/
```

## ?? Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## ?? Licence

Ce projet est sous licence MIT.

## ????? Auteur

**ElieFritz** - [GitHub](https://github.com/ElieFritz)

---

? N'hésitez pas à mettre une étoile si ce projet vous a été utile !
