import { NextResponse } from "next/server";
import { runCalibrationSuite } from "@/lib/scoring/calibrationData";

export async function GET() {
  try {
    const report = runCalibrationSuite();
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
