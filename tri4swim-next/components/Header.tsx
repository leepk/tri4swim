import Link from 'next/link'
export default function Header(){return <header className="header"><Link href="/" className="brand"><img src="/logo.png" alt="Tri4Swim"/></Link><nav><Link href="/">Home</Link><a href="/#lessons">Lessons</a><Link href="/booking">Book a Lesson</Link></nav><Link className="btn small" href="/booking">Book a Lesson</Link></header>}
