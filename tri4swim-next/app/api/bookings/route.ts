import { NextRequest,NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendBookingEmail } from '@/lib/email'
import {ADMIN_COOKIE,validSession} from '@/lib/admin-auth'
export async function GET(req:NextRequest){ if(!validSession(req.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.json({error:'Unauthorized'},{status:401}); return NextResponse.json(await prisma.booking.findMany({include:{lessonType:true},orderBy:{start:'asc'}})) }
export async function POST(req:NextRequest){
 try{
  const b=await req.json(); const isAdmin=validSession(req.cookies.get(ADMIN_COOKIE)?.value); const adminSource=b.source==='ADMIN'&&isAdmin
  const parentName=String(b.parentName||'').trim(); const phone=String(b.phone||'').trim(); const email=String(b.email||'').trim()
  if(!parentName) return NextResponse.json({error:'Name is required.'},{status:400})
  if(!phone) return NextResponse.json({error:'Phone is required.'},{status:400})
  const start=new Date(b.start); if(Number.isNaN(start.getTime())) return NextResponse.json({error:'Please choose a date and time.'},{status:400})
  let lesson:any=null
  if(adminSource){ lesson=await prisma.lessonType.findUnique({where:{id:Number(b.lessonTypeId)}}); if(!lesson)return NextResponse.json({error:'Lesson not found'},{status:400}) }
  const duration=lesson?.durationMin||60, end=new Date(start.getTime()+duration*60000)
  const booking=await prisma.booking.create({data:{lessonTypeId:lesson?.id||null,start,end,parentName,studentName:b.studentName||null,email,phone,notes:b.notes||null,source:adminSource?'ADMIN':'WEBSITE',status:adminSource?'CONFIRMED':'PENDING'},include:{lessonType:true}})
  if(!adminSource) {
    if(booking.email) await sendBookingEmail(booking.email,'Tri4Swim booking request received',`<p>Hi ${booking.parentName},</p><p>We received your preferred swim date and time: <strong>${start.toLocaleString()}</strong>.</p><p>This is a booking request. The coach will contact you to confirm the course details and schedule.</p>`).catch(console.error)
    if(process.env.ADMIN_EMAIL) await sendBookingEmail(process.env.ADMIN_EMAIL,'New Tri4Swim booking request',`<p><strong>${booking.parentName}</strong> submitted a booking request.</p><p>Preferred time: ${start.toLocaleString()}<br>Email: ${booking.email}<br>Phone: ${booking.phone||'-'}</p>`).catch(console.error)
  }
  return NextResponse.json(booking,{status:201})
 }catch(e:any){return NextResponse.json({error:e.message||'Unable to send request'},{status:500})}
}
