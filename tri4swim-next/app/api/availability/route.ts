import { NextRequest,NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAvailableSlots } from '@/lib/booking-availability'

export async function GET(req:NextRequest){
  const date=String(req.nextUrl.searchParams.get('date')||'')
  const lessonTypeId=Number(req.nextUrl.searchParams.get('lessonTypeId'))
  if(!date || !lessonTypeId) return NextResponse.json([])
  return NextResponse.json(await getAvailableSlots(prisma,date,lessonTypeId))
}
