-- Enfants par événement : {"ceremonie": 1, ...}. La colonne events garde alors le nombre d'adultes.
ALTER TABLE rsvps ADD COLUMN enfants TEXT NOT NULL DEFAULT '{}';
