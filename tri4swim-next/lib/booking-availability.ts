import { Prisma, PrismaClient } from '@prisma/client'

type Db = PrismaClient | Prisma.TransactionClient

const parseDate = (date:string) => {
  const [y,m,d]=date.split('-').map(Number)
  if(!y||!m||!d) return null
  const value=new Date(y,m-1,d,12,0,0,0)
  return Number.isNaN(value.getTime()) ? null : value
}

export const atLocalTime = (date:string,time:string) => {
  const base=parseDate(date)
  const [h,min]=time.split(':').map(Number)
  if(!base || Number.isNaN(h) || Number.isNaN(min)) return null
  return new Date(base.getFullYear(),base.getMonth(),base.getDate(),h,min,0,0)
}

// Public booking availability intentionally uses the same real lesson source shown
// on the Admin Calendar: active CourseAppointments that are not CANCELLED.
// Pending booking requests, recurring definitions and BlockedTime do not silently
// remove public times because they are not rendered as lesson events on that calendar.
export async function getBusyIntervals(db:Db,date:string){
  const day=parseDate(date)
  if(!day) return []
  const startDay=new Date(day.getFullYear(),day.getMonth(),day.getDate(),0,0,0,0)
  const endDay=new Date(day.getFullYear(),day.getMonth(),day.getDate(),23,59,59,999)
  const appointments=await db.courseAppointment.findMany({
    where:{status:{not:'CANCELLED'},course:{active:true},start:{lte:endDay},end:{gte:startDay}},
    select:{id:true,start:true,end:true}
  })
  return appointments.map(x=>({id:x.id,start:x.start,end:x.end,source:'COURSE_APPOINTMENT' as const}))
}

export async function getAvailableSlots(db:Db,date:string,lessonTypeId:number){
  const day=parseDate(date)
  if(!day || !lessonTypeId) return []
  const lesson=await db.lessonType.findFirst({where:{id:lessonTypeId,active:true}})
  if(!lesson) return []

  const busy=await getBusyIntervals(db,date)
  const now=new Date()
  const OPEN_MINUTE=10*60, CLOSE_MINUTE=22*60, STEP_MINUTE=15
  const slots:string[]=[]
  for(let minute=OPEN_MINUTE;minute+lesson.durationMin<=CLOSE_MINUTE;minute+=STEP_MINUTE){
    const h=Math.floor(minute/60),m=minute%60
    const start=new Date(day.getFullYear(),day.getMonth(),day.getDate(),h,m,0,0)
    const end=new Date(start.getTime()+lesson.durationMin*60000)
    if(start<=now) continue
    // Touching endpoints are allowed: 10–11 does not conflict with 11–12.
    if(busy.some(x=>x.start<end && x.end>start)) continue
    slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
  }
  return slots
}
