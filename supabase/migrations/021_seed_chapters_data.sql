-- Insert sample data if table is empty
INSERT INTO public.chapters (name, city, region, description, contact_email, established_date, member_count, meeting_schedule)
SELECT 'NUGSA Berlin', 'Berlin', 'Berlin', 'The Berlin chapter of NUGSA serves Ghanaian students across all universities in Berlin. We organize cultural events, academic support sessions, and networking opportunities.', 'berlin@nugsa-germany.org', '2019-03-15', 45, 'First Saturday of every month at 3:00 PM'
WHERE NOT EXISTS (SELECT 1 FROM public.chapters WHERE city = 'Berlin');

INSERT INTO public.chapters (name, city, region, description, contact_email, established_date, member_count, meeting_schedule)
SELECT 'NUGSA Munich', 'Munich', 'Bavaria', 'NUGSA Munich brings together Ghanaian students in Bavaria''s capital. We focus on academic excellence, cultural preservation, and community building.', 'munich@nugsa-germany.org', '2019-09-20', 38, 'Second Sunday of every month at 2:00 PM'
WHERE NOT EXISTS (SELECT 1 FROM public.chapters WHERE city = 'Munich');

INSERT INTO public.chapters (name, city, region, description, contact_email, established_date, member_count, meeting_schedule)
SELECT 'NUGSA Hamburg', 'Hamburg', 'Hamburg', 'The Hamburg chapter serves the vibrant Ghanaian student community in Northern Germany. We emphasize professional development and cultural exchange.', 'hamburg@nugsa-germany.org', '2020-01-10', 32, 'Third Saturday of every month at 4:00 PM'
WHERE NOT EXISTS (SELECT 1 FROM public.chapters WHERE city = 'Hamburg');

INSERT INTO public.chapters (name, city, region, description, contact_email, established_date, member_count, meeting_schedule)
SELECT 'NUGSA Frankfurt', 'Frankfurt', 'Hesse', 'NUGSA Frankfurt connects Ghanaian students in the financial capital of Germany. We organize career workshops, cultural celebrations, and social gatherings.', 'frankfurt@nugsa-germany.org', '2020-06-05', 28, 'Last Friday of every month at 6:00 PM'
WHERE NOT EXISTS (SELECT 1 FROM public.chapters WHERE city = 'Frankfurt');


-- Insert sample chapter leaders
INSERT INTO public.chapter_leaders (chapter_id, name, position, bio, email, order_priority)
SELECT id, 'Kwame Mensah', 'Chapter President', 'PhD candidate in Computer Science at TU Berlin. Passionate about technology and community building.', 'kwame.mensah@example.com', 1
FROM public.chapters WHERE city = 'Berlin'
AND NOT EXISTS (SELECT 1 FROM public.chapter_leaders WHERE name = 'Kwame Mensah');

INSERT INTO public.chapter_leaders (chapter_id, name, position, bio, email, order_priority)
SELECT id, 'Ama Osei', 'Vice President', 'Master''s student in International Relations at Humboldt University. Dedicated to student welfare and advocacy.', 'ama.osei@example.com', 2
FROM public.chapters WHERE city = 'Berlin'
AND NOT EXISTS (SELECT 1 FROM public.chapter_leaders WHERE name = 'Ama Osei');

INSERT INTO public.chapter_leaders (chapter_id, name, position, bio, email, order_priority)
SELECT id, 'Akosua Boateng', 'Chapter President', 'Medical student at LMU Munich. Committed to healthcare advocacy and student support.', 'akosua.boateng@example.com', 1
FROM public.chapters WHERE city = 'Munich'
AND NOT EXISTS (SELECT 1 FROM public.chapter_leaders WHERE name = 'Akosua Boateng');


-- Insert sample chapter activities
INSERT INTO public.chapter_activities (chapter_id, title, description, date, location, category, attendees_count, is_featured)
SELECT id, 'Ghana Independence Day Celebration', 'Annual celebration of Ghana''s independence with cultural performances, traditional food, and networking.', '2024-03-06 18:00:00+00', 'TU Berlin Main Hall', 'Cultural', 120, true
FROM public.chapters WHERE city = 'Berlin'
AND NOT EXISTS (SELECT 1 FROM public.chapter_activities WHERE title = 'Ghana Independence Day Celebration');
