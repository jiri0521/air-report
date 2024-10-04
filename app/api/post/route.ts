import { NextResponse } from "next/server";
import prisma from "@/lib/prismaClient";

export async function GET(req: Request){
const AllReport = await prisma.incident.findMany();
return NextResponse.json(AllReport);

}
