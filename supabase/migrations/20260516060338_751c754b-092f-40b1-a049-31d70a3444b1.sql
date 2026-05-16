
-- Cleanup: remove duplicate boutique pages (same boutique + same title),
-- keeping the one with the lowest position. Also remove their scenes
-- since there is no FK cascade.
WITH ranked AS (
  SELECT id, boutique_id, title,
    ROW_NUMBER() OVER (PARTITION BY boutique_id, title ORDER BY position ASC, created_at ASC) AS rn
  FROM public.boutique_pages
),
dups AS (
  SELECT id FROM ranked WHERE rn > 1
)
DELETE FROM public.boutique_scenes WHERE page_id IN (SELECT id FROM dups);

WITH ranked AS (
  SELECT id, boutique_id, title,
    ROW_NUMBER() OVER (PARTITION BY boutique_id, title ORDER BY position ASC, created_at ASC) AS rn
  FROM public.boutique_pages
)
DELETE FROM public.boutique_pages WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Re-pack positions to be contiguous per boutique.
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY boutique_id ORDER BY position, created_at) - 1 AS new_pos
  FROM public.boutique_pages
)
UPDATE public.boutique_pages p SET position = o.new_pos
FROM ordered o WHERE o.id = p.id AND p.position <> o.new_pos;
