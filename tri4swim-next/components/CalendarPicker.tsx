'use client'
import {useEffect,useMemo,useState} from 'react'
const months=['January','February','March','April','May','June','July','August','September','October','November','December']
const weekdays=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const pad=(n:number)=>String(n).padStart(2,'0')
export const ymd=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
export function CalendarPicker({value,onChange,min}:{value:string,onChange:(v:string)=>void,min?:string}){
 const chosen=useMemo(()=>{const [y,m,d]=value.split('-').map(Number);return new Date(y,m-1,d)},[value])
 const [view,setView]=useState(()=>new Date(chosen.getFullYear(),chosen.getMonth(),1))
 useEffect(()=>setView(new Date(chosen.getFullYear(),chosen.getMonth(),1)),[chosen.getFullYear(),chosen.getMonth()])
 const first=new Date(view.getFullYear(),view.getMonth(),1),last=new Date(view.getFullYear(),view.getMonth()+1,0),cells:(Date|null)[]=[...Array(first.getDay()).fill(null)]
 for(let d=1;d<=last.getDate();d++)cells.push(new Date(view.getFullYear(),view.getMonth(),d));while(cells.length%7)cells.push(null)
 return <div className="pretty-calendar"><div className="calendar-picker-head"><button type="button" aria-label="Previous month" onClick={()=>setView(new Date(view.getFullYear(),view.getMonth()-1,1))}>‹</button><strong>{months[view.getMonth()]} {view.getFullYear()}</strong><button type="button" aria-label="Next month" onClick={()=>setView(new Date(view.getFullYear(),view.getMonth()+1,1))}>›</button></div><div className="calendar-weekdays">{weekdays.map(x=><span key={x}>{x}</span>)}</div><div className="calendar-days">{cells.map((d,i)=>d?<button type="button" disabled={!!min&&ymd(d)<min} key={ymd(d)} className={ymd(d)===value?'picked':''} onClick={()=>onChange(ymd(d))}>{d.getDate()}</button>:<span key={i}/>)}</div></div>
}
