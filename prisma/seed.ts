import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  await prisma.siteContent.upsert({ where:{id:1}, update:{}, create:{id:1} })
  const lessons = [
    {name:'Kids Swim Lessons',description:'Safe, patient lessons that build water confidence and essential swimming skills.',image:'/images/kids.jpg',durationMin:60,sort:1},
    {name:'Adult Swim Lessons',description:'Personalized coaching for beginners and adults improving technique.',image:'/images/adult.jpg',durationMin:60,sort:2},
    {name:'Technique & Training',description:'Focused stroke, breathing and efficiency coaching for stronger swimmers.',image:'/images/technique.jpg',durationMin:60,sort:3},
  ]
  for (const l of lessons) {
    const existing = await prisma.lessonType.findUnique({where:{name:l.name}})
    // Keep admin-custom URLs, but repair old bundled defaults to the correct card image.
    const repairImage = !existing?.image || existing.image.startsWith('/images/')
    await prisma.lessonType.upsert({where:{name:l.name},update:repairImage?{image:l.image}:{},create:l})
  }
  if (await prisma.availability.count()===0) {
    await prisma.availability.createMany({data:[1,2,3,4,5].map(weekday=>({weekday,startTime:'09:00',endTime:'17:00',slotMin:60}))})
  }
  if (await prisma.testimonial.count()===0) await prisma.testimonial.createMany({data:[
    {name:'Parent',quote:'Patient, clear instruction and a very positive experience for our child.',rating:5,sort:1},
    {name:'Adult Student',quote:'The lessons helped me feel safer and much more confident in the water.',rating:5,sort:2}
  ]})
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>prisma.$disconnect())
