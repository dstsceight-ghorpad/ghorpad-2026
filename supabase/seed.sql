-- ============================================
-- GHORPAD 2026 — Seed Data
-- ============================================
-- NOTE: Run this AFTER creating test users via Supabase Auth.
-- Replace the UUIDs below with actual user IDs from auth.users.

-- Sample profiles (replace UUIDs with real auth user IDs)
INSERT INTO profiles (id, full_name, role, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Anika Sharma', 'super_editor', true),
  ('00000000-0000-0000-0000-000000000002', 'Rohan Mehta', 'editor', true),
  ('00000000-0000-0000-0000-000000000003', 'Priya Deshmukh', 'contributor', true)
ON CONFLICT (id) DO NOTHING;

-- Sample articles
INSERT INTO articles (title, slug, excerpt, category, tags, status, is_featured, author_id, published_at, read_time_minutes) VALUES
(
  'Annual Tech Fest Draws Record Crowd of 3,000 Students',
  'annual-tech-fest-draws-record-crowd',
  'The three-day technology festival featured 45 events, including a hackathon that saw teams from 12 colleges compete for the grand prize. Student organizers reported a 40% increase in participation over last year.',
  'Campus',
  ARRAY['tech-fest', 'events', 'hackathon'],
  'published',
  true,
  '00000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '2 days',
  5
),
(
  'Student Research Team Publishes Paper in International Journal',
  'student-research-team-publishes-paper',
  'A group of final-year students from the Computer Science department had their research on machine learning in agricultural monitoring accepted by the IEEE conference proceedings.',
  'Achievements',
  ARRAY['research', 'ieee', 'machine-learning'],
  'published',
  false,
  '00000000-0000-0000-0000-000000000002',
  NOW() - INTERVAL '5 days',
  4
),
(
  'Why Our Campus Needs Better Mental Health Resources',
  'campus-needs-better-mental-health-resources',
  'An opinion piece examining the growing demand for counseling services and the administration''s response. With exam season approaching, students are calling for extended support hours and peer counseling programs.',
  'Opinion',
  ARRAY['mental-health', 'campus-life', 'opinion'],
  'published',
  false,
  '00000000-0000-0000-0000-000000000003',
  NOW() - INTERVAL '8 days',
  6
),
(
  'Cricket Team Clinches Inter-College Trophy After 5-Year Wait',
  'cricket-team-clinches-inter-college-trophy',
  'In a nail-biting final against Fergusson College, our cricket team defended a modest total of 156 to win by 12 runs. Captain Vikram Singh''s bowling spell of 4-23 sealed the victory.',
  'Sports',
  ARRAY['cricket', 'sports', 'inter-college'],
  'published',
  false,
  '00000000-0000-0000-0000-000000000002',
  NOW() - INTERVAL '12 days',
  3
),
(
  'Cultural Festival Celebrates Regional Diversity with Folk Performances',
  'cultural-festival-celebrates-regional-diversity',
  'Over 200 students participated in the annual cultural showcase, performing traditional dances and music from Maharashtra, Karnataka, and Gujarat. The event aimed to bridge cultural gaps on campus.',
  'Culture',
  ARRAY['culture', 'festival', 'performances'],
  'published',
  false,
  '00000000-0000-0000-0000-000000000001',
  NOW() - INTERVAL '15 days',
  4
),
(
  'New AI Lab Inaugurated with Industry Partnership',
  'new-ai-lab-inaugurated-with-industry-partnership',
  'The college has opened a state-of-the-art artificial intelligence laboratory in collaboration with a leading tech company, equipped with GPU clusters and datasets for student research projects.',
  'Tech',
  ARRAY['ai', 'lab', 'technology', 'infrastructure'],
  'published',
  false,
  '00000000-0000-0000-0000-000000000002',
  NOW() - INTERVAL '20 days',
  5
);
