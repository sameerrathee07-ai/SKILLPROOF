-- Enable Row-Level Security (RLS) on all public tables
-- Ensures least privilege for any direct database or Supabase client access.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Problem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pitch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TokenPurchase" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public profiles are viewable by everyone') THEN
    CREATE POLICY "Public profiles are viewable by everyone" ON "User" FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON "User" FOR UPDATE USING (auth.uid()::text = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own accounts') THEN
    CREATE POLICY "Users can view own accounts" ON "Account" FOR SELECT USING (auth.uid()::text = "userId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own sessions') THEN
    CREATE POLICY "Users can view own sessions" ON "Session" FOR SELECT USING (auth.uid()::text = "userId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Organizations are viewable by everyone') THEN
    CREATE POLICY "Organizations are viewable by everyone" ON "Organization" FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Problems are viewable by everyone') THEN
    CREATE POLICY "Problems are viewable by everyone" ON "Problem" FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Solvers can view own pitches') THEN
    CREATE POLICY "Solvers can view own pitches" ON "Pitch" FOR SELECT USING (auth.uid()::text = "solverId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Solvers can create own pitches') THEN
    CREATE POLICY "Solvers can create own pitches" ON "Pitch" FOR INSERT WITH CHECK (auth.uid()::text = "solverId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own token purchases') THEN
    CREATE POLICY "Users can view own token purchases" ON "TokenPurchase" FOR SELECT USING (auth.uid()::text = "userId");
  END IF;
END $$;
