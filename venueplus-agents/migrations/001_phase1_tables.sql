-- Phase 1 agent tables. Applied to Supabase project lctvoihefwmznlewzovi
-- via MCP (migration name: venueplus_agents_phase1).
-- All tables live in the venueplus schema alongside the app tables.

CREATE TABLE venueplus.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  type text NOT NULL CHECK (type IN ('venue', 'provider')),
  business_name text,
  contact_name text,
  email text,
  phone text,
  website text,
  address text,
  city text,
  state text,
  zip text,
  lat float,
  lng float,
  source text,
  source_id text,
  category text,
  score integer DEFAULT 0,
  score_reasons jsonb,
  status text DEFAULT 'new'
    CHECK (status IN ('new','enriched','scored','queued',
                      'approved','rejected','contacted','converted')),
  enrichment_data jsonb,
  notes text,
  assigned_campaign text
);
CREATE UNIQUE INDEX leads_source_unique
  ON venueplus.leads (source, source_id) WHERE source_id IS NOT NULL;
CREATE INDEX leads_status_idx ON venueplus.leads (status);
CREATE INDEX leads_score_idx ON venueplus.leads (score DESC);
CREATE INDEX leads_city_idx ON venueplus.leads (city);

CREATE TABLE venueplus.outreach_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  lead_id uuid REFERENCES venueplus.leads(id) ON DELETE CASCADE,
  type text CHECK (type IN ('email','sms','social_dm','social_post')),
  channel text,
  subject text,
  body text,
  draft_version integer DEFAULT 1,
  status text DEFAULT 'pending_review'
    CHECK (status IN ('pending_review','approved','rejected',
                      'scheduled','sent','failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  reviewer_notes text,
  approved_by text,
  resend_message_id text
);
CREATE INDEX outreach_status_idx ON venueplus.outreach_queue (status);
CREATE INDEX outreach_lead_idx ON venueplus.outreach_queue (lead_id);
CREATE INDEX outreach_scheduled_idx
  ON venueplus.outreach_queue (scheduled_at) WHERE status = 'approved';

CREATE TABLE venueplus.content_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  type text CHECK (type IN ('venue_page','blog_post','social_post','email_campaign')),
  title text,
  slug text,
  body_md text,
  meta_title text,
  meta_description text,
  target_keywords text[],
  status text DEFAULT 'pending_review'
    CHECK (status IN ('pending_review','approved','rejected','published','scheduled')),
  lead_id uuid REFERENCES venueplus.leads(id) ON DELETE SET NULL,
  reviewer_notes text,
  published_at timestamptz
);
CREATE INDEX content_status_idx ON venueplus.content_queue (status);
CREATE INDEX content_type_idx ON venueplus.content_queue (type);

CREATE TABLE venueplus.agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  agent_name text,
  status text CHECK (status IN ('running','completed','failed')),
  leads_found integer DEFAULT 0,
  leads_enriched integer DEFAULT 0,
  drafts_created integer DEFAULT 0,
  error_message text,
  duration_seconds float,
  metadata jsonb
);
CREATE INDEX agent_runs_name_idx ON venueplus.agent_runs (agent_name, created_at DESC);

CREATE TABLE venueplus.drip_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text UNIQUE,
  target_type text CHECK (target_type IN ('venue','provider','renter')),
  steps jsonb,
  status text DEFAULT 'active'
    CHECK (status IN ('active','paused','archived')),
  enrolled_count integer DEFAULT 0
);

CREATE TABLE venueplus.drip_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES venueplus.drip_campaigns(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES venueplus.leads(id) ON DELETE CASCADE,
  current_step integer DEFAULT 0,
  enrolled_at timestamptz DEFAULT now(),
  last_sent_at timestamptz,
  completed boolean DEFAULT false,
  unsubscribed boolean DEFAULT false
);
CREATE UNIQUE INDEX drip_enroll_unique
  ON venueplus.drip_enrollments (campaign_id, lead_id);
CREATE INDEX drip_enroll_due_idx ON venueplus.drip_enrollments (last_sent_at)
  WHERE completed = false AND unsubscribed = false;

-- Phase 2 automation flags + global config
CREATE TABLE venueplus.agent_config (
  key text PRIMARY KEY,
  value jsonb,
  updated_at timestamptz DEFAULT now()
);
INSERT INTO venueplus.agent_config (key, value) VALUES
  ('AUTO_SEND_ABOVE_SCORE', 'false'::jsonb),
  ('AUTO_PUBLISH_SEO',      'false'::jsonb),
  ('AUTO_POST_SOCIAL',      'false'::jsonb),
  ('LAUNCH_CITIES',
    '["New York NY","Los Angeles CA","Chicago IL","Miami FL","Austin TX","Nashville TN","Denver CO","Atlanta GA","Las Vegas NV","San Francisco CA"]'::jsonb)
ON CONFLICT (key) DO NOTHING;
