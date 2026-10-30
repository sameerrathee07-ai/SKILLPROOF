-- Enable Row-Level Security (RLS) on all public tables
-- This ensures that any direct query or public key access is strictly confined
-- to the authenticated user's own data according to least privilege.

-- 1. Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Problem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pitch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TokenPurchase" ENABLE ROW LEVEL SECURITY;

-- 2. User Policies
-- Anyone can view basic public profile info
CREATE POLICY "Public profiles are viewable by everyone" ON "User"
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON "User"
  FOR UPDATE USING (auth.uid()::text = id);

-- 3. Account Policies
CREATE POLICY "Users can view own accounts" ON "Account"
  FOR SELECT USING (auth.uid()::text = "userId");

-- 4. Session Policies
CREATE POLICY "Users can view own sessions" ON "Session"
  FOR SELECT USING (auth.uid()::text = "userId");

-- 5. Organization Policies
-- Organizations are readable by everyone
CREATE POLICY "Organizations are viewable by everyone" ON "Organization"
  FOR SELECT USING (true);

-- Only owners or admins can modify organizations
CREATE POLICY "Owners can update own organizations" ON "Organization"
  FOR UPDATE USING (auth.uid()::text = "ownerId");

CREATE POLICY "Authenticated users can create organizations" ON "Organization"
  FOR INSERT WITH CHECK (auth.uid()::text = "ownerId");

-- 6. Problem Policies
-- Open problems are viewable by all users
CREATE POLICY "Problems are viewable by everyone" ON "Problem"
  FOR SELECT USING (true);

-- Only organization owner or poster can create/update problem
CREATE POLICY "Posters can create problems" ON "Problem"
  FOR INSERT WITH CHECK (
    auth.uid()::text = "postedById" OR
    EXISTS (
      SELECT 1 FROM "Organization"
      WHERE "Organization".id = "organizationId"
        AND "Organization"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "Posters can update own problems" ON "Problem"
  FOR UPDATE USING (
    auth.uid()::text = "postedById" OR
    EXISTS (
      SELECT 1 FROM "Organization"
      WHERE "Organization".id = "organizationId"
        AND "Organization"."ownerId" = auth.uid()::text
    )
  );

-- 7. Pitch Policies
-- Solvers can see their own pitches
CREATE POLICY "Solvers can view own pitches" ON "Pitch"
  FOR SELECT USING (auth.uid()::text = "solverId");

-- Organizations can view vetted (passed) pitches on their problems
CREATE POLICY "Posters can view vetted pitches on their problems" ON "Pitch"
  FOR SELECT USING (
    passed = true AND EXISTS (
      SELECT 1 FROM "Problem"
      JOIN "Organization" ON "Organization".id = "Problem"."organizationId"
      WHERE "Problem".id = "Pitch"."problemId"
        AND ("Problem"."postedById" = auth.uid()::text OR "Organization"."ownerId" = auth.uid()::text)
    )
  );

-- Solvers can insert their own pitches
CREATE POLICY "Solvers can create own pitches" ON "Pitch"
  FOR INSERT WITH CHECK (auth.uid()::text = "solverId");

-- Only problem owner can update proposal status
CREATE POLICY "Posters can update proposal status" ON "Pitch"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Problem"
      JOIN "Organization" ON "Organization".id = "Problem"."organizationId"
      WHERE "Problem".id = "Pitch"."problemId"
        AND ("Problem"."postedById" = auth.uid()::text OR "Organization"."ownerId" = auth.uid()::text)
    )
  );

-- 8. TokenPurchase Policies
CREATE POLICY "Users can view own token purchases" ON "TokenPurchase"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create own token purchases" ON "TokenPurchase"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");
