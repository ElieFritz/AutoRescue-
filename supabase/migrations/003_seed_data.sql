-- ============================================
-- AUTORESCUE - DONNÉES DE TEST (SEED)
-- Version: 1.0.0
-- ============================================

-- Note: Ce fichier est pour le développement uniquement
-- Ne pas exécuter en production

-- ============================================
-- GARAGES DE DÉMONSTRATION (Cameroun)
-- ============================================

-- Insérer des garages de test à Douala et Yaoundé
INSERT INTO garages (
    id, name, description, address, city, postal_code, country,
    location, phone, email, specialties, services,
    diagnostic_fee, travel_fee_per_km, status, is_verified
) VALUES
-- Douala
(
    '11111111-1111-1111-1111-111111111111',
    'AutoService Express Douala',
    'Garage moderne spécialisé dans les véhicules européens et asiatiques',
    '123 Rue de la Liberté, Akwa',
    'Douala',
    'BP 1234',
    'Cameroun',
    ST_SetSRID(ST_MakePoint(9.7085, 4.0511), 4326)::geography,
    '+237 233 456 789',
    'contact@autoservice-douala.cm',
    ARRAY['European cars', 'Asian cars', 'Diagnostics'],
    ARRAY['Dépannage', 'Réparation moteur', 'Électricité auto', 'Climatisation'],
    5000.00,
    500.00,
    'active',
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Méca Pro Bonabéri',
    'Spécialiste des véhicules utilitaires et camions',
    '45 Boulevard Bonabéri',
    'Douala',
    'BP 5678',
    'Cameroun',
    ST_SetSRID(ST_MakePoint(9.6842, 4.0728), 4326)::geography,
    '+237 233 789 012',
    'info@mecapro-bonaberi.cm',
    ARRAY['Trucks', 'Vans', 'Diesel engines'],
    ARRAY['Dépannage', 'Mécanique générale', 'Injection diesel', 'Freinage'],
    7500.00,
    600.00,
    'active',
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'Flash Auto Bonamoussadi',
    'Service rapide pour toutes marques',
    '78 Carrefour Bonamoussadi',
    'Douala',
    'BP 9012',
    'Cameroun',
    ST_SetSRID(ST_MakePoint(9.7456, 4.0865), 4326)::geography,
    '+237 233 012 345',
    'flashauto@gmail.com',
    ARRAY['All brands', 'Quick service'],
    ARRAY['Vidange express', 'Pneus', 'Batterie', 'Dépannage'],
    4000.00,
    450.00,
    'active',
    true
),

-- Yaoundé
(
    '44444444-4444-4444-4444-444444444444',
    'Garage Central Yaoundé',
    'Le plus grand garage du centre-ville',
    '234 Avenue Kennedy, Centre',
    'Yaoundé',
    'BP 3456',
    'Cameroun',
    ST_SetSRID(ST_MakePoint(11.5021, 3.8480), 4326)::geography,
    '+237 222 345 678',
    'garage.central@yaounde.cm',
    ARRAY['All brands', 'Body work', 'Painting'],
    ARRAY['Dépannage', 'Carrosserie', 'Peinture', 'Mécanique générale'],
    6000.00,
    550.00,
    'active',
    true
),
(
    '55555555-5555-5555-5555-555555555555',
    'TechniAuto Bastos',
    'Expertise en véhicules haut de gamme',
    '12 Rue des Ambassades, Bastos',
    'Yaoundé',
    'BP 7890',
    'Cameroun',
    ST_SetSRID(ST_MakePoint(11.5156, 3.8765), 4326)::geography,
    '+237 222 678 901',
    'techniauto.bastos@gmail.com',
    ARRAY['Luxury cars', 'German cars', 'Electronics'],
    ARRAY['Dépannage VIP', 'Diagnostic électronique', 'Entretien premium'],
    10000.00,
    800.00,
    'active',
    true
),
(
    '66666666-6666-6666-6666-666666666666',
    'Moto Plus Yaoundé',
    'Spécialiste motos et deux-roues',
    '56 Route Nsimeyong',
    'Yaoundé',
    'BP 1122',
    'Cameroun',
    ST_SetSRID(ST_MakePoint(11.4897, 3.8312), 4326)::geography,
    '+237 222 901 234',
    'motoplus.yaounde@gmail.com',
    ARRAY['Motorcycles', 'Scooters'],
    ARRAY['Dépannage moto', 'Entretien', 'Pièces détachées'],
    3000.00,
    300.00,
    'active',
    true
);

-- ============================================
-- HORAIRES D'OUVERTURE PAR DÉFAUT
-- ============================================

UPDATE garages SET opening_hours = '{
    "monday": {"open": "08:00", "close": "18:00"},
    "tuesday": {"open": "08:00", "close": "18:00"},
    "wednesday": {"open": "08:00", "close": "18:00"},
    "thursday": {"open": "08:00", "close": "18:00"},
    "friday": {"open": "08:00", "close": "18:00"},
    "saturday": {"open": "08:00", "close": "14:00"},
    "sunday": {"open": null, "close": null}
}'::jsonb;

-- ============================================
-- COMMENTAIRE: UTILISATEURS ET MÉCANICIENS
-- ============================================
-- Les utilisateurs de test seront créés via l'API d'authentification
-- Les mécaniciens seront associés aux garages après création des utilisateurs

-- Pour créer des utilisateurs de test, utilisez l'API:
-- POST /api/auth/register avec les rôles appropriés

-- Exemple de données pour tests manuels:
-- 
-- Automobiliste:
-- email: test.motorist@autorescue.cm
-- role: motorist
--
-- Propriétaire garage:
-- email: garage.owner@autorescue.cm  
-- role: garage
--
-- Mécanicien:
-- email: mechanic@autorescue.cm
-- role: mechanic
--
-- Admin:
-- email: admin@autorescue.cm
-- role: admin
