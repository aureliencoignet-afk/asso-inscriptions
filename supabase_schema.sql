-- =====================================================
-- SCHEMA SQL SUPABASE - ASSOCIATION INSCRIPTIONS
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ASSOCIATIONS TABLE
-- =====================================================
CREATE TABLE associations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    postal_code VARCHAR(20),
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'France',
    email VARCHAR(255),
    phone VARCHAR(50),
    currency VARCHAR(3) DEFAULT 'EUR',
    default_cotisation_amount NUMERIC(10,2) DEFAULT 50.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROFILES TABLE (linked to auth.users)
-- =====================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    association_id UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'gestionnaire', 'lecture')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SEASONS TABLE
-- =====================================================
CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(association_id, label)
);

-- =====================================================
-- HOUSEHOLDS TABLE
-- =====================================================
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    responsible_firstname VARCHAR(100),
    responsible_lastname VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    postal_code VARCHAR(20),
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'France',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- =====================================================
-- SUBSCRIBERS TABLE
-- =====================================================
CREATE TABLE subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
    household_id UUID REFERENCES households(id) ON DELETE SET NULL,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- =====================================================
-- ACTIVITIES CATALOG TABLE
-- =====================================================
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
    season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    capacity INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REGISTRATIONS TABLE
-- =====================================================
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    registration_number VARCHAR(50) UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'validated', 'cancelled')),
    registration_date DATE DEFAULT CURRENT_DATE,
    total_gross DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_net DECIMAL(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    UNIQUE(association_id, subscriber_id, season_id)
);

-- =====================================================
-- REGISTRATION LINES TABLE (Cotisation + Activities)
-- =====================================================
CREATE TABLE registration_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    line_type VARCHAR(50) NOT NULL CHECK (line_type IN ('COTISATION', 'ACTIVITE')),
    activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
    label VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INSTALLMENTS TABLE (Échéancier)
-- =====================================================
CREATE TABLE installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 3),
    due_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'received', 'cashed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(registration_id, rank)
);

-- =====================================================
-- PLANNED PAYMENTS TABLE
-- =====================================================
CREATE TABLE planned_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    installment_id UUID NOT NULL REFERENCES installments(id) ON DELETE CASCADE,
    payment_mode VARCHAR(50) NOT NULL CHECK (payment_mode IN ('CHEQUE', 'LIQUIDE', 'VIREMENT', 'CB', 'AUTRE')),
    amount DECIMAL(10, 2) NOT NULL,
    -- Specific fields
    bank_name VARCHAR(255),
    check_number VARCHAR(100),
    check_holder VARCHAR(255),
    remittance_date DATE,
    receipt_number VARCHAR(100),
    reference VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'received', 'cashed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- IMPORT JOBS TABLE (for tracking imports)
-- =====================================================
CREATE TABLE import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    total_rows INTEGER DEFAULT 0,
    successful_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,
    error_log JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- =====================================================
-- EXPORT JOBS TABLE (for tracking exports)
-- =====================================================
CREATE TABLE export_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    association_id UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
    export_type VARCHAR(100) NOT NULL,
    filters JSONB,
    filename VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Profiles
CREATE INDEX idx_profiles_association ON profiles(association_id);

-- Seasons
CREATE INDEX idx_seasons_association ON seasons(association_id);
CREATE INDEX idx_seasons_status ON seasons(status);

-- Households
CREATE INDEX idx_households_association ON households(association_id);
CREATE INDEX idx_households_email ON households(email);

-- Subscribers
CREATE INDEX idx_subscribers_association ON subscribers(association_id);
CREATE INDEX idx_subscribers_household ON subscribers(household_id);
CREATE INDEX idx_subscribers_name ON subscribers(lastname, firstname);

-- Activities
CREATE INDEX idx_activities_association_season ON activities(association_id, season_id);
CREATE INDEX idx_activities_active ON activities(is_active);

-- Registrations
CREATE INDEX idx_registrations_association_season ON registrations(association_id, season_id);
CREATE INDEX idx_registrations_subscriber ON registrations(subscriber_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_number ON registrations(registration_number);

-- Registration Lines
CREATE INDEX idx_registration_lines_registration ON registration_lines(registration_id);
CREATE INDEX idx_registration_lines_activity ON registration_lines(activity_id);

-- Installments
CREATE INDEX idx_installments_registration ON installments(registration_id);
CREATE INDEX idx_installments_due_date ON installments(due_date);
CREATE INDEX idx_installments_status ON installments(status);

-- Planned Payments
CREATE INDEX idx_planned_payments_installment ON planned_payments(installment_id);
CREATE INDEX idx_planned_payments_mode_status ON planned_payments(payment_mode, status);

-- Import/Export Jobs
CREATE INDEX idx_import_jobs_association ON import_jobs(association_id);
CREATE INDEX idx_export_jobs_association ON export_jobs(association_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get current user's association_id
CREATE OR REPLACE FUNCTION get_user_association_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT association_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user role
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = required_role
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Associations
CREATE TRIGGER update_associations_updated_at BEFORE UPDATE ON associations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Profiles
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seasons
CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Households
CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON households
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Subscribers
CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON subscribers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activities
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Registrations
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Installments
CREATE TRIGGER update_installments_updated_at BEFORE UPDATE ON installments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Planned Payments
CREATE TRIGGER update_planned_payments_updated_at BEFORE UPDATE ON planned_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ASSOCIATIONS POLICIES
-- =====================================================
CREATE POLICY associations_select_policy ON associations
    FOR SELECT USING (id = get_user_association_id());

CREATE POLICY associations_update_policy ON associations
    FOR UPDATE USING (id = get_user_association_id() AND has_role('admin'));

-- =====================================================
-- PROFILES POLICIES
-- =====================================================
CREATE POLICY profiles_select_policy ON profiles
    FOR SELECT USING (association_id = get_user_association_id());

CREATE POLICY profiles_insert_policy ON profiles
    FOR INSERT WITH CHECK (association_id = get_user_association_id() AND has_role('admin'));

CREATE POLICY profiles_update_policy ON profiles
    FOR UPDATE USING (association_id = get_user_association_id() AND has_role('admin'));

CREATE POLICY profiles_delete_policy ON profiles
    FOR DELETE USING (association_id = get_user_association_id() AND has_role('admin'));

-- =====================================================
-- SEASONS POLICIES
-- =====================================================
CREATE POLICY seasons_select_policy ON seasons
    FOR SELECT USING (association_id = get_user_association_id());

CREATE POLICY seasons_insert_policy ON seasons
    FOR INSERT WITH CHECK (association_id = get_user_association_id() AND has_role('admin'));

CREATE POLICY seasons_update_policy ON seasons
    FOR UPDATE USING (association_id = get_user_association_id() AND has_role('admin'));

CREATE POLICY seasons_delete_policy ON seasons
    FOR DELETE USING (association_id = get_user_association_id() AND has_role('admin'));

-- =====================================================
-- HOUSEHOLDS POLICIES
-- =====================================================
CREATE POLICY households_select_policy ON households
    FOR SELECT USING (association_id = get_user_association_id());

CREATE POLICY households_insert_policy ON households
    FOR INSERT WITH CHECK (
        association_id = get_user_association_id() AND 
        (has_role('admin') OR has_role('gestionnaire'))
    );

CREATE POLICY households_update_policy ON households
    FOR UPDATE USING (
        association_id = get_user_association_id() AND 
        (has_role('admin') OR has_role('gestionnaire'))
    );

CREATE POLICY households_delete_policy ON households
    FOR DELETE USING (
        association_id = get_user_association_id() AND 
        has_role('admin')
    );

-- =====================================================
-- SUBSCRIBERS POLICIES
-- =====================================================
CREATE POLICY subscribers_select_policy ON subscribers
    FOR SELECT USING (association_id = get_user_association_id());

CREATE POLICY subscribers_insert_policy ON subscribers
    FOR INSERT WITH CHECK (
        association_id = get_user_association_id() AND 
        (has_role('admin') OR has_role('gestionnaire'))
    );

CREATE POLICY subscribers_update_policy ON subscribers
    FOR UPDATE USING (
        association_id = get_user_association_id() AND 
        (has_role('admin') OR has_role('gestionnaire'))
    );

CREATE POLICY subscribers_delete_policy ON subscribers
    FOR DELETE USING (
        association_id = get_user_association_id() AND 
        has_role('admin')
    );

-- =====================================================
-- ACTIVITIES POLICIES
-- =====================================================
CREATE POLICY activities_select_policy ON activities
    FOR SELECT USING (association_id = get_user_association_id());

CREATE POLICY activities_insert_policy ON activities
    FOR INSERT WITH CHECK (association_id = get_user_association_id() AND has_role('admin'));

CREATE POLICY activities_update_policy ON activities
    FOR UPDATE USING (association_id = get_user_association_id() AND has_role('admin'));

CREATE POLICY activities_delete_policy ON activities
    FOR DELETE USING (association_id = get_user_association_id() AND has_role('admin'));

-- =====================================================
-- REGISTRATIONS POLICIES
-- =====================================================
CREATE POLICY registrations_select_policy ON registrations
    FOR SELECT USING (association_id = get_user_association_id());

CREATE POLICY registrations_insert_policy ON registrations
    FOR INSERT WITH CHECK (
        association_id = get_user_association_id() AND 
        (has_role('admin') OR has_role('gestionnaire'))
    );

CREATE POLICY registrations_update_policy ON registrations
    FOR UPDATE USING (
        association_id = get_user_association_id() AND 
        (has_role('admin') OR has_role('gestionnaire'))
    );

CREATE POLICY registrations_delete_policy ON registrations
    FOR DELETE USING (
        association_id = get_user_association_id() AND 
        has_role('admin')
    );

-- =====================================================
-- REGISTRATION LINES POLICIES
-- =====================================================
CREATE POLICY registration_lines_select_policy ON registration_lines
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM registrations r
            WHERE r.id = registration_lines.registration_id
            AND r.association_id = get_user_association_id()
        )
    );

CREATE POLICY registration_lines_insert_policy ON registration_lines
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM registrations r
            WHERE r.id = registration_lines.registration_id
            AND r.association_id = get_user_association_id()
        ) AND (has_role('admin') OR has_role('gestionnaire'))
    );

CREATE POLICY registration_lines_update_policy ON registration_lines
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM registrations r
            WHERE r.id = registration_lines.registration_id
            AND r.association_id = get_user_association_id()
        ) AND (has_role('admin') OR has_role('gestionnaire'))
    );

CREATE POLICY registration_lines_delete_policy ON registration_lines
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM registrations r
            WHERE r.id = registration_lines.registration_id
            AND r.association_id = get_user_association_id()
        ) AND (has_role('admin') OR has_role('gestionnaire'))
    );

-- =====================================================
-- INSTALLMENTS POLICIES
-- =====================================================
CREATE POLICY installments_select_policy ON installments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM registrations r
            WHERE r.id = installments.registration_id
            AND r.association_id = get_user_association_id()
        )
    );

CREATE POLICY installments_insert_policy ON installments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM registrations r
            WHERE r.id = installments.registration_id
            AND r.association_id = get_user_association_id()
        ) AND (has_role('admin') OR has_role('gestionnaire'))
    );

CREATE POLICY installments_update_policy ON installments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM registrations r
            WHERE r.id = installments.registration_id
            AND r.association_id = get_user_association_id()
        ) AND (has_role('admin') OR has_role('gestionnaire'))
    );

CREATE POLICY installments_delete_policy ON installments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM registrations r
            WHERE r.id = installments.registration_id
            AND r.association_id = get_user_association_id()
        ) AND has_role('admin')
    );

-- =====================================================
-- PLANNED PAYMENTS POLICIES
-- =====================================================
CREATE POLICY planned_payments_select_policy ON planned_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM installments i
            JOIN registrations r ON r.id = i.registration_id
            WHERE i.id = planned_payments.installment_id
            AND r.association_id = get_user_association_id()
        )
    );

CREATE POLICY planned_payments_insert_policy ON planned_payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM installments i
            JOIN registrations r ON r.id = i.registration_id
            WHERE i.id = planned_payments.installment_id
            AND r.association_id = get_user_association_id()
        ) AND (has_role('admin') OR has_role('gestionnaire'))
    );

CREATE POLICY planned_payments_update_policy ON planned_payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM installments i
            JOIN registrations r ON r.id = i.registration_id
            WHERE i.id = planned_payments.installment_id
            AND r.association_id = get_user_association_id()
        ) AND (has_role('admin') OR has_role('gestionnaire'))
    );

CREATE POLICY planned_payments_delete_policy ON planned_payments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM installments i
            JOIN registrations r ON r.id = i.registration_id
            WHERE i.id = planned_payments.installment_id
            AND r.association_id = get_user_association_id()
        ) AND has_role('admin')
    );

-- =====================================================
-- IMPORT JOBS POLICIES
-- =====================================================
CREATE POLICY import_jobs_select_policy ON import_jobs
    FOR SELECT USING (association_id = get_user_association_id());

CREATE POLICY import_jobs_insert_policy ON import_jobs
    FOR INSERT WITH CHECK (
        association_id = get_user_association_id() AND 
        (has_role('admin') OR has_role('gestionnaire'))
    );

-- =====================================================
-- EXPORT JOBS POLICIES
-- =====================================================
CREATE POLICY export_jobs_select_policy ON export_jobs
    FOR SELECT USING (association_id = get_user_association_id());

CREATE POLICY export_jobs_insert_policy ON export_jobs
    FOR INSERT WITH CHECK (association_id = get_user_association_id());
