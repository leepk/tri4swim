import Header from '@/components/Header'
import BookingClient from './BookingClient'
export default function Page(){return <><Header/><main className="booking-wrap"><div className="booking-head"><span className="eyebrow">BOOK A LESSON</span><h1>Choose Your Lesson Time</h1><p>Choose your recurring schedule. Times are available daily from 10:00 AM to 10:00 PM, excluding busy periods.</p></div><BookingClient/></main></>}
