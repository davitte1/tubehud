import { useState, useEffect, useCallback } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  void: "#080808", surface: "#111111", card: "#181818", border: "#242424",
  red: "#FF0000", redDim: "#cc0000", redGlow: "rgba(255,0,0,0.14)",
  white: "#FFFFFF", gray: "#999999", grayDim: "#444444", green: "#22c55e",
};
const AVATAR_COLORS = ["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#98D8C8","#F7DC6F","#BB8FCE","#76D7C4"];
const SG = "'Space Grotesk', sans-serif";
const IN = "'Inter', sans-serif";

function getInitials(name) { return name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2); }
function avatarColor(id) { return AVATAR_COLORS[Math.abs(id) % AVATAR_COLORS.length]; }

// ─── Sample data ──────────────────────────────────────────────────────────────
const FEATURED_VIDEOS = [
  { id:"dQw4w9WgXcQ", title:"Rick Astley — Never Gonna Give You Up", channel:"Rick Astley", views:"1.5B views", duration:"3:33" },
  { id:"9bZkp7q19f0", title:"PSY — GANGNAM STYLE (Official Music Video)", channel:"officialpsy", views:"5.1B views", duration:"4:13" },
  { id:"kXYiU_JCYtU", title:"Linkin Park — Numb (Official Video)", channel:"Linkin Park", views:"700M views", duration:"3:05" },
  { id:"JGwWNGJdvx8", title:"Ed Sheeran — Shape of You (Official Music Video)", channel:"Ed Sheeran", views:"6B views", duration:"4:23" },
  { id:"RgKAFK5djSk", title:"Wiz Khalifa — See You Again ft. Charlie Puth", channel:"Wiz Khalifa", views:"6.1B views", duration:"3:58" },
  { id:"YQHsXMglC9A", title:"Adele — Hello (Official Music Video)", channel:"Adele", views:"3.5B views", duration:"6:07" },
];
const DEFAULT_RECOMMENDED = [
  { id:"ysz5S6PUM-U", title:"Baby Shark Dance | #babyshark | Pinkfong Songs for Children", channel:"Pinkfong Baby Shark", views:"13B views", duration:"2:17" },
  { id:"60ItHLz5WEA", title:"Alan Walker — Faded", channel:"Alan Walker", views:"3.7B views", duration:"3:33" },
  { id:"OPf0YbXqDm0", title:"Mark Ronson — Uptown Funk ft. Bruno Mars", channel:"Mark Ronson", views:"5B views", duration:"4:01" },
  { id:"hT_nvWreIhg", title:"OneRepublic — Counting Stars", channel:"OneRepublic", views:"3.4B views", duration:"4:17" },
];
const DEFAULT_SUBSCRIPTIONS = [
  { id:"sub_mkbhd", name:"Marques Brownlee", handle:"@MKBHD", category:"Tech" },
  { id:"sub_veritasium", name:"Veritasium", handle:"@veritasium", category:"Science" },
  { id:"sub_lofi", name:"Lofi Girl", handle:"@LofiGirl", category:"Music" },
  { id:"sub_linus", name:"Linus Tech Tips", handle:"@LinusTechTips", category:"Tech" },
  { id:"sub_kwebbelkop", name:"Kwebbelkop", handle:"@Kwebbelkop", category:"Gaming" },
];

function makeVideo(v) {
  return { ...v, thumbnail:`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`, url:`https://www.youtube.com/watch?v=${v.id}` };
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
function Spin() {
  return <div style={{ width:20,height:20,border:`2px solid ${C.border}`,borderTopColor:C.red,borderRadius:"50%",animation:"spin 0.8s linear infinite",flexShrink:0 }} />;
}
function Avatar({ account, size=36 }) {
  const idNum = typeof account.id === "number" ? account.id : parseInt(String(account.id).replace(/\D/g,""),10)||0;
  return (
    <div style={{ width:size,height:size,borderRadius:"50%",background:avatarColor(idNum),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:SG,fontWeight:700,fontSize:size*0.38,color:"#111",flexShrink:0,userSelect:"none" }}>
      {getInitials(account.name)}
    </div>
  );
}
function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ background:active?C.red:"rgba(255,255,255,0.05)",border:`1px solid ${active?C.red:C.border}`,borderRadius:20,padding:"5px 14px",fontFamily:IN,fontSize:12,color:active?C.white:C.gray,cursor:"pointer",transition:"all 0.15s",flexShrink:0 }}
      onMouseEnter={e=>{ if(!active){ e.currentTarget.style.borderColor=C.red; e.currentTarget.style.color=C.white; }}}
      onMouseLeave={e=>{ if(!active){ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.gray; }}}>
      {label}
    </button>
  );
}

// ─── HUD bar ──────────────────────────────────────────────────────────────────
function HUDBar({ activeAccount, onOpenAccounts, onOpenActivate }) {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",height:52,background:"rgba(8,8,8,0.97)",borderBottom:`1px solid ${C.border}`,backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:100 }}>
      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
        <div style={{ background:C.red,borderRadius:4,padding:"2px 7px",fontFamily:SG,fontWeight:800,fontSize:13,color:"#fff",letterSpacing:1 }}>▶</div>
        <span style={{ fontFamily:SG,fontWeight:700,fontSize:14,color:C.white,letterSpacing:0.5 }}>TUBE<span style={{ color:C.red }}>·</span>HUD</span>
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(255,0,0,0.07)",border:`1px solid rgba(255,0,0,0.18)`,borderRadius:20,padding:"3px 10px" }}>
        <div style={{ width:6,height:6,borderRadius:"50%",background:C.red,animation:"pulse 2s infinite" }} />
        <span style={{ fontFamily:IN,fontSize:10,color:C.gray,letterSpacing:1 }}>META DISPLAY</span>
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
        <button onClick={onOpenActivate} style={{ background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 10px",fontFamily:IN,fontSize:11,color:C.gray,cursor:"pointer",transition:"all 0.15s" }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.red; e.currentTarget.style.color=C.white; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.gray; }}>
          iPhone
        </button>
        <button onClick={onOpenAccounts} style={{ display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,borderRadius:24,padding:"4px 12px 4px 6px",cursor:"pointer",transition:"all 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.borderColor=C.red}
          onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
          {activeAccount ? (<><Avatar account={activeAccount} size={28} /><span style={{ fontFamily:IN,fontSize:12,color:C.white,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{activeAccount.name.split(" ")[0]}</span><span style={{ color:C.grayDim,fontSize:10 }}>▾</span></>) : (<span style={{ fontFamily:IN,fontSize:12,color:C.gray,padding:"0 4px" }}>Sign in</span>)}
        </button>
      </div>
    </div>
  );
}

// ─── Tab nav ──────────────────────────────────────────────────────────────────
function TabNav({ tab, setTab }) {
  const tabs = [["featured","Featured"],["recommended","Recommended"],["subscribed","Subscribed"],["search","Search"]];
  return (
    <div style={{ display:"flex",gap:4,marginBottom:24,borderBottom:`1px solid ${C.border}`,paddingBottom:0 }}>
      {tabs.map(([key,label])=>(
        <button key={key} onClick={()=>setTab(key)} style={{ background:"none",border:"none",borderBottom:`2px solid ${tab===key?C.red:"transparent"}`,padding:"8px 16px",fontFamily:SG,fontWeight:tab===key?700:500,fontSize:13,color:tab===key?C.white:C.gray,cursor:"pointer",transition:"all 0.15s",marginBottom:-1 }}>
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Video card ───────────────────────────────────────────────────────────────
function VideoCard({ video, onPlay, onRemove }) {
  const [hov, setHov] = useState(false);
  const v = makeVideo(video);
  return (
    <div style={{ position:"relative" }}>
      <div onClick={()=>onPlay(v)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{ background:hov?C.card:"rgba(20,20,20,0.6)",border:`1px solid ${hov?"rgba(255,0,0,0.28)":C.border}`,borderRadius:12,overflow:"hidden",cursor:"pointer",transition:"all 0.18s",transform:hov?"translateY(-2px)":"none",boxShadow:hov?"0 8px 32px rgba(255,0,0,0.1)":"none" }}>
        <div style={{ position:"relative",paddingTop:"56.25%",background:"#1a1a1a" }}>
          <img src={v.thumbnail} alt={v.title} style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover" }} onError={e=>e.target.style.display="none"} />
          <div style={{ position:"absolute",bottom:6,right:6,background:"rgba(0,0,0,0.85)",borderRadius:4,padding:"2px 6px",fontFamily:IN,fontSize:11,fontWeight:600,color:"#fff" }}>{video.duration}</div>
          {hov&&<div style={{ position:"absolute",inset:0,background:"rgba(255,0,0,0.07)",display:"flex",alignItems:"center",justifyContent:"center" }}><div style={{ width:44,height:44,borderRadius:"50%",background:"rgba(255,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>▶</div></div>}
        </div>
        <div style={{ padding:"10px 12px 12px" }}>
          <div style={{ fontFamily:SG,fontWeight:600,fontSize:13,color:C.white,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",marginBottom:6 }}>{video.title}</div>
          <div style={{ fontFamily:IN,fontSize:11,color:C.gray }}>{video.channel} · {video.views}</div>
        </div>
      </div>
      {onRemove&&<button onClick={e=>{ e.stopPropagation(); onRemove(video.id); }} style={{ position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.7)",border:`1px solid ${C.border}`,borderRadius:6,width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",color:C.gray,cursor:"pointer",fontSize:12,transition:"all 0.15s" }}
        onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,0,0,0.8)"; e.currentTarget.style.color="#fff"; }}
        onMouseLeave={e=>{ e.currentTarget.style.background="rgba(0,0,0,0.7)"; e.currentTarget.style.color=C.gray; }}>✕</button>}
    </div>
  );
}

// ─── Player modal ─────────────────────────────────────────────────────────────
function PlayerModal({ video, onClose }) {
  const vid = video.url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1]||"";
  return (
    <div style={{ position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.96)",backdropFilter:"blur(4px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div style={{ width:"100%",maxWidth:720 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:12 }}>
          <div>
            <div style={{ fontFamily:SG,fontWeight:700,fontSize:15,color:C.white,lineHeight:1.3,marginBottom:4 }}>{video.title}</div>
            <div style={{ fontFamily:IN,fontSize:12,color:C.gray }}>{video.channel} · {video.views}</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.07)",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 12px",color:C.gray,fontFamily:IN,fontSize:13,cursor:"pointer",flexShrink:0,transition:"all 0.15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,0,0,0.15)"; e.currentTarget.style.color="#fff"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.color=C.gray; }}>✕ Close</button>
        </div>
        <div style={{ position:"relative",paddingTop:"56.25%",borderRadius:12,overflow:"hidden",background:"#000",border:`1px solid ${C.border}` }}>
          <iframe src={`https://www.youtube.com/embed/${vid}?autoplay=1&rel=0`} style={{ position:"absolute",inset:0,width:"100%",height:"100%" }} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={video.title} />
        </div>
        <div style={{ marginTop:10,textAlign:"center" }}>
          <a href={video.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily:IN,fontSize:12,color:C.grayDim,textDecoration:"none" }}
            onMouseEnter={e=>e.currentTarget.style.color=C.red} onMouseLeave={e=>e.currentTarget.style.color=C.grayDim}>Open in YouTube ↗</a>
        </div>
      </div>
    </div>
  );
}

// ─── Account modal ────────────────────────────────────────────────────────────
function AccountModal({ accounts, activeAccount, onSelect, onAdd, onRemove, onClose }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState(""); const [handle, setHandle] = useState("");
  function doAdd() {
    if (!name.trim()) return;
    onAdd({ name:name.trim(), handle:handle.trim()||"@"+name.trim().toLowerCase().replace(/\s+/g,"") });
    setName(""); setHandle(""); setAdding(false);
  }
  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:24,width:320,maxHeight:"80vh",overflow:"auto",boxShadow:"0 0 60px rgba(255,0,0,0.1)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <span style={{ fontFamily:SG,fontWeight:700,fontSize:16,color:C.white }}>Accounts</span>
          <button onClick={onClose} style={{ background:"none",border:"none",color:C.gray,fontSize:18,cursor:"pointer" }}>✕</button>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:16 }}>
          {accounts.map(acc=>(
            <div key={acc.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,background:activeAccount?.id===acc.id?C.redGlow:"rgba(255,255,255,0.03)",border:`1px solid ${activeAccount?.id===acc.id?"rgba(255,0,0,0.3)":C.border}`,cursor:"pointer",transition:"all 0.15s" }}
              onClick={()=>{ onSelect(acc); onClose(); }}>
              <Avatar account={acc} size={40} />
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontFamily:SG,fontWeight:600,fontSize:14,color:C.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{acc.name}</div>
                <div style={{ fontFamily:IN,fontSize:12,color:C.gray }}>{acc.handle}</div>
              </div>
              {activeAccount?.id===acc.id&&<div style={{ width:8,height:8,borderRadius:"50%",background:C.red,flexShrink:0 }} />}
              {accounts.length>1&&<button onClick={e=>{ e.stopPropagation(); onRemove(acc.id); }} style={{ background:"none",border:"none",color:C.grayDim,cursor:"pointer",fontSize:14,padding:"0 4px",transition:"color 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.color=C.red} onMouseLeave={e=>e.currentTarget.style.color=C.grayDim}>✕</button>}
            </div>
          ))}
        </div>
        {adding ? (
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            <input autoFocus placeholder="Display name" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAdd()}
              style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",fontFamily:IN,fontSize:13,color:C.white,outline:"none",width:"100%" }} />
            <input placeholder="@handle (optional)" value={handle} onChange={e=>setHandle(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAdd()}
              style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",fontFamily:IN,fontSize:13,color:C.white,outline:"none",width:"100%" }} />
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={doAdd} style={{ flex:1,background:C.red,border:"none",borderRadius:8,padding:"9px",fontFamily:SG,fontWeight:600,fontSize:13,color:"#fff",cursor:"pointer" }}>Add</button>
              <button onClick={()=>setAdding(false)} style={{ background:"rgba(255,255,255,0.06)",border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 14px",fontFamily:IN,fontSize:13,color:C.gray,cursor:"pointer" }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={()=>setAdding(true)} style={{ width:"100%",background:"rgba(255,255,255,0.04)",border:`1px dashed ${C.border}`,borderRadius:10,padding:"11px",fontFamily:IN,fontSize:13,color:C.gray,cursor:"pointer",transition:"all 0.15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.red; e.currentTarget.style.color=C.white; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.gray; }}>
            + Add another account
          </button>
        )}
      </div>
    </div>
  );
}

// ─── iPhone Activation modal ──────────────────────────────────────────────────
function iPhoneModal({ code, activated, activatedName, onClose, onReset }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(code).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  }
  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.88)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={onClose}>
      <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:28,width:340,boxShadow:"0 0 80px rgba(255,0,0,0.1)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
          <span style={{ fontFamily:SG,fontWeight:700,fontSize:16,color:C.white }}>Activate on iPhone</span>
          <button onClick={onClose} style={{ background:"none",border:"none",color:C.gray,fontSize:18,cursor:"pointer" }}>✕</button>
        </div>

        {activated ? (
          <div style={{ textAlign:"center",padding:"24px 0" }}>
            <div style={{ fontSize:40,marginBottom:12 }}>✅</div>
            <div style={{ fontFamily:SG,fontWeight:700,fontSize:16,color:C.green,marginBottom:6 }}>Account linked!</div>
            <div style={{ fontFamily:IN,fontSize:13,color:C.gray,marginBottom:20 }}>
              <span style={{ color:C.white,fontWeight:600 }}>{activatedName}</span> is now active on this device.
            </div>
            <button onClick={onReset} style={{ background:"rgba(255,255,255,0.06)",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 20px",fontFamily:IN,fontSize:13,color:C.gray,cursor:"pointer" }}>
              Link another account
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontFamily:IN,fontSize:13,color:C.gray,marginBottom:24,lineHeight:1.6 }}>
              On your iPhone, open Safari and go to:<br />
              <span style={{ color:C.white,fontWeight:600 }}>tubehud.app/activate</span><br />
              then enter this code:
            </p>
            {/* Big code display */}
            <div style={{ display:"flex",justifyContent:"center",gap:8,marginBottom:16 }}>
              {code.split("").map((ch,i)=>(
                <div key={i} style={{ width:42,height:52,borderRadius:10,background:C.card,border:`2px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:SG,fontWeight:800,fontSize:22,color:C.red,letterSpacing:0 }}>
                  {ch}
                </div>
              ))}
            </div>
            <div style={{ textAlign:"center",marginBottom:20 }}>
              <span style={{ fontFamily:IN,fontSize:11,color:C.grayDim }}>Code expires in 10 minutes</span>
            </div>
            <button onClick={copy} style={{ width:"100%",background:copied?"rgba(34,197,94,0.15)":C.red,border:`1px solid ${copied?C.green:C.red}`,borderRadius:10,padding:"11px",fontFamily:SG,fontWeight:700,fontSize:13,color:copied?C.green:"#fff",cursor:"pointer",transition:"all 0.2s" }}>
              {copied?"Copied!":"Copy code"}
            </button>
            <p style={{ fontFamily:IN,fontSize:11,color:C.grayDim,textAlign:"center",marginTop:14,lineHeight:1.5 }}>
              This connects your YouTube account from iPhone to your glasses display without entering your password here.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Subscribed tab ───────────────────────────────────────────────────────────
function SubscribedTab({ subs, onAdd, onRemove, onPlay, accountName }) {
  const [adding, setAdding] = useState(false);
  const [subName, setSubName] = useState(""); const [subHandle, setSubHandle] = useState("");
  const [loadingVideos, setLoadingVideos] = useState(null);
  const [channelVideos, setChannelVideos] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  async function loadChannelVideos(sub) {
    setSelectedSub(sub); setLoadingVideos(sub.id); setChannelVideos(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,messages:[{role:"user",content:`Return ONLY a JSON array of 4 real popular YouTube videos from the channel "${sub.name}" (${sub.handle}). No markdown, no backticks.\n[\n  {"id":"VIDEO_ID","title":"Title","channel":"${sub.name}","views":"XM views","duration":"M:SS"}\n]`}]})});
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("")||"[]";
      setChannelVideos(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch { setChannelVideos([]); }
    setLoadingVideos(null);
  }

  function doAdd() {
    if (!subName.trim()) return;
    onAdd({ id:"sub_"+Date.now(), name:subName.trim(), handle:subHandle.trim()||"@"+subName.trim().toLowerCase().replace(/\s+/g,""), category:"Other" });
    setSubName(""); setSubHandle(""); setAdding(false);
  }

  const CATS = [...new Set(subs.map(s=>s.category))];

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
        <div>
          <div style={{ fontFamily:SG,fontWeight:700,fontSize:16,color:C.white }}>Subscriptions</div>
          <div style={{ fontFamily:IN,fontSize:12,color:C.gray,marginTop:2 }}>{accountName} · {subs.length} channel{subs.length!==1?"s":""}</div>
        </div>
        <button onClick={()=>setAdding(!adding)} style={{ background:adding?"rgba(255,255,255,0.06)":C.red,border:`1px solid ${adding?C.border:C.red}`,borderRadius:8,padding:"7px 14px",fontFamily:SG,fontWeight:600,fontSize:12,color:adding?C.gray:"#fff",cursor:"pointer",transition:"all 0.15s" }}>
          {adding?"Cancel":"+ Subscribe"}
        </button>
      </div>

      {adding&&(
        <div style={{ display:"flex",gap:8,marginBottom:20,flexWrap:"wrap" }}>
          <input autoFocus placeholder="Channel name" value={subName} onChange={e=>setSubName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAdd()}
            style={{ flex:1,minWidth:140,background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",fontFamily:IN,fontSize:13,color:C.white,outline:"none" }} />
          <input placeholder="@handle (optional)" value={subHandle} onChange={e=>setSubHandle(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAdd()}
            style={{ flex:1,minWidth:140,background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",fontFamily:IN,fontSize:13,color:C.white,outline:"none" }} />
          <button onClick={doAdd} style={{ background:C.red,border:"none",borderRadius:8,padding:"9px 16px",fontFamily:SG,fontWeight:600,fontSize:13,color:"#fff",cursor:"pointer" }}>Add</button>
        </div>
      )}

      {/* Channel videos panel */}
      {selectedSub&&(
        <div style={{ background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:16,marginBottom:24 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div style={{ fontFamily:SG,fontWeight:700,fontSize:14,color:C.white }}>{selectedSub.name}</div>
            <button onClick={()=>{ setSelectedSub(null); setChannelVideos(null); }} style={{ background:"none",border:"none",color:C.gray,cursor:"pointer",fontSize:14 }}>✕</button>
          </div>
          {loadingVideos===selectedSub.id ? (
            <div style={{ display:"flex",alignItems:"center",gap:10,padding:"20px 0" }}><Spin /><span style={{ color:C.gray,fontSize:13 }}>Loading videos...</span></div>
          ) : channelVideos?.length ? (
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10 }}>
              {channelVideos.map(v=><VideoCard key={v.id} video={v} onPlay={onPlay} />)}
            </div>
          ) : (
            <div style={{ color:C.gray,fontSize:13,padding:"12px 0" }}>No videos found. Try playing from search.</div>
          )}
        </div>
      )}

      {/* Channel list */}
      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        {subs.map(sub=>(
          <div key={sub.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,background:selectedSub?.id===sub.id?C.redGlow:"rgba(255,255,255,0.03)",border:`1px solid ${selectedSub?.id===sub.id?"rgba(255,0,0,0.25)":C.border}`,cursor:"pointer",transition:"all 0.15s" }}
            onClick={()=>loadChannelVideos(sub)}
            onMouseEnter={e=>{ if(selectedSub?.id!==sub.id) e.currentTarget.style.background="rgba(255,255,255,0.06)"; }}
            onMouseLeave={e=>{ if(selectedSub?.id!==sub.id) e.currentTarget.style.background="rgba(255,255,255,0.03)"; }}>
            <div style={{ width:42,height:42,borderRadius:"50%",background:`hsl(${Math.abs(sub.id.charCodeAt?.[sub.id.length-1]||0)*37%360},60%,40%)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:SG,fontWeight:700,fontSize:15,color:"#fff",flexShrink:0 }}>
              {sub.name[0]}
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontFamily:SG,fontWeight:600,fontSize:14,color:C.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{sub.name}</div>
              <div style={{ fontFamily:IN,fontSize:12,color:C.gray }}>{sub.handle} · <span style={{ color:C.grayDim }}>{sub.category}</span></div>
            </div>
            {loadingVideos===sub.id&&<Spin />}
            <span style={{ fontFamily:IN,fontSize:12,color:C.grayDim }}>Videos ›</span>
            <button onClick={e=>{ e.stopPropagation(); onRemove(sub.id); if(selectedSub?.id===sub.id){setSelectedSub(null);setChannelVideos(null);} }} style={{ background:"none",border:"none",color:C.grayDim,cursor:"pointer",fontSize:14,padding:"0 4px",transition:"color 0.15s",flexShrink:0 }}
              onMouseEnter={e=>e.currentTarget.style.color=C.red} onMouseLeave={e=>e.currentTarget.style.color=C.grayDim}>✕</button>
          </div>
        ))}
      </div>
      {subs.length===0&&<div style={{ color:C.gray,fontSize:13,textAlign:"center",padding:"40px 0" }}>No subscriptions yet. Add a channel above.</div>}
    </div>
  );
}

// ─── Recommended tab ──────────────────────────────────────────────────────────
function RecommendedTab({ videos, onPlay, onRemove, onRefresh, accountName, loading }) {
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
        <div>
          <div style={{ fontFamily:SG,fontWeight:700,fontSize:16,color:C.white }}>Recommended for you</div>
          <div style={{ fontFamily:IN,fontSize:12,color:C.gray,marginTop:2 }}>{accountName}</div>
        </div>
        <button onClick={onRefresh} disabled={loading} style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 14px",fontFamily:IN,fontSize:12,color:loading?C.grayDim:C.gray,cursor:loading?"not-allowed":"pointer",transition:"all 0.15s" }}
          onMouseEnter={e=>{ if(!loading){e.currentTarget.style.borderColor=C.red; e.currentTarget.style.color=C.white;} }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.gray; }}>
          {loading?<Spin />:"↻"} Refresh
        </button>
      </div>
      {loading ? (
        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",padding:"60px 0",gap:12 }}><Spin /><span style={{ color:C.gray,fontSize:13 }}>Getting recommendations...</span></div>
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14 }}>
          {videos.map(v=><VideoCard key={v.id} video={v} onPlay={onPlay} onRemove={()=>onRemove(v.id)} />)}
        </div>
      )}
      {!loading&&videos.length===0&&<div style={{ color:C.gray,fontSize:13,textAlign:"center",padding:"40px 0" }}>Hit Refresh to load recommendations.</div>}
    </div>
  );
}

// ─── Search tab ───────────────────────────────────────────────────────────────
function SearchTab({ onPlay }) {
  const [q, setQ] = useState(""); const [results, setResults] = useState(null); const [loading, setLoading] = useState(false); const [err, setErr] = useState("");
  const SUGGESTIONS = [["Trending","trending music 2025"],["Lo-fi","lofi hip hop study"],["Tech","tech reviews 2025"],["Gaming","gaming highlights"],["Science","science explained"]];

  function extractId(url) { return url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1]||null; }

  async function doSearch() {
    const query = q.trim(); if(!query) return;
    const vid = extractId(query);
    if(vid){ onPlay(makeVideo({ id:vid,title:"YouTube Video",channel:"YouTube",views:"",duration:"" })); return; }
    setLoading(true); setResults(null); setErr("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,messages:[{role:"user",content:`YouTube video recommender. User searched: "${query}"\nReturn ONLY a JSON array of 6 real well-known YouTube videos. No markdown, no backticks.\n[\n  {"id":"REAL_11_CHAR_ID","title":"Title","channel":"Channel","views":"XM views","duration":"M:SS"}\n]`}]})});
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("")||"[]";
      setResults(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch { setErr("Search failed. Try pasting a YouTube URL directly."); }
    setLoading(false);
  }

  return (
    <div>
      <div style={{ display:"flex",gap:8,marginBottom:16 }}>
        <div style={{ flex:1,position:"relative" }}>
          <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.grayDim,fontSize:14,pointerEvents:"none" }}>⌕</span>
          <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()} placeholder="Search or paste a YouTube URL..."
            style={{ width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px 10px 34px",fontFamily:IN,fontSize:13,color:C.white,outline:"none",transition:"border-color 0.15s",boxSizing:"border-box" }}
            onFocus={e=>e.target.style.borderColor=C.red} onBlur={e=>e.target.style.borderColor=C.border} />
        </div>
        <button onClick={doSearch} style={{ background:C.red,border:"none",borderRadius:10,padding:"0 18px",fontFamily:SG,fontWeight:600,fontSize:13,color:"#fff",cursor:"pointer",transition:"background 0.15s",flexShrink:0 }}
          onMouseEnter={e=>e.currentTarget.style.background=C.redDim} onMouseLeave={e=>e.currentTarget.style.background=C.red}>Search</button>
      </div>
      {!results&&!loading&&(
        <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:24 }}>
          {SUGGESTIONS.map(([label,sq])=><Pill key={label} label={label} active={false} onClick={()=>{ setQ(sq); }} />)}
        </div>
      )}
      {err&&<div style={{ background:"rgba(255,0,0,0.08)",border:`1px solid rgba(255,0,0,0.2)`,borderRadius:10,padding:"12px 16px",marginBottom:16,color:C.gray,fontSize:13 }}>{err}</div>}
      {loading ? (
        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",padding:"60px 0",gap:12 }}><Spin /><span style={{ color:C.gray,fontSize:13 }}>Finding videos...</span></div>
      ) : results ? (
        <>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <span style={{ fontFamily:SG,fontWeight:700,fontSize:12,color:C.gray,letterSpacing:1,textTransform:"uppercase" }}>Results for "{q}"</span>
            <button onClick={()=>{ setResults(null); setQ(""); }} style={{ background:"none",border:"none",color:C.grayDim,fontFamily:IN,fontSize:12,cursor:"pointer" }}
              onMouseEnter={e=>e.currentTarget.style.color=C.white} onMouseLeave={e=>e.currentTarget.style.color=C.grayDim}>Clear ✕</button>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14 }}>
            {results.map(v=><VideoCard key={v.id} video={v} onPlay={onPlay} />)}
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
function generateCode() { return Array.from({length:6},()=>Math.floor(Math.random()*10)).join(""); }

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [tab, setTab] = useState("featured");
  const [playing, setPlaying] = useState(null);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showActivate, setShowActivate] = useState(false);
  const [activationCode] = useState(generateCode);
  const [codeActivated, setCodeActivated] = useState(false);
  const [activatedName, setActivatedName] = useState("");
  // Per-account data
  const [accountData, setAccountData] = useState({});
  const [recLoading, setRecLoading] = useState(false);

  const active = accounts.find(a=>a.id===activeId)||null;
  const accData = active ? (accountData[active.id]||{ recommended:DEFAULT_RECOMMENDED.map(v=>({...v})), subscriptions:[...DEFAULT_SUBSCRIPTIONS] }) : { recommended:[], subscriptions:[] };

  // ── Storage ────────────────────────────────────────────────────────────────
  useEffect(()=>{
    async function load() {
      try {
        const r = await window.storage.get("tubehud-v2");
        if(r?.value) {
          const s = JSON.parse(r.value);
          setAccounts(s.accounts||[]);
          setActiveId(s.activeId||null);
          setAccountData(s.accountData||{});
        } else {
          const def = { id:1, name:"Davitte Taveras", handle:"@davittetaveras" };
          setAccounts([def]); setActiveId(1);
          setAccountData({ 1:{ recommended:DEFAULT_RECOMMENDED.map(v=>({...v})), subscriptions:[...DEFAULT_SUBSCRIPTIONS] } });
        }
      } catch {
        const def = { id:1, name:"Davitte Taveras", handle:"@davittetaveras" };
        setAccounts([def]); setActiveId(1);
        setAccountData({ 1:{ recommended:DEFAULT_RECOMMENDED.map(v=>({...v})), subscriptions:[...DEFAULT_SUBSCRIPTIONS] } });
      }
      setLoaded(true);
    }
    load();
  },[]);

  async function save(accs, aid, adata) {
    try { await window.storage.set("tubehud-v2", JSON.stringify({ accounts:accs, activeId:aid, accountData:adata })); } catch {}
  }

  function updateAccData(aid, patch) {
    const updated = { ...accountData, [aid]:{ ...accData, ...patch } };
    setAccountData(updated);
    save(accounts, activeId, updated);
  }

  function addAccount(data) {
    const a = { ...data, id:Date.now() };
    const defData = { recommended:DEFAULT_RECOMMENDED.map(v=>({...v})), subscriptions:[...DEFAULT_SUBSCRIPTIONS] };
    const accs = [...accounts, a];
    const adata = { ...accountData, [a.id]:defData };
    setAccounts(accs); setActiveId(a.id); setAccountData(adata);
    save(accs, a.id, adata);
  }
  function removeAccount(id) {
    const accs = accounts.filter(a=>a.id!==id);
    const newActive = activeId===id ? (accs[0]?.id||null) : activeId;
    setAccounts(accs); setActiveId(newActive);
    save(accs, newActive, accountData);
  }
  function switchAccount(acc) { setActiveId(acc.id); save(accounts, acc.id, accountData); }

  // ── Activation polling (shared storage) ──────────────────────────────────
  useEffect(()=>{
    if(!showActivate||codeActivated) return;
    const key = `activation-${activationCode}`;
    const poll = setInterval(async()=>{
      try {
        const r = await window.storage.get(key, true);
        if(r?.value) {
          const payload = JSON.parse(r.value);
          // Add the account from iPhone
          const a = { id:Date.now(), name:payload.name, handle:payload.handle||"@"+payload.name.toLowerCase().replace(/\s+/g,"") };
          const defData = { recommended:DEFAULT_RECOMMENDED.map(v=>({...v})), subscriptions:[...DEFAULT_SUBSCRIPTIONS] };
          const accs = [...accounts, a];
          const adata = { ...accountData, [a.id]:defData };
          setAccounts(accs); setActiveId(a.id); setAccountData(adata);
          save(accs, a.id, adata);
          setActivatedName(payload.name);
          setCodeActivated(true);
          await window.storage.delete(key, true);
          clearInterval(poll);
        }
      } catch {}
    }, 2500);
    return ()=>clearInterval(poll);
  },[showActivate, codeActivated, activationCode, accounts, accountData, activeId]);

  // ── Recommended refresh ───────────────────────────────────────────────────
  async function refreshRecommended() {
    if(!active) return;
    setRecLoading(true);
    try {
      const subs = accData.subscriptions.slice(0,3).map(s=>s.name).join(", ");
      const prompt = subs ? `The user subscribes to: ${subs}. ` : "";
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,messages:[{role:"user",content:`${prompt}Return ONLY a JSON array of 8 real YouTube videos this person would enjoy. No markdown, no backticks.\n[\n  {"id":"REAL_11_CHAR_ID","title":"Title","channel":"Channel","views":"XM views","duration":"M:SS"}\n]`}]})});
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("")||"[]";
      const vids = JSON.parse(text.replace(/```json|```/g,"").trim());
      updateAccData(active.id, { recommended:vids });
    } catch {}
    setRecLoading(false);
  }

  if(!loaded) return (
    <div style={{ background:C.void,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ display:"flex",gap:10,alignItems:"center" }}><Spin /><span style={{ color:C.gray,fontFamily:IN,fontSize:13 }}>Loading TubeHUD...</span></div>
    </div>
  );

  return (
    <div style={{ background:C.void,minHeight:"100vh",fontFamily:IN }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:2px;}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      <HUDBar activeAccount={active} onOpenAccounts={()=>setShowAccounts(true)} onOpenActivate={()=>setShowActivate(true)} />

      <div style={{ maxWidth:900,margin:"0 auto",padding:"24px 16px" }}>
        {/* Greeting */}
        {active&&(
          <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:24 }}>
            <Avatar account={active} size={44} />
            <div>
              <div style={{ fontFamily:SG,fontWeight:700,fontSize:18,color:C.white }}>Hey, {active.name.split(" ")[0]}</div>
              <div style={{ fontFamily:IN,fontSize:12,color:C.gray,marginTop:2 }}>{active.handle} · {accounts.length} account{accounts.length!==1?"s":""} synced</div>
            </div>
            {accounts.length>1&&(
              <div style={{ display:"flex",gap:6,marginLeft:"auto",flexWrap:"wrap" }}>
                {accounts.filter(a=>a.id!==activeId).slice(0,3).map(a=>(
                  <button key={a.id} onClick={()=>switchAccount(a)} title={`Switch to ${a.name}`}
                    style={{ background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,borderRadius:20,padding:"4px 10px 4px 6px",display:"flex",alignItems:"center",gap:6,cursor:"pointer",transition:"all 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=C.red} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                    <Avatar account={a} size={22} />
                    <span style={{ fontFamily:IN,fontSize:11,color:C.gray }}>{a.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <TabNav tab={tab} setTab={setTab} />

        {tab==="featured"&&(
          <>
            <div style={{ fontFamily:SG,fontWeight:700,fontSize:12,color:C.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:14 }}>Featured</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14 }}>
              {FEATURED_VIDEOS.map(v=><VideoCard key={v.id} video={v} onPlay={setPlaying} />)}
            </div>
          </>
        )}

        {tab==="recommended"&&active&&(
          <RecommendedTab
            videos={accData.recommended}
            onPlay={setPlaying}
            onRemove={id=>updateAccData(active.id,{ recommended:accData.recommended.filter(v=>v.id!==id) })}
            onRefresh={refreshRecommended}
            accountName={active.name}
            loading={recLoading}
          />
        )}

        {tab==="subscribed"&&active&&(
          <SubscribedTab
            subs={accData.subscriptions}
            accountName={active.name}
            onPlay={setPlaying}
            onAdd={sub=>updateAccData(active.id,{ subscriptions:[...accData.subscriptions, sub] })}
            onRemove={id=>updateAccData(active.id,{ subscriptions:accData.subscriptions.filter(s=>s.id!==id) })}
          />
        )}

        {tab==="search"&&<SearchTab onPlay={setPlaying} />}

        {!active&&(
          <div style={{ textAlign:"center",padding:"60px 0" }}>
            <div style={{ fontFamily:SG,fontWeight:700,fontSize:18,color:C.white,marginBottom:8 }}>No account active</div>
            <div style={{ fontFamily:IN,fontSize:13,color:C.gray,marginBottom:24 }}>Add an account or activate from your iPhone</div>
            <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" }}>
              <button onClick={()=>setShowAccounts(true)} style={{ background:C.red,border:"none",borderRadius:10,padding:"12px 24px",fontFamily:SG,fontWeight:700,fontSize:14,color:"#fff",cursor:"pointer" }}>Add account</button>
              <button onClick={()=>setShowActivate(true)} style={{ background:"rgba(255,255,255,0.06)",border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 24px",fontFamily:SG,fontWeight:700,fontSize:14,color:C.gray,cursor:"pointer" }}>Activate from iPhone</button>
            </div>
          </div>
        )}
      </div>

      {showAccounts&&<AccountModal accounts={accounts} activeAccount={active} onSelect={switchAccount} onAdd={addAccount} onRemove={removeAccount} onClose={()=>setShowAccounts(false)} />}
      {showActivate&&iPhoneModal({ code:activationCode, activated:codeActivated, activatedName, onClose:()=>{ setShowActivate(false); }, onReset:()=>setCodeActivated(false) })}
      {playing&&<PlayerModal video={playing} onClose={()=>setPlaying(null)} />}
    </div>
  );
}
