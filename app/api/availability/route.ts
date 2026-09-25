import { NextRequest,NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function GET(req:NextRequest){
 const date=req.nextUrl.searchParams.get('date'); const lessonId=Number(req.nextUrl.searchParams.get('lessonTypeId')); if(!date||!lessonId)return NextResponse.json([])
 const lesson=await prisma.lessonType.findUnique({where:{id:lessonId}}); if(!lesson)return NextResponse.json([])
 const day=new Date(`${date}T12:00:00`); const rule=await prisma.availability.findFirst({where:{weekday:day.getDay(),active:true}}); if(!rule)return NextResponse.json([])
 const [sh,sm]=rule.startTime.split(':').map(Number),[eh,em]=rule.endTime.split(':').map(Number); const startDay=new Date(`${date}T00:00:00`), endDay=new Date(`${date}T23:59:59`)
 const [bookings,blocked]=await Promise.all([prisma.booking.findMany({where:{status:{in:['PENDING','CONFIRMED']},start:{gte:startDay,lte:endDay}}}),prisma.blockedTime.findMany({where:{start:{lte:endDay},end:{gte:startDay}}})])
 const slots=[]; for(let m=sh*60+sm;m+lesson.durationMin<=eh*60+em;m+=rule.slotMin){const s=new Date(`${date}T00:00:00`);s.setMinutes(m);const e=new Date(s.getTime()+lesson.durationMin*60000);if(!bookings.some(x=>x.start<e&&x.end>s)&&!blocked.some(x=>x.start<e&&x.end>s)&&s>new Date())slots.push(s.toISOString())}
 return NextResponse.json(slots)
}
