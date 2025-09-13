-- Test leads for den siste måneden
-- Kjør dette i Supabase SQL Editor for å få realistiske dashboard-data

-- Først, slett eksisterende demo leads for å unngå duplikater
DELETE FROM contact_attempts WHERE lead_id IN (
  SELECT id FROM leads WHERE customer_id = '11111111-1111-1111-1111-111111111111'
);
DELETE FROM leads WHERE customer_id = '11111111-1111-1111-1111-111111111111';

-- Legg til realistiske leads spredt over siste 30 dager
INSERT INTO leads (
  customer_id, campaign_id, source, full_name, phone, email, postal_code, 
  address, city, service, message, budget_range, preferred_contact_time,
  status, gdpr_consent, consent_version, consent_timestamp, created_at
) VALUES
-- Leads fra i dag (0-1 dager siden)
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'meta_lead_ads', 'Andreas Berg', '+4798765432', 'andreas.berg@gmail.com', '0181', 'Storgata 45', 'Oslo', 'Solceller', 'Ønsker tilbud på solceller til enebolig, ca 150 kvm takflate', '200.000-300.000', 'Ettermiddag (12-16)', 'new', true, '1.0', NOW(), NOW()),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'manual', 'Ingrid Svendsen', '+4787654321', 'ingrid.svendsen@outlook.no', '7020', 'Bakkeveien 12', 'Trondheim', 'Varmepumpe', 'Gammel oljefyr må skiftes ut. Interessert i luft-til-vann varmepumpe', 'Under 100.000', 'Morgen (08-12)', 'new', true, '1.0', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),

-- Leads fra i går (1-2 dager siden)
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'meta_lead_ads', 'Lars Johansen', '+4776543210', 'lars.johansen@hotmail.com', '5020', 'Fjellveien 88', 'Bergen', 'Solceller', 'Har elbil og ønsker batteripakke i tillegg til solceller', 'Over 300.000', 'Kveld (16-20)', 'contacted', true, '1.0', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'meta_lead_ads', 'Maria Kristensen', '+4765432109', 'maria.k@icloud.com', '4020', 'Sandveien 23', 'Stavanger', 'Varmepumpe', 'Trenger ny varmepumpe til hytte, ca 80 kvm', '100.000-200.000', 'Helg', 'contacted', true, '1.0', NOW() - INTERVAL '1 day 6 hours', NOW() - INTERVAL '1 day 6 hours'),

-- Leads fra for 3-5 dager siden
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'meta_lead_ads', 'Erik Hansen', '+4754321098', 'erik.hansen@gmail.com', '3020', 'Eikaveien 67', 'Drammen', 'Solceller', 'Interessert i å bli mer selvforsynt med strøm', '200.000-300.000', 'Ettermiddag (12-16)', 'no_answer', true, '1.0', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'manual', 'Kari Andersen', '+4743210987', 'kari.andersen@yahoo.no', '1050', 'Løkkeveien 34', 'Oslo', 'Varmepumpe', 'Ønsker å skifte fra elektrisk oppvarming', '100.000-200.000', 'Morgen (08-12)', 'scheduled', true, '1.0', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'meta_lead_ads', 'Thomas Olsen', '+4732109876', 'thomas.olsen@gmail.com', '6020', 'Industriveien 12', 'Ålesund', 'Solceller', 'Bedriftstak, ca 800 kvm', 'Over 300.000', 'Ettermiddag (12-16)', 'scheduled', true, '1.0', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

-- Leads fra for 1 uke siden
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'meta_lead_ads', 'Anne Lise Berg', '+4721098765', 'annelise.berg@outlook.com', '8000', 'Nordkappveien 45', 'Bodø', 'Varmepumpe', 'Kald vinter, trenger bedre oppvarming', '100.000-200.000', 'Kveld (16-20)', 'won', true, '1.0', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'meta_lead_ads', 'Ole Kristian Haugen', '+4710987654', 'ole.haugen@gmail.no', '2020', 'Skogveien 78', 'Skedsmo', 'Solceller', 'Nyoppusset tak, perfekt for solceller', '200.000-300.000', 'Helg', 'contacted', true, '1.0', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),

-- Leads fra for 2 uker siden
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'manual', 'Silje Marthinsen', '+4799887766', 'silje.m@hotmail.no', '9020', 'Tundraveien 23', 'Tromsø', 'Solceller', 'Midnattssol gir mye strøm på sommeren!', '200.000-300.000', 'Ettermiddag (12-16)', 'lost', true, '1.0', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'meta_lead_ads', 'Bjørn Eirik Nilsen', '+4788776655', 'bjorn.nilsen@gmail.com', '3700', 'Industriveien 5', 'Skien', 'Varmepumpe', 'Stor fabrikkhall trenger oppvarming', 'Over 300.000', 'Morgen (08-12)', 'won', true, '1.0', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),

-- Leads fra for 3 uker siden
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'meta_lead_ads', 'Monica Larsen', '+4777665544', 'monica.larsen@icloud.com', '1400', 'Bjørkeveien 56', 'Ski', 'Solceller', 'Elbil + solceller kombinasjon', '200.000-300.000', 'Kveld (16-20)', 'no_answer', true, '1.0', NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'meta_lead_ads', 'Per Gunnar Steen', '+4766554433', 'per.steen@yahoo.com', '2830', 'Gardeveien 89', 'Raufoss', 'Varmepumpe', 'Gammel villa, 200 kvm', '100.000-200.000', 'Helg', 'contacted', true, '1.0', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days'),

-- Leads fra for 4 uker siden (1 måned)
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'manual', 'Linda Ås', '+4755443322', 'linda.aas@outlook.no', '1850', 'Frognerveien 12', 'Mysen', 'Solceller', 'Ønsker å være selvforsynt med strøm', '200.000-300.000', 'Ettermiddag (12-16)', 'scheduled', true, '1.0', NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'meta_lead_ads', 'Rune Andersen', '+4744332211', 'rune.andersen@gmail.com', '3050', 'Torgveien 67', 'Mjøndalen', 'Varmepumpe', 'Erstatte gammel oljefyr', 'Under 100.000', 'Morgen (08-12)', 'won', true, '1.0', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days');

-- Legg til noen kontaktforsøk for å gjøre dataene mer realistiske
-- Kontaktforsøk for Lars Johansen (contacted)
INSERT INTO contact_attempts (lead_id, user_id, type, outcome, notes, created_at)
SELECT id, '22222222-2222-2222-2222-222222222222', 'call', 'answered', 'Interessert kunde, ønsker befaring neste uke', NOW() - INTERVAL '1 day 2 hours'
FROM leads WHERE email = 'lars.johansen@hotmail.com';

-- Kontaktforsøk for Maria Kristensen (contacted)
INSERT INTO contact_attempts (lead_id, user_id, type, outcome, notes, created_at)
SELECT id, '22222222-2222-2222-2222-222222222222', 'sms', 'delivered', 'Sendt SMS med informasjon om produkter', NOW() - INTERVAL '1 day 4 hours'
FROM leads WHERE email = 'maria.k@icloud.com';

-- Kontaktforsøk for Erik Hansen (no_answer)
INSERT INTO contact_attempts (lead_id, user_id, type, outcome, notes, created_at)
SELECT id, '22222222-2222-2222-2222-222222222222', 'call', 'no_answer', 'Ingen svar, prøver igjen i morgen', NOW() - INTERVAL '3 days 2 hours'
FROM leads WHERE email = 'erik.hansen@gmail.com';

INSERT INTO contact_attempts (lead_id, user_id, type, outcome, notes, created_at)
SELECT id, '22222222-2222-2222-2222-222222222222', 'call', 'voicemail', 'La igjen beskjed på telefonsvarer', NOW() - INTERVAL '2 days 5 hours'
FROM leads WHERE email = 'erik.hansen@gmail.com';

-- Kontaktforsøk for Kari Andersen (scheduled)
INSERT INTO contact_attempts (lead_id, user_id, type, outcome, notes, created_at)
SELECT id, '22222222-2222-2222-2222-222222222222', 'call', 'answered', 'Avtalt befaring på tirsdag kl 14:00', NOW() - INTERVAL '3 days 6 hours'
FROM leads WHERE email = 'kari.andersen@yahoo.no';

-- Kontaktforsøk for Thomas Olsen (scheduled)
INSERT INTO contact_attempts (lead_id, user_id, type, outcome, notes, created_at)
SELECT id, '22222222-2222-2222-2222-222222222222', 'email', 'delivered', 'Sendt kalenderinvitasjon for befaring', NOW() - INTERVAL '4 days 3 hours'
FROM leads WHERE email = 'thomas.olsen@gmail.com';

-- Kontaktforsøk for Anne Lise Berg (won)
INSERT INTO contact_attempts (lead_id, user_id, type, outcome, notes, created_at)
SELECT id, '22222222-2222-2222-2222-222222222222', 'call', 'answered', 'Befaring gjennomført, kontrakt signert!', NOW() - INTERVAL '5 days'
FROM leads WHERE email = 'annelise.berg@outlook.com';

-- Kontaktforsøk for Bjørn Eirik Nilsen (won)
INSERT INTO contact_attempts (lead_id, user_id, type, outcome, notes, created_at)
SELECT id, '22222222-2222-2222-2222-222222222222', 'call', 'answered', 'Stor kontrakt signert - fabrikkhall', NOW() - INTERVAL '12 days'
FROM leads WHERE email = 'bjorn.nilsen@gmail.com';

-- Oppdater last_contact_at for kontaktede leads
UPDATE leads SET 
  last_contact_at = (
    SELECT MAX(created_at) 
    FROM contact_attempts 
    WHERE contact_attempts.lead_id = leads.id
  ),
  total_attempts = (
    SELECT COUNT(*) 
    FROM contact_attempts 
    WHERE contact_attempts.lead_id = leads.id
  )
WHERE id IN (
  SELECT DISTINCT lead_id FROM contact_attempts
);

-- Legg til noen appointments for scheduled/won leads
-- Befaring for Kari Andersen
INSERT INTO appointments (lead_id, user_id, title, description, start_time, end_time, location, status, created_at)
SELECT id, '22222222-2222-2222-2222-222222222222', 'Befaring: Kari Andersen', 'Varmepumpe befaring i Oslo', NOW() + INTERVAL '2 days 14 hours', NOW() + INTERVAL '2 days 15 hours', 'Løkkeveien 34, 1050 Oslo', 'scheduled', NOW() - INTERVAL '3 days'
FROM leads WHERE email = 'kari.andersen@yahoo.no';

-- Befaring for Thomas Olsen
INSERT INTO appointments (lead_id, user_id, title, description, start_time, end_time, location, status, created_at)
SELECT id, '22222222-2222-2222-2222-222222222222', 'Befaring: Thomas Olsen', 'Solceller befaring - bedriftstak', NOW() + INTERVAL '3 days 10 hours', NOW() + INTERVAL '3 days 11 hours 30 minutes', 'Industriveien 12, 6020 Ålesund', 'scheduled', NOW() - INTERVAL '4 days'
FROM leads WHERE email = 'thomas.olsen@gmail.com';

-- Fullført befaring for Anne Lise Berg
INSERT INTO appointments (lead_id, user_id, title, description, start_time, end_time, location, status, created_at)
SELECT id, '22222222-2222-2222-2222-222222222222', 'Befaring: Anne Lise Berg', 'Varmepumpe befaring i Bodø', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '1 hour', 'Nordkappveien 45, 8000 Bodø', 'completed', NOW() - INTERVAL '6 days'
FROM leads WHERE email = 'annelise.berg@outlook.com';

-- Fullført befaring for Bjørn Eirik Nilsen
INSERT INTO appointments (lead_id, user_id, title, description, start_time, end_time, location, status, created_at)
SELECT id, '22222222-2222-2222-2222-222222222222', 'Befaring: Bjørn Eirik Nilsen', 'Varmepumpe befaring - fabrikkhall', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '2 hours', 'Industriveien 5, 3700 Skien', 'completed', NOW() - INTERVAL '13 days'
FROM leads WHERE email = 'bjorn.nilsen@gmail.com';

SELECT 'Test data lagt til!' as status, COUNT(*) as antall_leads FROM leads WHERE customer_id = '11111111-1111-1111-1111-111111111111';
