'use client'
import {useEffect,useRef,useState} from 'react'

export function PrettySelect({value,onChange,options,label}:{value:string|number,onChange:(v:string)=>void,options:{value:string|number,label:string}[],label?:string}){
 const [open,setOpen]=useState(false),ref=useRef<HTMLDivElement>(null)
 useEffect(()=>{const f=(e:MouseEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)};document.addEventListener('mousedown',f);return()=>document.removeEventListener('mousedown',f)},[])
 const current=options.find(x=>String(x.value)===String(value))
 return <div className="pretty-select" ref={ref}><button type="button" className="pretty-select-trigger" aria-expanded={open} onClick={()=>setOpen(!open)}><span>{current?.label||label||'Select'}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m7 10 5 5 5-5"/></svg></button>{open&&<div className="pretty-select-menu">{options.map(o=><button type="button" key={String(o.value)} className={String(o.value)===String(value)?'selected':''} onClick={()=>{onChange(String(o.value));setOpen(false)}}>{o.label}{String(o.value)===String(value)&&<span>✓</span>}</button>)}</div>}</div>
}
const times=Array.from({length:24*4},(_,i)=>{const h=Math.floor(i/4),m=(i%4)*15,v=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;const hh=h%12||12;return {value:v,label:`${hh}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}`}})
export function PrettyTime({value,onChange}:{value:string,onChange:(v:string)=>void}){return <PrettySelect value={value} onChange={onChange} options={times}/>}
