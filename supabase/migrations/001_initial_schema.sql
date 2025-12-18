-- ============================================
-- AUTORESCUE - SCHÉMA DE BASE DE DONNÉES
-- Version: 1.0.0
-- ============================================

-- Extension pour la géolocalisation
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ÉNUMÉRATIONS
-- ============================================

CREATE TYPE user_role AS ENUM ('motorist', 'garage', 'mechanic', 'admin');

CREATE TYPE breakdown_status AS ENUM (
    'pending',           -- En attente d'acceptation
    'accepted',          -- Acceptée par garage
    'mechanic_assigned', -- Garagiste assigné
    'mechanic_on_way',   -- Garagiste en route
    'mechanic_arrived',  -- Garagiste arrivé
    'diagnosing',        -- Diagnostic en cours
    'quote_sent',        -- Devis envoyé
    'quote_accepted',    -- Devis accepté
    'repairing',         -- Réparation en cours
    'completed',         -- Terminé
    'cancelled'          -- Annulé
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'refunded'
);

CREATE TYPE payment_type AS ENUM (
    'diagnostic',        -- Frais de diagnostic + déplacement
    'repair'             -- Frais de réparation
);

CREATE TYPE vehicle_type AS ENUM (
    'car',
    'motorcycle',
    'truck',
    'van',
    'bus'
);

CREATE TYPE garage_status AS ENUM (
    'active',
    'inactive',
    'suspended'
);

CREATE TYPE mechanic_status AS ENUM (
    'available',
    'on_mission',
    'offline'
);

-- ============================================
-- TABLE: PROFILES (extension de auth.users)
-- ============================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'motorist',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ============================================
-- TABLE: VEHICLES (véhicules des automobilistes)
-- ============================================

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER,
    license_plate VARCHAR(20),
    vehicle_type vehicle_type DEFAULT 'car',
    color VARCHAR(50),
    vin VARCHAR(50),
    fuel_type VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicles_owner ON vehicles(owner_id);

-- ============================================
-- TABLE: GARAGES (stations/garages)
-- ============================================

CREATE TABLE garages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Cameroun',
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    logo_url TEXT,
    cover_image_url TEXT,
    opening_hours JSONB DEFAULT '{}',
    specialties TEXT[] DEFAULT '{}',
    services TEXT[] DEFAULT '{}',
    rating DECIMAL(2, 1) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    diagnostic_fee DECIMAL(10, 2) DEFAULT 5000,
    travel_fee_per_km DECIMAL(10, 2) DEFAULT 500,
    status garage_status DEFAULT 'active',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index géospatial pour les recherches de proximité
CREATE INDEX idx_garages_location ON garages USING GIST(location);
CREATE INDEX idx_garages_status ON garages(status);
CREATE INDEX idx_garages_city ON garages(city);

-- ============================================
-- TABLE: MECHANICS (garagistes)
-- ============================================

CREATE TABLE mechanics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    garage_id UUID NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
    specialties TEXT[] DEFAULT '{}',
    current_location GEOGRAPHY(POINT, 4326),
    status mechanic_status DEFAULT 'offline',
    rating DECIMAL(2, 1) DEFAULT 0,
    total_missions INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, garage_id)
);

CREATE INDEX idx_mechanics_garage ON mechanics(garage_id);
CREATE INDEX idx_mechanics_status ON mechanics(status);
CREATE INDEX idx_mechanics_location ON mechanics USING GIST(current_location);

-- ============================================
-- TABLE: BREAKDOWNS (demandes de dépannage)
-- ============================================

CREATE TABLE breakdowns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(20) UNIQUE NOT NULL,
    motorist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    garage_id UUID REFERENCES garages(id) ON DELETE SET NULL,
    mechanic_id UUID REFERENCES mechanics(id) ON DELETE SET NULL,
    
    -- Localisation
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT,
    
    -- Description de la panne
    title VARCHAR(255) NOT NULL,
    description TEXT,
    breakdown_type VARCHAR(100),
    photos TEXT[] DEFAULT '{}',
    
    -- Statut et suivi
    status breakdown_status DEFAULT 'pending',
    
    -- Tarification
    diagnostic_fee DECIMAL(10, 2),
    travel_fee DECIMAL(10, 2),
    distance_km DECIMAL(10, 2),
    
    -- Timestamps
    accepted_at TIMESTAMPTZ,
    mechanic_assigned_at TIMESTAMPTZ,
    mechanic_departed_at TIMESTAMPTZ,
    mechanic_arrived_at TIMESTAMPTZ,
    diagnosis_started_at TIMESTAMPTZ,
    quote_sent_at TIMESTAMPTZ,
    quote_accepted_at TIMESTAMPTZ,
    repair_started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_breakdowns_motorist ON breakdowns(motorist_id);
CREATE INDEX idx_breakdowns_garage ON breakdowns(garage_id);
CREATE INDEX idx_breakdowns_mechanic ON breakdowns(mechanic_id);
CREATE INDEX idx_breakdowns_status ON breakdowns(status);
CREATE INDEX idx_breakdowns_location ON breakdowns USING GIST(location);
CREATE INDEX idx_breakdowns_reference ON breakdowns(reference);

-- ============================================
-- TABLE: QUOTES (devis)
-- ============================================

CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    breakdown_id UUID NOT NULL REFERENCES breakdowns(id) ON DELETE CASCADE,
    mechanic_id UUID NOT NULL REFERENCES mechanics(id) ON DELETE CASCADE,
    
    -- Détails du devis
    items JSONB NOT NULL DEFAULT '[]',
    labor_cost DECIMAL(10, 2) DEFAULT 0,
    parts_cost DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Temps estimé
    estimated_duration_hours DECIMAL(4, 1),
    
    -- Statut
    is_accepted BOOLEAN,
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Validité
    valid_until TIMESTAMPTZ,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotes_breakdown ON quotes(breakdown_id);

-- ============================================
-- TABLE: PAYMENTS (paiements)
-- ============================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(50) UNIQUE NOT NULL,
    breakdown_id UUID NOT NULL REFERENCES breakdowns(id) ON DELETE CASCADE,
    payer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Type et montant
    payment_type payment_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XAF',
    
    -- NotchPay
    notchpay_reference VARCHAR(100),
    notchpay_transaction_id VARCHAR(100),
    
    -- Statut
    status payment_status DEFAULT 'pending',
    
    -- Métadonnées
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_breakdown ON payments(breakdown_id);
CREATE INDEX idx_payments_payer ON payments(payer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_reference ON payments(reference);

-- ============================================
-- TABLE: REPORTS (rapports de mission)
-- ============================================

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    breakdown_id UUID NOT NULL REFERENCES breakdowns(id) ON DELETE CASCADE,
    mechanic_id UUID NOT NULL REFERENCES mechanics(id) ON DELETE CASCADE,
    
    -- Type de rapport
    report_type VARCHAR(50) NOT NULL, -- 'diagnostic', 'intermediate', 'final'
    
    -- Contenu
    title VARCHAR(255) NOT NULL,
    description TEXT,
    findings TEXT,
    recommendations TEXT,
    
    -- Médias
    photos TEXT[] DEFAULT '{}',
    documents TEXT[] DEFAULT '{}',
    
    -- Signature
    motorist_signature_url TEXT,
    signed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_breakdown ON reports(breakdown_id);

-- ============================================
-- TABLE: REVIEWS (avis clients)
-- ============================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    breakdown_id UUID NOT NULL REFERENCES breakdowns(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    garage_id UUID REFERENCES garages(id) ON DELETE CASCADE,
    mechanic_id UUID REFERENCES mechanics(id) ON DELETE CASCADE,
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    
    -- Réponse du garage
    response TEXT,
    responded_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(breakdown_id, reviewer_id)
);

CREATE INDEX idx_reviews_garage ON reviews(garage_id);
CREATE INDEX idx_reviews_mechanic ON reviews(mechanic_id);

-- ============================================
-- TABLE: NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    
    -- Référence optionnelle
    reference_type VARCHAR(50),
    reference_id UUID,
    
    -- Statut
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    -- Métadonnées
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================
-- TABLE: AUDIT_LOGS (logs d'audit)
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================
-- FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour générer une référence unique
CREATE OR REPLACE FUNCTION generate_breakdown_reference()
RETURNS VARCHAR(20) AS $$
DECLARE
    new_ref VARCHAR(20);
    exists_ref BOOLEAN;
BEGIN
    LOOP
        new_ref := 'AR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                   UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
        SELECT EXISTS(SELECT 1 FROM breakdowns WHERE reference = new_ref) INTO exists_ref;
        EXIT WHEN NOT exists_ref;
    END LOOP;
    RETURN new_ref;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer une référence de paiement
CREATE OR REPLACE FUNCTION generate_payment_reference()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_ref VARCHAR(50);
    exists_ref BOOLEAN;
BEGIN
    LOOP
        new_ref := 'PAY-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MISS') || '-' || 
                   UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        SELECT EXISTS(SELECT 1 FROM payments WHERE reference = new_ref) INTO exists_ref;
        EXIT WHEN NOT exists_ref;
    END LOOP;
    RETURN new_ref;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer la distance entre deux points (Haversine)
CREATE OR REPLACE FUNCTION calculate_distance_km(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
    R DOUBLE PRECISION := 6371; -- Rayon de la Terre en km
    dlat DOUBLE PRECISION;
    dlon DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    dlat := RADIANS(lat2 - lat1);
    dlon := RADIANS(lon2 - lon1);
    a := SIN(dlat/2) * SIN(dlat/2) + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlon/2) * SIN(dlon/2);
    c := 2 * ATAN2(SQRT(a), SQRT(1-a));
    RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour trouver les garages à proximité
CREATE OR REPLACE FUNCTION find_nearby_garages(
    user_lat DOUBLE PRECISION,
    user_lon DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 10,
    max_results INTEGER DEFAULT 20
)
RETURNS TABLE (
    garage_id UUID,
    garage_name VARCHAR(255),
    distance_km DOUBLE PRECISION,
    diagnostic_fee DECIMAL(10, 2),
    travel_fee DECIMAL(10, 2),
    rating DECIMAL(2, 1)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id AS garage_id,
        g.name AS garage_name,
        ST_Distance(
            g.location::geography,
            ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
        ) / 1000 AS distance_km,
        g.diagnostic_fee,
        g.travel_fee_per_km * (ST_Distance(
            g.location::geography,
            ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
        ) / 1000) AS travel_fee,
        g.rating
    FROM garages g
    WHERE g.status = 'active'
    AND ST_DWithin(
        g.location::geography,
        ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
        radius_km * 1000
    )
    ORDER BY distance_km ASC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger à toutes les tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garages_updated_at BEFORE UPDATE ON garages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mechanics_updated_at BEFORE UPDATE ON mechanics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_breakdowns_updated_at BEFORE UPDATE ON breakdowns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour générer automatiquement la référence breakdown
CREATE OR REPLACE FUNCTION set_breakdown_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reference IS NULL THEN
        NEW.reference := generate_breakdown_reference();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_breakdown_reference
    BEFORE INSERT ON breakdowns
    FOR EACH ROW EXECUTE FUNCTION set_breakdown_reference();

-- Trigger pour générer automatiquement la référence payment
CREATE OR REPLACE FUNCTION set_payment_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reference IS NULL THEN
        NEW.reference := generate_payment_reference();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_payment_reference
    BEFORE INSERT ON payments
    FOR EACH ROW EXECUTE FUNCTION set_payment_reference();

-- Trigger pour mettre à jour les statistiques du garage après un avis
CREATE OR REPLACE FUNCTION update_garage_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE garages
        SET 
            rating = (SELECT AVG(rating) FROM reviews WHERE garage_id = NEW.garage_id),
            total_reviews = (SELECT COUNT(*) FROM reviews WHERE garage_id = NEW.garage_id)
        WHERE id = NEW.garage_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_garage_rating
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    WHEN (NEW.garage_id IS NOT NULL)
    EXECUTE FUNCTION update_garage_rating();

-- Trigger pour mettre à jour les statistiques du mécanicien
CREATE OR REPLACE FUNCTION update_mechanic_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE mechanics
        SET 
            rating = (SELECT AVG(rating) FROM reviews WHERE mechanic_id = NEW.mechanic_id),
            total_missions = (SELECT COUNT(*) FROM breakdowns WHERE mechanic_id = NEW.mechanic_id AND status = 'completed')
        WHERE id = NEW.mechanic_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mechanic_rating
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    WHEN (NEW.mechanic_id IS NOT NULL)
    EXECUTE FUNCTION update_mechanic_stats();

-- ============================================
-- FONCTION: Créer un profil après inscription
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'motorist')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
