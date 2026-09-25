'use client'
import {useState} from 'react'
import {CalendarPicker,ymd} from '@/components/CalendarPicker'
const pretty=(s:string)=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString([],{weekday:'long',month:'long',day:'numeric',year:'numeric'})}

export default function BookingClient(){
 const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1)
 const [date,setDate]=useState(ymd(tomorrow)); const [time,setTime]=useState('10:00'); const [msg,setMsg]=useState(''); const [sent,setSent]=useState(false)
 async function submit(e:any){e.preventDefault();setMsg('Sending...');const f=new FormData(e.currentTarget);const [y,m,d]=date.split('-').map(Number);const [hh,mm]=time.split(':').map(Number);const start=new Date(y,m-1,d,hh,mm).toISOString();const r=await fetch('/api/bookings',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({start,parentName:f.get('parentName'),studentName:f.get('studentName'),email:f.get('email'),phone:f.get('phone'),notes:f.get('notes')})});const x=await r.json();if(r.ok){setSent(true);setMsg('Thanks! Your preferred date and time were sent. The coach will contact you to confirm.')}else setMsg(x.error||'Unable to send request.')}
 return <div className="booking-card request-card">
   <div className="booking-step"><span>1</span><div><b>Preferred date & time</b><small>Pick any date and time that works best for you.</small></div></div>
   <div className="request-date-grid"><CalendarPicker value={date} onChange={setDate}/><div className="preferred-time"><span className="time-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7.5v5l3.3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></span><b>Preferred time</b><p>{pretty(date)}</p><label>Time<input type="time" value={time} onChange={e=>setTime(e.target.value)} required/></label><small>This is a request only. The coach will contact you to confirm or suggest another time.</small></div></div>
   <div className="booking-step"><span>2</span><div><b>Your information</b><small>How should the coach contact you?</small></div></div>
   <form onSubmit={submit}><div className="formgrid"><label>Your Name<input name="parentName" required/></label><label>Student Name <small>(optional)</small><input name="studentName"/></label><label>Email <small>(optional)</small><input name="email" type="email"/></label><label>Phone<input name="phone" required/></label></div><label>Message / swimming goals <small>(optional)</small><textarea name="notes" rows={3}/></label><button className="btn booking-submit" disabled={sent}>{sent?'Request Sent ✓':'Send Request →'}</button><p className="success" aria-live="polite">{msg}</p></form>
 </div>
}
