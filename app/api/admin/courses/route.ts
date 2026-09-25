import {NextRequest,NextResponse} from 'next/server';import {prisma} from '@/lib/db';import {ADMIN_COOKIE,validSession} from '@/lib/admin-auth'
const auth=(r:NextRequest)=>validSession(r.cookies.get(ADMIN_COOKIE)?.value),parse=(s:string)=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12)}
export async function GET(r:NextRequest){if(!auth(r))return NextResponse.json({error:'Unauthorized'},{status:401});return NextResponse.json(await prisma.course.findMany({include:{lessonType:true,schedules:true,appointments:{orderBy:{start:'asc'}}},orderBy:{startDate:'desc'}}))}
export async function POST(r:NextRequest){if(!auth(r))return NextResponse.json({error:'Unauthorized'},{status:401});try{const b=await r.json(),sd=parse(b.startDate),ed=parse(b.endDate);if(ed<sd) return NextResponse.json({error:'End date must be after start date.'},{status:400});if(!Array.isArray(b.schedules)||!b.schedules.length)return NextResponse.json({error:'Choose at least one weekly day/time.'},{status:400});const occurrences:any[]=[];for(let d=new Date(sd);d<=ed;d.setDate(d.getDate()+1)){for(const x of b.schedules){if(d.getDay()===Number(x.weekday)){const [sh,sm]=x.startTime.split(':').map(Number),[eh,em]=x.endTime.split(':').map(Number);const start=new Date(d.getFullYear(),d.getMonth(),d.getDate(),sh,sm),end=new Date(d.getFullYear(),d.getMonth(),d.getDate(),eh,em);if(end>start)occurrences.push({start,end})}}}const c=await prisma.course.create({data:{lessonTypeId:Number(b.lessonTypeId),parentName:b.parentName,studentName:b.studentName||null,email:b.email,phone:b.phone||null,notes:b.notes||null,startDate:sd,endDate:ed,schedules:{create:b.schedules.map((x:any)=>({weekday:Number(x.weekday),startTime:x.startTime,endTime:x.endTime}))},appointments:{create:occurrences}},include:{lessonType:true,schedules:true,appointments:true}});return NextResponse.json(c,{status:201})}catch(e:any){return NextResponse.json({error:e.message},{status:500})}}

export async function PATCH(r:NextRequest){
 if(!auth(r))return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  const b=await r.json(),id=Number(b.id);if(!id)return NextResponse.json({error:'Course id is required.'},{status:400});
  const sd=parse(b.startDate),ed=parse(b.endDate);if(ed<sd)return NextResponse.json({error:'End date must be after start date.'},{status:400});
  if(!Array.isArray(b.schedules)||!b.schedules.length)return NextResponse.json({error:'Choose at least one weekly day/time.'},{status:400});
  const occurrences:any[]=[];
  for(let d=new Date(sd);d<=ed;d.setDate(d.getDate()+1))for(const x of b.schedules)if(d.getDay()===Number(x.weekday)){
   const [sh,sm]=x.startTime.split(':').map(Number),[eh,em]=x.endTime.split(':').map(Number),start=new Date(d.getFullYear(),d.getMonth(),d.getDate(),sh,sm),end=new Date(d.getFullYear(),d.getMonth(),d.getDate(),eh,em);if(end>start)occurrences.push({start,end})
  }
  const c=await prisma.$transaction(async tx=>{
   await tx.courseAppointment.deleteMany({where:{courseId:id}});await tx.courseSchedule.deleteMany({where:{courseId:id}});
   return tx.course.update({where:{id},data:{lessonTypeId:Number(b.lessonTypeId),parentName:b.parentName,studentName:b.studentName||null,email:b.email,phone:b.phone||null,notes:b.notes||null,startDate:sd,endDate:ed,active:b.active!==false,schedules:{create:b.schedules.map((x:any)=>({weekday:Number(x.weekday),startTime:x.startTime,endTime:x.endTime}))},appointments:{create:occurrences}},include:{lessonType:true,schedules:true,appointments:{orderBy:{start:'asc'}}}})
  });return NextResponse.json(c)
 }catch(e:any){return NextResponse.json({error:e.message},{status:500})}
}
