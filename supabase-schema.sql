-- Luna CRM Database Schema
-- Kjør dette i Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enum types
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'agent');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'no_answer', 'scheduled', 'won', 'lost');
CREATE TYPE contact_attempt_type AS ENUM ('call', 'sms', 'email', 'whatsapp');

-- Customers table (multi-tenant support)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    org_number VARCHAR(50),
    plan VARCHAR(50) DEFAULT 'basic',
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#3b82f6',
    secondary_color VARCHAR(7) DEFAULT '#8b5cf6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'agent',
    avatar_url TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL DEFAULT 'meta',
    external_id VARCHAR(255), -- Meta campaign ID
    name VARCHAR(255) NOT NULL,
    budget_total DECIMAL(10,2),
    budget_daily DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad sets table
CREATE TABLE ad_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    external_id VARCHAR(255), -- Meta adset ID
    name VARCHAR(255) NOT NULL,
    target_audience JSONB,
    budget DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ads table
CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_set_id UUID NOT NULL REFERENCES ad_sets(id) ON DELETE CASCADE,
    external_id VARCHAR(255), -- Meta ad ID
    name VARCHAR(255) NOT NULL,
    creative_url TEXT,
    headline VARCHAR(255),
    description TEXT,
    call_to_action VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table (main table)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id),
    ad_set_id UUID REFERENCES ad_sets(id),
    ad_id UUID REFERENCES ads(id),
    
    -- Lead source info
    source VARCHAR(50) NOT NULL DEFAULT 'meta_lead_ads',
    external_id VARCHAR(255), -- Meta lead ID
    
    -- Contact information
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    postal_code VARCHAR(10),
    address TEXT,
    city VARCHAR(100),
    
    -- Lead details
    service VARCHAR(255),
    message TEXT,
    budget_range VARCHAR(100),
    preferred_contact_time VARCHAR(100),
    
    -- Lead management
    status lead_status NOT NULL DEFAULT 'new',
    priority INTEGER DEFAULT 1, -- 1 = high, 2 = medium, 3 = low
    assignee_user_id UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    
    -- Contact tracking
    first_contact_at TIMESTAMP WITH TIME ZONE,
    last_contact_at TIMESTAMP WITH TIME ZONE,
    total_attempts INTEGER DEFAULT 0,
    
    -- GDPR compliance
    gdpr_consent BOOLEAN NOT NULL DEFAULT false,
    consent_version VARCHAR(10) NOT NULL DEFAULT '1.0',
    consent_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    consent_ip_address INET,
    
    -- Metadata
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_content VARCHAR(255),
    utm_term VARCHAR(255),
    referrer_url TEXT,
    user_agent TEXT,
    
    -- Scoring and qualification
    lead_score INTEGER DEFAULT 0,
    qualification_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact attempts table
CREATE TABLE contact_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    type contact_attempt_type NOT NULL,
    outcome VARCHAR(50), -- 'answered', 'no_answer', 'busy', 'voicemail', 'sent', 'delivered', 'failed'
    duration_seconds INTEGER, -- for calls
    notes TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    meeting_url TEXT, -- for online meetings
    
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no_show'
    reminder_sent BOOLEAN DEFAULT false,
    
    -- ICS calendar integration
    ics_uid VARCHAR(255),
    calendar_event_id VARCHAR(255),
    
    notes TEXT,
    outcome TEXT, -- post-meeting notes
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign metrics cache table (for performance)
CREATE TABLE campaign_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Spend metrics
    spend DECIMAL(10,2) DEFAULT 0,
    budget_remaining DECIMAL(10,2) DEFAULT 0,
    
    -- Impression metrics
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    frequency DECIMAL(4,2) DEFAULT 0,
    
    -- Click metrics
    clicks INTEGER DEFAULT 0,
    click_through_rate DECIMAL(5,4) DEFAULT 0,
    cost_per_click DECIMAL(10,4) DEFAULT 0,
    
    -- Lead metrics
    leads_count INTEGER DEFAULT 0,
    cost_per_lead DECIMAL(10,2) DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    
    -- Quality metrics
    qualified_leads INTEGER DEFAULT 0,
    appointments_scheduled INTEGER DEFAULT 0,
    appointments_completed INTEGER DEFAULT 0,
    deals_won INTEGER DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(campaign_id, date)
);

-- Audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    
    entity_type VARCHAR(50) NOT NULL, -- 'lead', 'appointment', 'user', etc.
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'viewed'
    
    old_values JSONB,
    new_values JSONB,
    metadata JSONB,
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_leads_customer_id ON leads(customer_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_assignee ON leads(assignee_user_id);
CREATE INDEX idx_leads_campaign ON leads(campaign_id);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_email ON leads(email);

CREATE INDEX idx_contact_attempts_lead_id ON contact_attempts(lead_id);
CREATE INDEX idx_contact_attempts_created_at ON contact_attempts(created_at);

CREATE INDEX idx_appointments_lead_id ON appointments(lead_id);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);

CREATE INDEX idx_campaign_metrics_campaign_date ON campaign_metrics(campaign_id, date);

CREATE INDEX idx_audit_logs_customer_id ON audit_logs(customer_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Full text search indexes
CREATE INDEX idx_leads_search ON leads USING gin(
    to_tsvector('norwegian', 
        coalesce(full_name, '') || ' ' || 
        coalesce(email, '') || ' ' || 
        coalesce(phone, '') || ' ' || 
        coalesce(service, '') || ' ' || 
        coalesce(message, '')
    )
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_metrics_updated_at BEFORE UPDATE ON campaign_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit log trigger
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (customer_id, entity_type, entity_id, action, new_values)
        VALUES (NEW.customer_id, TG_TABLE_NAME, NEW.id, 'created', to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (customer_id, entity_type, entity_id, action, old_values, new_values)
        VALUES (NEW.customer_id, TG_TABLE_NAME, NEW.id, 'updated', to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (customer_id, entity_type, entity_id, action, old_values)
        VALUES (OLD.customer_id, TG_TABLE_NAME, OLD.id, 'deleted', to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply audit triggers to relevant tables
CREATE TRIGGER audit_leads AFTER INSERT OR UPDATE OR DELETE ON leads
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_appointments AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic multi-tenant isolation)
-- Note: These are simplified policies. In production, you'd want more granular control.

-- For now, disable RLS and allow all access (for demo purposes)
-- In production, you would implement proper authentication and JWT claims

CREATE POLICY "Allow all access to customers" ON customers
    FOR ALL USING (true);

CREATE POLICY "Allow all access to users" ON users
    FOR ALL USING (true);

CREATE POLICY "Allow all access to leads" ON leads
    FOR ALL USING (true);

CREATE POLICY "Allow all access to campaigns" ON campaigns
    FOR ALL USING (true);

CREATE POLICY "Allow all access to ad_sets" ON ad_sets
    FOR ALL USING (true);

CREATE POLICY "Allow all access to ads" ON ads
    FOR ALL USING (true);

CREATE POLICY "Allow all access to contact_attempts" ON contact_attempts
    FOR ALL USING (true);

CREATE POLICY "Allow all access to appointments" ON appointments
    FOR ALL USING (true);

CREATE POLICY "Allow all access to campaign_metrics" ON campaign_metrics
    FOR ALL USING (true);

CREATE POLICY "Allow all access to audit_logs" ON audit_logs
    FOR ALL USING (true);

-- Insert demo data
INSERT INTO customers (id, name, org_number, plan) VALUES 
('11111111-1111-1111-1111-111111111111', 'Demo Bedrift AS', '123456789', 'premium');

INSERT INTO users (id, customer_id, email, name, role) VALUES 
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'demo@example.com', 'Demo Bruker', 'owner');

INSERT INTO campaigns (id, customer_id, name, budget_total) VALUES 
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Sommer Solceller', 25000.00),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Varmepumpe Høst', 18000.00);

-- Insert demo leads
INSERT INTO leads (
    customer_id, campaign_id, full_name, phone, email, postal_code, 
    service, message, status, gdpr_consent
) VALUES 
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Ola Nordmann', '+4799999999', 'ola@example.com', '0181', 'Solceller', 'Ønsker tilbud på solceller til rekkehus', 'new', true),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Kari Hansen', '+4788888888', 'kari@example.com', '7020', 'Varmepumpe', 'Trenger ny varmepumpe til enebolig', 'contacted', true),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Per Andersen', '+4777777777', 'per@example.com', '5020', 'Solceller', 'Interessert i batteripakke også', 'scheduled', true);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE contact_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_metrics;

-- Create useful views
CREATE VIEW lead_summary AS
SELECT 
    l.*,
    u.name as assignee_name,
    c.name as campaign_name,
    (
        SELECT COUNT(*) 
        FROM contact_attempts ca 
        WHERE ca.lead_id = l.id
    ) as total_contact_attempts,
    (
        SELECT ca.created_at 
        FROM contact_attempts ca 
        WHERE ca.lead_id = l.id 
        ORDER BY ca.created_at DESC 
        LIMIT 1
    ) as last_attempt_at
FROM leads l
LEFT JOIN users u ON l.assignee_user_id = u.id
LEFT JOIN campaigns c ON l.campaign_id = c.id;

COMMENT ON DATABASE postgres IS 'Luna CRM - Lead management system with real-time capabilities';
