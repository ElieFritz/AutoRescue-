-- ============================================
-- AUTORESCUE - ROW LEVEL SECURITY POLICIES
-- Version: 1.0.0
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FONCTIONS HELPER POUR RLS
-- ============================================

-- Obtenir le rôle de l'utilisateur actuel
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Vérifier si l'utilisateur est propriétaire d'un garage
CREATE OR REPLACE FUNCTION auth.owns_garage(garage_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS(SELECT 1 FROM garages WHERE id = garage_id AND owner_id = auth.uid())
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Vérifier si l'utilisateur est mécanicien d'un garage
CREATE OR REPLACE FUNCTION auth.is_mechanic_of_garage(garage_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS(
        SELECT 1 FROM mechanics m 
        WHERE m.garage_id = garage_id AND m.user_id = auth.uid()
    )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- POLICIES: PROFILES
-- ============================================

-- Lecture: Chacun peut voir les profils publics
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Mise à jour: Seulement son propre profil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admin peut tout modifier
CREATE POLICY "Admin can update all profiles"
ON profiles FOR UPDATE
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

-- ============================================
-- POLICIES: VEHICLES
-- ============================================

-- Lecture: Propriétaire ou admin
CREATE POLICY "Users can view own vehicles"
ON vehicles FOR SELECT
USING (owner_id = auth.uid() OR auth.is_admin());

-- Création: Utilisateurs authentifiés
CREATE POLICY "Users can create vehicles"
ON vehicles FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- Mise à jour: Propriétaire uniquement
CREATE POLICY "Users can update own vehicles"
ON vehicles FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Suppression: Propriétaire uniquement
CREATE POLICY "Users can delete own vehicles"
ON vehicles FOR DELETE
USING (owner_id = auth.uid());

-- ============================================
-- POLICIES: GARAGES
-- ============================================

-- Lecture: Tout le monde peut voir les garages actifs
CREATE POLICY "Active garages are viewable by everyone"
ON garages FOR SELECT
USING (status = 'active' OR owner_id = auth.uid() OR auth.is_admin());

-- Création: Utilisateurs avec rôle garage ou admin
CREATE POLICY "Garage owners can create garages"
ON garages FOR INSERT
WITH CHECK (
    auth.user_role() IN ('garage', 'admin')
);

-- Mise à jour: Propriétaire ou admin
CREATE POLICY "Garage owners can update their garages"
ON garages FOR UPDATE
USING (owner_id = auth.uid() OR auth.is_admin())
WITH CHECK (owner_id = auth.uid() OR auth.is_admin());

-- Suppression: Admin uniquement
CREATE POLICY "Only admin can delete garages"
ON garages FOR DELETE
USING (auth.is_admin());

-- ============================================
-- POLICIES: MECHANICS
-- ============================================

-- Lecture: Garage owner, le mécanicien lui-même, ou admin
CREATE POLICY "Mechanics viewable by relevant parties"
ON mechanics FOR SELECT
USING (
    user_id = auth.uid() OR 
    auth.owns_garage(garage_id) OR 
    auth.is_admin()
);

-- Création: Propriétaire du garage ou admin
CREATE POLICY "Garage owners can add mechanics"
ON mechanics FOR INSERT
WITH CHECK (
    auth.owns_garage(garage_id) OR auth.is_admin()
);

-- Mise à jour: Le mécanicien lui-même (pour son statut) ou propriétaire du garage
CREATE POLICY "Mechanics and garage owners can update"
ON mechanics FOR UPDATE
USING (user_id = auth.uid() OR auth.owns_garage(garage_id) OR auth.is_admin())
WITH CHECK (user_id = auth.uid() OR auth.owns_garage(garage_id) OR auth.is_admin());

-- Suppression: Propriétaire du garage ou admin
CREATE POLICY "Garage owners can remove mechanics"
ON mechanics FOR DELETE
USING (auth.owns_garage(garage_id) OR auth.is_admin());

-- ============================================
-- POLICIES: BREAKDOWNS
-- ============================================

-- Lecture: Automobiliste concerné, garage assigné, mécanicien assigné, ou admin
CREATE POLICY "Breakdowns viewable by relevant parties"
ON breakdowns FOR SELECT
USING (
    motorist_id = auth.uid() OR
    auth.owns_garage(garage_id) OR
    (SELECT user_id FROM mechanics WHERE id = mechanic_id) = auth.uid() OR
    auth.is_admin() OR
    -- Les garages peuvent voir les demandes en attente dans leur zone
    (status = 'pending' AND auth.user_role() = 'garage')
);

-- Création: Automobilistes uniquement
CREATE POLICY "Motorists can create breakdowns"
ON breakdowns FOR INSERT
WITH CHECK (
    motorist_id = auth.uid() AND auth.user_role() = 'motorist'
);

-- Mise à jour: Selon le rôle et le contexte
CREATE POLICY "Breakdowns can be updated by relevant parties"
ON breakdowns FOR UPDATE
USING (
    motorist_id = auth.uid() OR
    auth.owns_garage(garage_id) OR
    (SELECT user_id FROM mechanics WHERE id = mechanic_id) = auth.uid() OR
    auth.is_admin()
)
WITH CHECK (
    motorist_id = auth.uid() OR
    auth.owns_garage(garage_id) OR
    (SELECT user_id FROM mechanics WHERE id = mechanic_id) = auth.uid() OR
    auth.is_admin()
);

-- ============================================
-- POLICIES: QUOTES
-- ============================================

-- Lecture: Automobiliste de la panne, garage, mécanicien, admin
CREATE POLICY "Quotes viewable by relevant parties"
ON quotes FOR SELECT
USING (
    EXISTS(
        SELECT 1 FROM breakdowns b 
        WHERE b.id = breakdown_id AND (
            b.motorist_id = auth.uid() OR
            auth.owns_garage(b.garage_id) OR
            (SELECT user_id FROM mechanics WHERE id = b.mechanic_id) = auth.uid()
        )
    ) OR auth.is_admin()
);

-- Création: Mécanicien assigné à la panne
CREATE POLICY "Mechanics can create quotes"
ON quotes FOR INSERT
WITH CHECK (
    (SELECT user_id FROM mechanics WHERE id = mechanic_id) = auth.uid() OR
    auth.is_admin()
);

-- Mise à jour: Mécanicien (modification devis) ou automobiliste (acceptation)
CREATE POLICY "Quotes can be updated by relevant parties"
ON quotes FOR UPDATE
USING (
    (SELECT user_id FROM mechanics WHERE id = mechanic_id) = auth.uid() OR
    EXISTS(
        SELECT 1 FROM breakdowns b 
        WHERE b.id = breakdown_id AND b.motorist_id = auth.uid()
    ) OR
    auth.is_admin()
);

-- ============================================
-- POLICIES: PAYMENTS
-- ============================================

-- Lecture: Payeur, garage concerné, ou admin
CREATE POLICY "Payments viewable by relevant parties"
ON payments FOR SELECT
USING (
    payer_id = auth.uid() OR
    EXISTS(
        SELECT 1 FROM breakdowns b 
        WHERE b.id = breakdown_id AND auth.owns_garage(b.garage_id)
    ) OR
    auth.is_admin()
);

-- Création: Payeur (automobiliste)
CREATE POLICY "Payers can create payments"
ON payments FOR INSERT
WITH CHECK (payer_id = auth.uid());

-- Mise à jour: Admin ou système (webhooks)
CREATE POLICY "Only admin can update payments"
ON payments FOR UPDATE
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

-- ============================================
-- POLICIES: REPORTS
-- ============================================

-- Lecture: Automobiliste, garage, mécanicien, admin
CREATE POLICY "Reports viewable by relevant parties"
ON reports FOR SELECT
USING (
    EXISTS(
        SELECT 1 FROM breakdowns b 
        WHERE b.id = breakdown_id AND (
            b.motorist_id = auth.uid() OR
            auth.owns_garage(b.garage_id) OR
            (SELECT user_id FROM mechanics WHERE id = b.mechanic_id) = auth.uid()
        )
    ) OR auth.is_admin()
);

-- Création: Mécanicien assigné
CREATE POLICY "Mechanics can create reports"
ON reports FOR INSERT
WITH CHECK (
    (SELECT user_id FROM mechanics WHERE id = mechanic_id) = auth.uid() OR
    auth.is_admin()
);

-- Mise à jour: Mécanicien ou automobiliste (signature)
CREATE POLICY "Reports can be updated by relevant parties"
ON reports FOR UPDATE
USING (
    (SELECT user_id FROM mechanics WHERE id = mechanic_id) = auth.uid() OR
    EXISTS(
        SELECT 1 FROM breakdowns b 
        WHERE b.id = breakdown_id AND b.motorist_id = auth.uid()
    ) OR
    auth.is_admin()
);

-- ============================================
-- POLICIES: REVIEWS
-- ============================================

-- Lecture: Tout le monde
CREATE POLICY "Reviews are public"
ON reviews FOR SELECT
USING (true);

-- Création: Automobiliste de la panne terminée
CREATE POLICY "Motorists can create reviews"
ON reviews FOR INSERT
WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS(
        SELECT 1 FROM breakdowns b 
        WHERE b.id = breakdown_id 
        AND b.motorist_id = auth.uid() 
        AND b.status = 'completed'
    )
);

-- Mise à jour: Reviewer (modification) ou garage owner (réponse)
CREATE POLICY "Reviews can be updated"
ON reviews FOR UPDATE
USING (
    reviewer_id = auth.uid() OR
    auth.owns_garage(garage_id) OR
    auth.is_admin()
);

-- ============================================
-- POLICIES: NOTIFICATIONS
-- ============================================

-- Lecture: Destinataire uniquement
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Création: Système (via service role)
CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Mise à jour: Utilisateur (marquer comme lu)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Suppression: Utilisateur
CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- POLICIES: AUDIT_LOGS
-- ============================================

-- Lecture: Admin uniquement
CREATE POLICY "Only admin can view audit logs"
ON audit_logs FOR SELECT
USING (auth.is_admin());

-- Création: Système
CREATE POLICY "System can create audit logs"
ON audit_logs FOR INSERT
WITH CHECK (true);
