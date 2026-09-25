'use client'
import {useRef,useState} from 'react'

export default function ImageUploadField({name,label,defaultValue,fallback}:{name:string,label:string,defaultValue?:string|null,fallback:string}){
  const [value,setValue]=useState(defaultValue||fallback),[busy,setBusy]=useState(false),[error,setError]=useState('')
  const ref=useRef<HTMLInputElement>(null)
  async function upload(file?:File){
    if(!file)return
    setBusy(true);setError('')
    const fd=new FormData();fd.append('file',file)
    const r=await fetch('/api/admin/upload',{method:'POST',body:fd})
    const x=await r.json().catch(()=>({}))
    setBusy(false)
    if(!r.ok){setError(x.error||'Upload failed');return}
    setValue(x.url)
  }
  return <div className="image-field">
    <label>{label}</label>
    <div className="image-upload-box">
      <img src={value||fallback} alt="Preview"/>
      <div className="image-upload-info"><b>{busy?'Uploading…':'Upload image'}</b><small>JPG, PNG, WEBP or GIF · max 8 MB</small><button type="button" className="btn secondary small" disabled={busy} onClick={()=>ref.current?.click()}>{busy?'Please wait…':'Choose image'}</button>{error&&<small className="upload-error">{error}</small>}</div>
    </div>
    <input ref={ref} className="file-input-hidden" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e=>upload(e.target.files?.[0])}/>
    <input type="hidden" name={name} value={value}/>
    <small className="stored-path">Stored: {value}</small>
  </div>
}
