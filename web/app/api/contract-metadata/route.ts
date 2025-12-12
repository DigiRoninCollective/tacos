import { NextResponse } from "next/server";
import contractMetadata from "@/data/contract-metadata.json";

export function GET() {
  return NextResponse.json(contractMetadata);
}
