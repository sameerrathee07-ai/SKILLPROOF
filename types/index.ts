import type { PitchInput, ScoreResult } from "@/lib/scoring/engine";

export type FrictionCategory =
  | "STUDENT_RETENTION"
  | "SCHEDULING"
  | "ADMIN_WORKFLOW";

export type OrgType =
  | "COACHING_CENTER"
  | "TUITION_ACADEMY"
  | "COLLEGE_DEPT";

export type ProblemStatus = "OPEN" | "CLOSED";
export type UserRole = "SOLVER" | "POSTER" | "ADMIN";

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  role: string;
  tokens: number;
  credibilityScore: number;
  createdAt: Date;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  type: string;
  createdAt: Date;
  _count?: {
    problems: number;
  };
}

export interface ProblemItem {
  id: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    type: string;
  };
  title: string;
  description: string;
  frictionCategory: string;
  status: string;
  createdAt: Date;
  totalPitches: number;
  vettedPitches: number;
}

export interface PitchDetail {
  id: string;
  problemId: string;
  solverId: string;
  solver: UserSummary;
  problem?: {
    id: string;
    title: string;
    description: string;
    frictionCategory: string;
    organization: {
      id: string;
      name: string;
      type: string;
    };
  };
  score: number;
  passed: boolean;
  knockedOut: boolean;
  stepData: string;
  stepDataParsed: PitchInput;
  scoreBreakdown: string;
  scoreBreakdownParsed: ScoreResult;
  revisionCount: number;
  createdAt: Date;
}

export interface VettedInboxData {
  problem: {
    id: string;
    title: string;
    description: string;
    frictionCategory: string;
    organization: {
      id: string;
      name: string;
      type: string;
    };
  };
  totalSubmissions: number;
  blockedNoise: number;
  vettedCount: number;
  proposals: PitchDetail[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}
