import {NextRequest,NextResponse} from 'next/server'
import {Prisma} from '@prisma/client'
import {prisma} from '@/lib/db'
import {sendBookingEmail} from '@/lib/email'
import {ADMIN_COOKIE,validSession} from '@/lib/admin-auth'
import {getAvailableSlots} from '@/lib/booking-availability'
const parse=(s:string)=>{const [y,m,d]=s.split('-').map(Number);return y&&m&&d?new Date(y,m-1,d,12):null}
const ymd=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
const at=(d:Date,t:string)=>{const [h,m]=t.split(':').map(Number);return new Date(d.getFullYear(),d.getMonth(),d.getDate(),h,m)}
export async function GET(req:NextRequest){if(!validSession(req.cookies.get(ADMIN_COOKIE)?.value))return NextResponse.json({error:'Unauthorized'},{status:401});return NextResponse.json(await prisma.booking.findMany({include:{lessonType:true,schedules:true},orderBy:{createdAt:'desc'}}))}
export async function POST(req:NextRequest){
 try{const b=await req.json(),parentName=String(b.parentName||'').trim(),phone=String(b.phone||'').trim(),email=String(b.email||'').trim();if(!parentName)return NextResponse.json({error:'Name is required.'},{status:400});if(!phone)return NextResponse.json({error:'Phone is required.'},{status:400})
  const lesson=await prisma.lessonType.findFirst({where:{id:Number(b.lessonTypeId),active:true}});if(!lesson)return NextResponse.json({error:'Please choose a lesson.'},{status:400})
  const sd=parse(String(b.startDate||'')),ed=parse(String(b.endDate||'')),rows=Array.isArray(b.schedules)?b.schedules:[];if(!sd||!ed||ed<sd)return NextResponse.json({error:'Please choose a valid From date and To date.'},{status:400});if(!rows.length)return NextResponse.json({error:'Choose at least one weekly day/time.'},{status:400})
  const occurrences:{start:Date,end:Date}[]=[]
  for(let d=new Date(sd);d<=ed;d.setDate(d.getDate()+1))for(const r of rows)if(d.getDay()===Number(r.weekday)){const slots=await getAvailableSlots(prisma,ymd(d),lesson.id);if(!slots.includes(r.startTime))return NextResponse.json({error:`${d.toLocaleDateString()} at ${r.startTime} is no longer available. Please choose another schedule.`},{status:409});const start=at(d,r.startTime),end=new Date(start.getTime()+lesson.durationMin*60000);occurrences.push({start,end})}
  if(!occurrences.length)return NextResponse.json({error:'The selected days do not occur inside this date range.'},{status:400})
  const first=occurrences.sort((a,c)=>+a.start-+c.start)[0]
  const booking=await prisma.$transaction(async tx=>tx.booking.create({data:{lessonTypeId:lesson.id,start:first.start,end:first.end,requestStartDate:sd,requestEndDate:ed,parentName,studentName:b.studentName||null,email,phone,notes:b.notes||null,source:'WEBSITE',status:'PENDING',schedules:{create:rows.map((r:any)=>({weekday:Number(r.weekday),startTime:r.startTime,endTime:r.endTime}))}},include:{lessonType:true,schedules:true}}),{isolationLevel:Prisma.TransactionIsolationLevel.Serializable})
  const schedule=booking.schedules.map(x=>`${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][x.weekday]} ${x.startTime}–${x.endTime}`).join('<br>')
  if(booking.email)await sendBookingEmail(booking.email,'Tri4Swim booking request received',`<p>Hi ${booking.parentName},</p><p>We received your ${booking.lessonType?.name||'swim lesson'} schedule request.</p><p>${sd.toLocaleDateString()} – ${ed.toLocaleDateString()}<br>${schedule}</p><p>The coach will review it and contact you.</p>`).catch(console.error)
  if(process.env.ADMIN_EMAIL)await sendBookingEmail(process.env.ADMIN_EMAIL,'New Tri4Swim booking request',`<p><strong>${booking.parentName}</strong> requested ${booking.lessonType?.name||'swim lessons'}.</p><p>${sd.toLocaleDateString()} – ${ed.toLocaleDateString()}<br>${schedule}<br>Phone: ${booking.phone||'-'}</p>`).catch(console.error)
  return NextResponse.json(booking,{status:201})
 }catch(e:any){if(e?.code==='P2034')return NextResponse.json({error:'The schedule changed while booking. Please try again.'},{status:409});return NextResponse.json({error:e.message||'Unable to book lesson'},{status:500})}
}
