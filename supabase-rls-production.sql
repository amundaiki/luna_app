-- Production RLS Policies for Luna CRM
-- Kjør dette ETTER at hovedskriptet er kjørt, når du har satt opp proper authentication

-- Først, slett de permissive demo-policies
DROP POLICY IF EXISTS "Allow all access to customers" ON customers;
DROP POLICY IF EXISTS "Allow all access to users" ON users;
DROP POLICY IF EXISTS "Allow all access to leads" ON leads;
DROP POLICY IF EXISTS "Allow all access to campaigns" ON campaigns;
DROP POLICY IF EXISTS "Allow all access to ad_sets" ON ad_sets;
DROP POLICY IF EXISTS "Allow all access to ads" ON ads;
DROP POLICY IF EXISTS "Allow all access to contact_attempts" ON contact_attempts;
DROP POLICY IF EXISTS "Allow all access to appointments" ON appointments;
DROP POLICY IF EXISTS "Allow all access to campaign_metrics" ON campaign_metrics;
DROP POLICY IF EXISTS "Allow all access to audit_logs" ON audit_logs;

-- Opprett production RLS policies
-- Disse krever at JWT inneholder korrekte claims (customer_id, user_id, role)

-- Customers policies
CREATE POLICY "Users can view their own customer" ON customers
    FOR SELECT USING (
        id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
    );

CREATE POLICY "Owners can update their customer" ON customers
    FOR UPDATE USING (
        id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
        AND COALESCE(auth.jwt() ->> 'role', '') = 'owner'
    );

-- Users policies  
CREATE POLICY "Users can view users in their customer" ON users
    FOR SELECT USING (
        customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (
        id::text = COALESCE(auth.jwt() ->> 'user_id', '')
    );

CREATE POLICY "Owners and managers can manage users" ON users
    FOR ALL USING (
        customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
        AND COALESCE(auth.jwt() ->> 'role', '') IN ('owner', 'manager')
    );

-- Leads policies
CREATE POLICY "Users can view leads in their customer" ON leads
    FOR SELECT USING (
        customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
    );

CREATE POLICY "Users can create leads for their customer" ON leads
    FOR INSERT WITH CHECK (
        customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
    );

CREATE POLICY "Users can update leads in their customer" ON leads
    FOR UPDATE USING (
        customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
    );

CREATE POLICY "Owners and managers can delete leads" ON leads
    FOR DELETE USING (
        customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
        AND COALESCE(auth.jwt() ->> 'role', '') IN ('owner', 'manager')
    );

-- Campaigns policies
CREATE POLICY "Users can view campaigns in their customer" ON campaigns
    FOR SELECT USING (
        customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
    );

CREATE POLICY "Owners and managers can manage campaigns" ON campaigns
    FOR ALL USING (
        customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
        AND COALESCE(auth.jwt() ->> 'role', '') IN ('owner', 'manager')
    );

-- Ad sets policies
CREATE POLICY "Users can view ad sets for their customer campaigns" ON ad_sets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = ad_sets.campaign_id 
            AND campaigns.customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
        )
    );

CREATE POLICY "Owners and managers can manage ad sets" ON ad_sets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = ad_sets.campaign_id 
            AND campaigns.customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
        )
        AND COALESCE(auth.jwt() ->> 'role', '') IN ('owner', 'manager')
    );

-- Ads policies
CREATE POLICY "Users can view ads for their customer campaigns" ON ads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ad_sets 
            JOIN campaigns ON campaigns.id = ad_sets.campaign_id
            WHERE ad_sets.id = ads.ad_set_id 
            AND campaigns.customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
        )
    );

CREATE POLICY "Owners and managers can manage ads" ON ads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM ad_sets 
            JOIN campaigns ON campaigns.id = ad_sets.campaign_id
            WHERE ad_sets.id = ads.ad_set_id 
            AND campaigns.customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
        )
        AND COALESCE(auth.jwt() ->> 'role', '') IN ('owner', 'manager')
    );

-- Contact attempts policies
CREATE POLICY "Users can view contact attempts for their customer leads" ON contact_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM leads 
            WHERE leads.id = contact_attempts.lead_id 
            AND leads.customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
        )
    );

CREATE POLICY "Users can create contact attempts for their customer leads" ON contact_attempts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM leads 
            WHERE leads.id = contact_attempts.lead_id 
            AND leads.customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
        )
        AND user_id::text = COALESCE(auth.jwt() ->> 'user_id', '')
    );

-- Appointments policies
CREATE POLICY "Users can view appointments for their customer leads" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM leads 
            WHERE leads.id = appointments.lead_id 
            AND leads.customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
        )
    );

CREATE POLICY "Users can manage their own appointments" ON appointments
    FOR ALL USING (
        user_id::text = COALESCE(auth.jwt() ->> 'user_id', '')
        AND EXISTS (
            SELECT 1 FROM leads 
            WHERE leads.id = appointments.lead_id 
            AND leads.customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
        )
    );

CREATE POLICY "Owners and managers can manage all appointments" ON appointments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM leads 
            WHERE leads.id = appointments.lead_id 
            AND leads.customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
        )
        AND COALESCE(auth.jwt() ->> 'role', '') IN ('owner', 'manager')
    );

-- Campaign metrics policies
CREATE POLICY "Users can view metrics for their customer campaigns" ON campaign_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_metrics.campaign_id 
            AND campaigns.customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
        )
    );

CREATE POLICY "System can manage campaign metrics" ON campaign_metrics
    FOR ALL USING (true); -- Allow system processes to update metrics

-- Audit logs policies
CREATE POLICY "Owners can view audit logs for their customer" ON audit_logs
    FOR SELECT USING (
        customer_id::text = COALESCE(auth.jwt() ->> 'customer_id', '')
        AND COALESCE(auth.jwt() ->> 'role', '') = 'owner'
    );

CREATE POLICY "System can create audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true); -- Allow system to create audit entries

-- Kommenter: 
-- Disse policies krever at JWT tokens inneholder:
-- - customer_id: UUID av customer som bruker tilhører
-- - user_id: UUID av den innloggede brukeren  
-- - role: 'owner', 'manager', eller 'agent'
--
-- For å aktivere disse, må du også sette opp authentication i Supabase
-- og konfigurere JWT tokens riktig i din applikasjon.
