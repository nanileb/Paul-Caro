-- Réponses RSVP (une ligne par formulaire envoyé, modifiable via son jeton)
CREATE TABLE rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT NOT NULL UNIQUE,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT,
  groupe TEXT,
  absent INTEGER NOT NULL DEFAULT 0,
  guests INTEGER NOT NULL DEFAULT 0,      -- mode simple : nombre total de personnes
  events TEXT NOT NULL DEFAULT '{}',      -- mode par événement : {"ceremonie": 2, ...}
  companions TEXT,
  dietary TEXT,
  menu TEXT,
  message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX rsvps_email ON rsvps(email);

-- Liste des invités attendus (relances)
CREATE TABLE invites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  nombre_personnes INTEGER NOT NULL DEFAULT 1,
  statut TEXT NOT NULL DEFAULT 'en_attente', -- en_attente | repondu
  date_reponse TEXT,
  rsvp_id INTEGER,
  origine TEXT NOT NULL DEFAULT 'manuel',    -- manuel | import
  ambigu INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
