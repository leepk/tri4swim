import Header from '@/components/Header'
import Link from 'next/link'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

type IconName = 'shield' | 'swimmer' | 'heart' | 'check'
function Icon({ name }: { name: IconName }) {
  const common = { width: 30, height: 30, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  if (name === 'shield') return <svg {...common}><path d="M12 3 19 6v5c0 4.6-2.8 8-7 10-4.2-2-7-5.4-7-10V6l7-3Z"/><path d="m9 12 2 2 4-5"/></svg>
  if (name === 'swimmer') return <svg {...common}><circle cx="16.5" cy="5.5" r="2"/><path d="m4 13 4-2 3-3 4 3 4 1"/><path d="M3 17c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6 0"/><path d="M3 20c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6 0"/></svg>
  if (name === 'heart') return <svg {...common}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>
  return <svg {...common}><path d="m5 12 4 4L19 6"/></svg>
}

export default async function Home() {
  let site: any = null
  let lessons: any[] = []
  try {
    ;[site, lessons] = await Promise.all([
      prisma.siteContent.findUnique({ where: { id: 1 } }),
      prisma.lessonType.findMany({ where: { active: true }, orderBy: { sort: 'asc' } }),
    ])
  } catch {}
  site ??= { heroEyebrow:'PRIVATE SWIM LESSONS', heroTitle:'Private Swim Lessons for Kids and Adults', heroText:'Build confidence, improve technique, and stay safe in the water with personalized, one-on-one coaching.', heroImage:'/images/hero.jpg', coachName:'Tri4Swim Coach', coachBio:'Personalized swim instruction focused on safety and technique.', coachImage:'/images/coach.jpg' }

  return <><Header/><main>
    <section className="hero-shell">
      <div className="hero"><div><span>{site.heroEyebrow}</span><h1>{site.heroTitle}</h1><p>{site.heroText}</p><Link className="btn" href="/booking">Book a Lesson →</Link></div><img src={site.heroImage || '/images/hero.jpg'} alt="Swim coaching"/><svg className="hero-wave" viewBox="0 0 1440 110" preserveAspectRatio="none" aria-hidden="true"><path d="M0,62 C280,8 430,98 720,54 C980,14 1190,82 1440,35 L1440,110 L0,110 Z" fill="white"/></svg></div>
      <div className="features">
        <div><i className="feature-icon"><Icon name="swimmer"/></i><b>{site.benefit1Title || 'Water Safety'}</b><small>{site.benefit1Text || 'Learn essential skills for a safer, more confident swim.'}</small></div>
        <div><i className="feature-icon bars"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 19v-5M12 19V9M19 19V4"/></svg></i><b>{site.benefit2Title || 'Better Technique'}</b><small>{site.benefit2Text || 'Improve form and swim more efficiently.'}</small></div>
        <div><i className="feature-icon"><Icon name="heart"/></i><b>{site.benefit3Title || 'All Ages Welcome'}</b><small>{site.benefit3Text || 'Kids, adults and all skill levels.'}</small></div>
      </div>
    </section>
    <section id="lessons" className="section"><span className="eyebrow">LESSONS</span><h2>{site.lessonsTitle || 'Find the Right Lesson for You'}</h2><div className="cards">{lessons.map(l=><article className="lesson" key={l.id}><img src={l.image || '/images/kids.jpg'} alt={l.name}/><div><h3>{l.name}</h3><p>{l.description}</p><Link href={`/booking?lesson=${l.id}`}>Choose lesson →</Link></div></article>)}</div></section>
    <section className="cta"><h2>{site.ctaTitle || 'Ready to get started?'}</h2><p>{site.ctaText || 'Send your preferred date and time. The coach will contact you to confirm.'}</p><Link className="btn" href="/booking">Book a Lesson →</Link></section>
    <section className="coach"><img src={site.coachImage || '/images/coach.jpg'} alt="Tri4Swim coach teaching a swimmer"/><div><span className="eyebrow">ABOUT TRI4SWIM</span><h2>{site.coachSectionTitle || 'Personal Coaching. Calm Progress.'}</h2><h3>{site.coachName}</h3><p>{site.coachBio}</p><div className="mini"><b><Icon name="check"/> Safety focused</b><b><Icon name="check"/> One-on-one coaching</b><b><Icon name="check"/> Technique first</b></div><Link className="btn" href="/booking">View Available Times →</Link></div></section>
  </main><footer><img src="/logo.png" alt="Tri4Swim"/><span>Private swim lessons • Tri4Swim</span></footer></>
}
