-- Foundation for Mo + diary cluster map (premium feature, see ROADMAP.md).
--
-- Two tables:
--   diary_embeddings — semantic embedding per diary entry, computed lazily
--                      after entry is saved. Used for clustering.
--   diary_clusters    — cached cluster assignments + summaries per user,
--                      recomputed nightly or on demand.
--
-- These are scaffolds — the embedding/clustering jobs aren't wired up yet.
-- See ROADMAP.md for the engineering notes (UMAP/t-SNE projection, HDBSCAN
-- or k-means, Claude-generated cluster synopses, Mo's chat interface).

-- ── Per-entry embedding ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diary_embeddings (
  diary_entry_id   uuid PRIMARY KEY REFERENCES diary_entries(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Semantic embedding from Claude / OpenAI. Stored as JSON array of floats
  -- to keep things portable; if we move to pgvector later, migrate then.
  embedding        jsonb NOT NULL,
  embedding_model  text NOT NULL,   -- e.g. "text-embedding-3-small"
  embedding_dim    integer NOT NULL, -- 1536, 3072, etc.
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS diary_embeddings_user_idx ON diary_embeddings(user_id);

ALTER TABLE diary_embeddings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own embeddings" ON diary_embeddings;
CREATE POLICY "Users see own embeddings"
  ON diary_embeddings FOR SELECT
  USING (auth.uid() = user_id);

-- Only the service role (background job) writes embeddings.

-- ── Per-user cluster cache ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diary_clusters (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  computed_at         timestamptz NOT NULL DEFAULT now(),
  -- Cluster index (0, 1, 2…) for this snapshot.
  cluster_index       integer NOT NULL,
  -- Optional Claude-generated label + synopsis, written after cluster forms.
  label               text,
  synopsis            text,
  -- 2D centroid for visualization (UMAP/t-SNE projection).
  centroid_2d_x       double precision,
  centroid_2d_y       double precision,
  -- How many entries fall in this cluster.
  entry_count         integer NOT NULL DEFAULT 0,
  UNIQUE (user_id, computed_at, cluster_index)
);

CREATE INDEX IF NOT EXISTS diary_clusters_user_recent
  ON diary_clusters(user_id, computed_at DESC);

ALTER TABLE diary_clusters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own clusters" ON diary_clusters;
CREATE POLICY "Users see own clusters"
  ON diary_clusters FOR SELECT
  USING (auth.uid() = user_id);

-- Per-entry cluster membership for the latest snapshot.
-- Separate from diary_clusters so re-clustering is cheap (drop + insert).
CREATE TABLE IF NOT EXISTS diary_entry_clusters (
  diary_entry_id      uuid NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  computed_at         timestamptz NOT NULL,
  cluster_index       integer NOT NULL,
  -- 2D position of THIS entry in the projected space.
  pos_2d_x            double precision,
  pos_2d_y            double precision,
  PRIMARY KEY (diary_entry_id, computed_at)
);

CREATE INDEX IF NOT EXISTS diary_entry_clusters_user_recent
  ON diary_entry_clusters(user_id, computed_at DESC);

ALTER TABLE diary_entry_clusters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own entry-cluster mappings" ON diary_entry_clusters;
CREATE POLICY "Users see own entry-cluster mappings"
  ON diary_entry_clusters FOR SELECT
  USING (auth.uid() = user_id);

-- ── Mo conversation history ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mo_conversations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  archived        boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS mo_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES mo_conversations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- "user" | "mo" — identical roles to OpenAI chat format minus "system".
  role            text NOT NULL CHECK (role IN ('user','mo')),
  content         text NOT NULL,
  -- Optional: which diary entries Mo cited in this message (array of ids).
  cited_entries   jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mo_messages_conversation_idx
  ON mo_messages(conversation_id, created_at);

ALTER TABLE mo_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mo_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own conversations" ON mo_conversations;
CREATE POLICY "Users own conversations"
  ON mo_conversations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own messages" ON mo_messages;
CREATE POLICY "Users own messages"
  ON mo_messages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
