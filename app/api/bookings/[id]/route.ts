import { NextRequest,NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendBookingEmail } from '@/lib/email'
import {ADMIN_COOKIE,validSession} from '@/lib/admin-auth'
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!validSession(req.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.json({error:'Unauthorized'},{status:401});
 const {id}=await params; const b=await req.json(); const old=await prisma.booking.findUnique({where:{id:Number(id)},include:{lessonType:true}}); if(!old)return NextResponse.json({error:'Not found'},{status:404})
 const status=b.status as 'PENDING'|'CONFIRMED'|'CANCELLED'; const updated=await prisma.booking.update({where:{id:old.id},data:{status,confirmedAt:status==='CONFIRMED'?new Date():old.confirmedAt,cancelledAt:status==='CANCELLED'?new Date():null},include:{lessonType:true}})
 if(status==='CONFIRMED') await sendBookingEmail(updated.email,'Your Tri4Swim lesson is confirmed',`<h2>Your Tri4Swim time is confirmed</h2><p>${updated.lessonType?.name || 'Swim lesson'}</p><p>${updated.start.toLocaleString()}</p>`)
 if(status==='CANCELLED') await sendBookingEmail(updated.email,'Tri4Swim lesson cancelled',`<p>Your lesson on ${updated.start.toLocaleString()} has been cancelled.</p>`)
 return NextResponse.json(updated)
}
