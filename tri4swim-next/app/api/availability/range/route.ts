import {NextRequest,NextResponse} from 'next/server'
import {prisma} from '@/lib/db'
import {getAvailableSlots,getBusyIntervals} from '@/lib/booking-availability'

const parse=(s:string)=>{const [y,m,d]=s.split('-').map(Number);return y&&m&&d?new Date(y,m-1,d,12):null}
const ymd=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
const hm=(d:Date)=>`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
const allStarts=(duration:number)=>{const out:string[]=[];for(let minute=10*60;minute+duration<=22*60;minute+=15)out.push(`${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`);return out}

export async function GET(req:NextRequest){
 const q=req.nextUrl.searchParams,start=parse(q.get('startDate')||''),end=parse(q.get('endDate')||''),lessonTypeId=Number(q.get('lessonTypeId'))
 if(!start||!end||end<start||!lessonTypeId)return NextResponse.json({error:'Invalid date range or lesson.'},{status:400})
 const lesson=await prisma.lessonType.findFirst({where:{id:lessonTypeId,active:true}})
 if(!lesson)return NextResponse.json({error:'Lesson not found.'},{status:404})

 const starts=allStarts(lesson.durationMin),busyByDate:Record<string,string[]>={},weekdayByDate:Record<string,number>={},busyIntervals:Record<string,any[]>={}
 const now=new Date()
 for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){
   const copy=new Date(d),key=ymd(copy)
   if(new Date(copy.getFullYear(),copy.getMonth(),copy.getDate(),23,59,59,999)<now) continue
   const [available,busy]=await Promise.all([getAvailableSlots(prisma,key,lessonTypeId),getBusyIntervals(prisma,key)])
   const ok=new Set(available)
   busyByDate[key]=starts.filter(x=>!ok.has(x))
   weekdayByDate[key]=copy.getDay()
   busyIntervals[key]=busy.map(x=>({start:hm(x.start),end:hm(x.end),source:x.source,appointmentId:x.id}))
 }
 return NextResponse.json({durationMin:lesson.durationMin,starts,busyByDate,weekdayByDate,busyIntervals})
}
