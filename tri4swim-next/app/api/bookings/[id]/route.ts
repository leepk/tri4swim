import {NextRequest,NextResponse} from 'next/server'
import {prisma} from '@/lib/db'
import {sendBookingEmail} from '@/lib/email'
import {ADMIN_COOKIE,validSession} from '@/lib/admin-auth'
const occurrences=(sd:Date,ed:Date,rows:any[])=>{const out:any[]=[];for(let d=new Date(sd);d<=ed;d.setDate(d.getDate()+1))for(const x of rows)if(d.getDay()===Number(x.weekday)){const [sh,sm]=x.startTime.split(':').map(Number),[eh,em]=x.endTime.split(':').map(Number),start=new Date(d.getFullYear(),d.getMonth(),d.getDate(),sh,sm),end=new Date(d.getFullYear(),d.getMonth(),d.getDate(),eh,em);if(end>start)out.push({start,end})}return out}
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!validSession(req.cookies.get(ADMIN_COOKIE)?.value))return NextResponse.json({error:'Unauthorized'},{status:401});const {id}=await params,b=await req.json(),old=await prisma.booking.findUnique({where:{id:Number(id)},include:{lessonType:true,schedules:true}});if(!old)return NextResponse.json({error:'Not found'},{status:404})
 const status=b.status as 'PENDING'|'CONFIRMED'|'CANCELLED'
 if(status==='CONFIRMED'&&old.status==='PENDING'){
  const sd=old.requestStartDate||old.start,ed=old.requestEndDate||old.start,rows=old.schedules.length?old.schedules:[{weekday:old.start.getDay(),startTime:`${String(old.start.getHours()).padStart(2,'0')}:${String(old.start.getMinutes()).padStart(2,'0')}`,endTime:`${String(old.end.getHours()).padStart(2,'0')}:${String(old.end.getMinutes()).padStart(2,'0')}`}]
  const apps=occurrences(sd,ed,rows)
  const result=await prisma.$transaction(async tx=>{const course=await tx.course.create({data:{lessonTypeId:old.lessonTypeId!,parentName:old.parentName,studentName:old.studentName,email:old.email,phone:old.phone,location:old.location,notes:old.notes,startDate:sd,endDate:ed,active:true,schedules:{create:rows.map(x=>({weekday:x.weekday,startTime:x.startTime,endTime:x.endTime}))},appointments:{create:apps}},include:{lessonType:true,schedules:true,appointments:true}});const booking=await tx.booking.update({where:{id:old.id},data:{status:'CONFIRMED',confirmedAt:new Date(),cancelledAt:null},include:{lessonType:true,schedules:true}});return {booking,course}})
  if(result.booking.email)await sendBookingEmail(result.booking.email,'Your Tri4Swim course is confirmed',`<h2>Your Tri4Swim course is confirmed</h2><p>${result.booking.lessonType?.name||'Swim lesson'}</p><p>${sd.toLocaleDateString()} – ${ed.toLocaleDateString()}</p>`).catch(console.error)
  return NextResponse.json(result)
 }
 const updated=await prisma.booking.update({where:{id:old.id},data:{status,cancelledAt:status==='CANCELLED'?new Date():null},include:{lessonType:true,schedules:true}});if(status==='CANCELLED'&&updated.email)await sendBookingEmail(updated.email,'Tri4Swim booking cancelled','<p>Your swim schedule request has been cancelled.</p>').catch(console.error);return NextResponse.json(updated)
}
