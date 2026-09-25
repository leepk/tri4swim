import Header from '@/components/Header'
import BookingClient from './BookingClient'
export default function Page(){return <><Header/><main className="booking-wrap"><div className="booking-head"><span className="eyebrow">REQUEST A LESSON</span><h1>Choose a Date and Time</h1><p>Tell us when you prefer to swim. No availability restrictions — the coach will contact you to confirm the details.</p></div><BookingClient/></main></>}
