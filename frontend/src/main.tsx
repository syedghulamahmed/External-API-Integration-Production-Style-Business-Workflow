import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Internship={id:string;title:string;description:string;applicationDeadline:string;isActive:boolean;company?:{companyName:string}};
const API="http://localhost:4000/api";

async function login(){
  const r=await fetch(API+"/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"student@example.com",password:"DemoPass1!"})});
  const b=await r.json();
  if(!r.ok) throw new Error(b.error?.message??"Login failed");
  return b.accessToken as string;
}
async function getInternships():Promise<Internship[]>{
  const r=await fetch(API+"/internships");
  const b=await r.json();
  if(!r.ok) throw new Error(b.error?.message??"Failed to load internships");
  return b.data??[];
}
function App(){
  const[items,setItems]=useState<Internship[]>([]);
  const[message,setMessage]=useState("");
  const[busy,setBusy]=useState("");
  useEffect(()=>{getInternships().then(setItems).catch(e=>setMessage(e.message));},[]);
  async function apply(id:string){
    setBusy(id);setMessage("");
    try{
      const token=await login();
      const r=await fetch(API+"/applications",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({internshipId:id})});
      const b=await r.json();
      if(!r.ok) throw new Error(b.error?.message??"Application failed");
      setMessage("Application submitted successfully. Confirmation email is queued best-effort; provider failure will not undo the application.");
    }catch(e){setMessage(e instanceof Error?e.message:"Application failed");}
    finally{setBusy("");}
  }
  return <main><header><p className="eyebrow">TalentBridge · Week 4</p><h1>Internship opportunities</h1><p>Deadline-aware application workflow with transactional notifications.</p></header>{message&&<div className="notice" role="status">{message}</div>}<section className="grid">{items.map(item=>{const deadline=new Date(item.applicationDeadline);const closed=!item.isActive||deadline<=new Date();return <article className="card" key={item.id}><span className={closed?"badge closed":"badge"}>{closed?"Closed":"Open"}</span><h2>{item.title}</h2><p>{item.description}</p><p><strong>Company:</strong> {item.company?.companyName??"—"}</p><p><strong>Deadline:</strong> {deadline.toLocaleString()}</p>{closed?<p className="reason">Applications are closed because the deadline has passed or the posting is inactive.</p>:<button disabled={busy===item.id} onClick={()=>apply(item.id)}>{busy===item.id?"Submitting…":"Apply"}</button>}</article>})}</section></main>;
}
createRoot(document.getElementById("root")!).render(<StrictMode><App/></StrictMode>);
