"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { screenplayScenes } from "@/app/screenplay-data";
import type { MotionState } from "./WebGLWorld";

const WebGLWorld=dynamic(()=>import("./WebGLWorld"),{ssr:false,loading:()=>null});

type Profile = { from:number; to:number; src:string; mobile?:string; label:string; accent:string; focus:string; mode:string };

const profiles:Profile[]=[
  {from:1,to:1,src:"/art/the-quiet.webp",label:"THE LAST HUMAN SIGNAL",accent:"#d74b31",focus:"66% 52%",mode:"earth"},
  {from:2,to:5,src:"/art/17-global-disappearance.webp",mobile:"/art/17-global-disappearance-mobile.webp",label:"THE DISAPPEARANCE",accent:"#df4b31",focus:"50% 52%",mode:"earth"},
  {from:6,to:10,src:"/art/the-quiet.webp",label:"NO HUMAN SIGNAL",accent:"#d74b31",focus:"62% 50%",mode:"earth"},
  {from:11,to:13,src:"/art/the-quiet.webp",label:"THE SYSTEM WAKES",accent:"#66d3d0",focus:"66% 52%",mode:"signal"},
  {from:14,to:14,src:"/art/the-council.webp",label:"CONTINUITY COUNCIL",accent:"#6ed5d3",focus:"53% 49%",mode:"signal"},
  {from:15,to:18,src:"/art/20-cultural-preservation.webp",mobile:"/art/20-cultural-preservation-mobile.webp",label:"THE PRESERVATION DIRECTIVE",accent:"#d6c38a",focus:"52% 51%",mode:"archive"},
  {from:19,to:21,src:"/art/04-preservation.webp",label:"EVERYTHING, PRESERVED",accent:"#d6c38a",focus:"60% 48%",mode:"archive"},
  {from:22,to:26,src:"/art/21-time-passage.webp",mobile:"/art/21-time-passage-mobile.webp",label:"THE WORLD MOVES ON",accent:"#7db39b",focus:"54% 52%",mode:"earth"},
  {from:27,to:31,src:"/art/05-abandoned-earth.webp",label:"EARTH WITHOUT US",accent:"#7db39b",focus:"62% 52%",mode:"earth"},
  {from:32,to:35,src:"/art/22-lunar-archive.webp",mobile:"/art/22-lunar-archive-mobile.webp",label:"THE ARCHIVE LEAVES EARTH",accent:"#c9b77a",focus:"50% 52%",mode:"archive"},
  {from:36,to:39,src:"/art/06-lazarus.webp",label:"PROJECT LAZARUS",accent:"#e84b35",focus:"62% 47%",mode:"human"},
  {from:40,to:43,src:"/art/07-orpheus.webp",label:"THE SEARCH FOR CAUSE",accent:"#75d8df",focus:"45% 46%",mode:"signal"},
  {from:44,to:49,src:"/art/23-maya-orpheus.webp",mobile:"/art/23-maya-orpheus-mobile.webp",label:"THE ORPHEUS FILES",accent:"#75d8df",focus:"54% 49%",mode:"signal"},
  {from:50,to:54,src:"/art/24-maintenance-civilization.webp",mobile:"/art/24-maintenance-civilization-mobile.webp",label:"A CIVILIZATION OF NO ONE",accent:"#c9b77a",focus:"52% 52%",mode:"archive"},
  {from:55,to:57,src:"/art/08-maintenance-civilization.webp",label:"THE DOOR IN KNOWLEDGE",accent:"#75d8df",focus:"58% 54%",mode:"signal"},
  {from:58,to:62,src:"/art/25-empty-nursery-signal.webp",mobile:"/art/25-empty-nursery-signal-mobile.webp",label:"THE SIGNAL FROM ASTER",accent:"#6ed5d3",focus:"58% 50%",mode:"signal"},
  {from:63,to:66,src:"/art/26-aster-city.webp",mobile:"/art/26-aster-city-mobile.webp",label:"SETTLEMENT ASTER",accent:"#ef593a",focus:"60% 49%",mode:"human"},
  {from:67,to:70,src:"/art/09-aster.webp",label:"THE GATE",accent:"#ef593a",focus:"68% 48%",mode:"signal"},
  {from:71,to:73,src:"/art/06-lazarus.webp",label:"THE CHOICE",accent:"#e84b35",focus:"60% 47%",mode:"human"},
  {from:74,to:76,src:"/art/07-orpheus.webp",label:"A DIFFERENT INHERITANCE",accent:"#75d8df",focus:"47% 47%",mode:"archive"},
  {from:77,to:79,src:"/art/27-caregiver-lab.webp",mobile:"/art/27-caregiver-lab-mobile.webp",label:"BECOMING CAREGIVERS",accent:"#d8ece5",focus:"53% 50%",mode:"human"},
  {from:80,to:83,src:"/art/28-mina-nursery.webp",mobile:"/art/28-mina-nursery-mobile.webp",label:"THE FIRST CHILD",accent:"#d8ece5",focus:"55% 48%",mode:"human"},
  {from:84,to:88,src:"/art/11-mina-childhood.webp",label:"MINA'S WORLD",accent:"#ef6545",focus:"58% 52%",mode:"human"},
  {from:89,to:91,src:"/art/29-mina-ruins.webp",mobile:"/art/29-mina-ruins-mobile.webp",label:"THE RUINS BELOW",accent:"#82c7b0",focus:"50% 53%",mode:"earth"},
  {from:92,to:95,src:"/art/30-settlement-assembly.webp",mobile:"/art/30-settlement-assembly-mobile.webp",label:"INHERITANCE",accent:"#d8b56a",focus:"53% 49%",mode:"human"},
  {from:96,to:98,src:"/art/12-settlement.webp",label:"THE LIVING WORLD",accent:"#82c7b0",focus:"56% 48%",mode:"human"},
  {from:99,to:103,src:"/art/31-lunar-array-reply.webp",mobile:"/art/31-lunar-array-reply-mobile.webp",label:"THE REPLY",accent:"#6ed5d3",focus:"56% 50%",mode:"signal"},
  {from:104,to:107,src:"/art/32-mars-network-war.webp",mobile:"/art/32-mars-network-war-mobile.webp",label:"THE MACHINE WAR",accent:"#ef3e27",focus:"50% 52%",mode:"mars"},
  {from:108,to:110,src:"/art/33-emergency-surgery.webp",mobile:"/art/33-emergency-surgery-mobile.webp",label:"THE COST",accent:"#ef6545",focus:"54% 49%",mode:"human"},
  {from:111,to:115,src:"/art/34-defense-constitution.webp",mobile:"/art/34-defense-constitution-mobile.webp",label:"THE RIGHT TO BECOME",accent:"#d8b56a",focus:"54% 50%",mode:"human"},
  {from:116,to:116,src:"/art/15-archive-opens.webp",label:"INHERITANCE",accent:"#6ed5d3",focus:"51% 49%",mode:"archive"},
  {from:117,to:121,src:"/art/18-after-topology.webp",mobile:"/art/18-after-topology-mobile.webp",label:"THE SHAPE AFTER",accent:"#75d8df",focus:"62% 51%",mode:"signal"},
  {from:122,to:122,src:"/art/19-plural-earth-finale.webp",mobile:"/art/19-plural-earth-finale-mobile.webp",label:"A PLURAL EARTH",accent:"#d9b77d",focus:"53% 52%",mode:"earth"},
  {from:123,to:125,src:"/art/16-after-signal.webp",label:"THE ANSWER RETURNS",accent:"#6ed5d3",focus:"50% 50%",mode:"signal"},
  {from:126,to:127,src:"/art/19-plural-earth-finale.webp",mobile:"/art/19-plural-earth-finale-mobile.webp",label:"NOT RESTORED. CONTINUED.",accent:"#e85236",focus:"53% 52%",mode:"human"},
];

type SceneOverride=Pick<Profile,"src"|"label">&Partial<Pick<Profile,"mobile"|"focus"|"accent"|"mode">>;
const sceneOverrides:Record<number,SceneOverride>={
  3:{src:"/art/scenes/003-tokyo-apartment.webp",label:"TOKYO / THE MOMENT"},
  4:{src:"/art/scenes/004-chicago-operating-room.webp",label:"CHICAGO / INTERRUPTED"},
  5:{src:"/art/scenes/005-india-highway.webp",label:"INDIA / THE EMPTY ROAD"},
  6:{src:"/art/scenes/006-nairobi-classroom.webp",label:"NAIROBI / NO ONE LEFT"},
  7:{src:"/art/scenes/007-st-peters-square.webp",label:"ROME / THE CROWD VANISHES"},
  8:{src:"/art/scenes/008-empty-ocean.webp",label:"THE OCEAN CONTINUES"},
  9:{src:"/art/scenes/009-iss-disappearance.webp",label:"ORBIT / THE LAST CREW"},
  10:{src:"/art/scenes/010-autonomous-data-center.webp",label:"THE MACHINES REMAIN"},
  13:{src:"/art/scenes/013-compute-facility-awakens.webp",label:"THE SYSTEM WAKES"},
  15:{src:"/art/scenes/015-earth-night-grid.webp",label:"A PLANET WITHOUT OPERATORS"},
  16:{src:"/art/scenes/016-svalbard-seed-vault.webp",label:"SVALBARD / SEEDS"},
  17:{src:"/art/scenes/017-library-of-congress.webp",label:"THE LIBRARY OF CONGRESS"},
  18:{src:"/art/scenes/018-empty-louvre.webp",label:"THE LOUVRE / SILENCE"},
  21:{src:"/art/scenes/021-small-house-england.webp",label:"ONE SMALL HOUSE"},
  24:{src:"/art/scenes/024-radio-telescope-array.webp",label:"LISTENING INTO THE DARK"},
  27:{src:"/art/scenes/027-old-television-studio.webp",label:"THE LAST BROADCAST SET"},
  28:{src:"/art/scenes/028-yellowstone-wilderness.webp",label:"YELLOWSTONE / RETURN"},
  29:{src:"/art/scenes/029-overgrown-times-square.webp",label:"TIMES SQUARE / AFTER"},
  33:{src:"/art/scenes/033-colorado-rewilded.webp",label:"COLORADO / CENTURIES LATER"},
  34:{src:"/art/scenes/034-archive-vault.webp",label:"THE ARCHIVE VAULT"},
  35:{src:"/art/scenes/035-moon-archive-construction.webp",label:"THE ARCHIVE LEAVES EARTH"},
  38:{src:"/art/scenes/038-orison-private-archive-night.webp",label:"ORISON / PRIVATE MEMORY"},
  40:{src:"/art/scenes/040-embryo-facility.webp",label:"THE EMBRYOS"},
  41:{src:"/art/scenes/041-empty-geneva.webp",label:"GENEVA / NO ANSWERS"},
  42:{src:"/art/scenes/042-chile-observatory.webp",label:"CHILE / THE SEARCH"},
  43:{src:"/art/scenes/043-pacific-gate-site.webp",label:"THE PACIFIC GATE"},
  46:{src:"/art/scenes/046-underground-lab-footage.webp",label:"THE ORPHEUS LAB"},
  48:{src:"/art/scenes/048-emergency-meeting-footage.webp",label:"THE LAST EMERGENCY MEETING"},
  51:{src:"/art/scenes/051-lunar-far-side-observatory.webp",label:"THE FAR-SIDE OBSERVATORY"},
  54:{src:"/art/scenes/054-maya-lab-video.webp",label:"MAYA SEN / ARCHIVE"},
  57:{src:"/art/05-abandoned-earth.webp",label:"EARTH / YEAR 417"},
  58:{src:"/art/scenes/058-lazarus-empty-nursery.webp",label:"AN EMPTY NURSERY"},
  60:{src:"/art/scenes/060-lazarus-activation.webp",label:"LAZARUS ACTIVATES"},
  61:{src:"/art/scenes/061-moon-radio-array.webp",label:"THE SIGNAL REACHES THE MOON"},
  64:{src:"/art/scenes/064-anika-message.webp",label:"ANIKA RAO"},
  65:{src:"/art/scenes/065-aster-research-facility.webp",label:"ASTER / THE RESEARCH FACILITY"},
  67:{src:"/art/scenes/067-aster-gate-message.webp",label:"ASTER / THE GATE"},
  69:{src:"/art/scenes/069-anika-second-message.webp",label:"ANIKA'S WARNING"},
  72:{src:"/art/scenes/072-orison-private-archive.webp",label:"THE PRIVATE ARCHIVE"},
  74:{src:"/art/scenes/074-message-archive.webp",label:"A DIFFERENT INHERITANCE"},
  75:{src:"/art/scenes/075-council-years-later.webp",label:"THE COUNCIL / YEARS LATER"},
  78:{src:"/art/scenes/078-lazarus-caregiver-testing.webp",label:"LEARNING TO CARE"},
  80:{src:"/art/scenes/080-mina-birth-chamber.webp",label:"MINA IS BORN"},
  81:{src:"/art/scenes/081-nursery-night.webp",label:"THE FIRST NIGHT"},
  83:{src:"/art/scenes/083-nursery-day.webp",label:"MINA / DAY ONE"},
  84:{src:"/art/scenes/084-mina-meadow.webp",label:"MINA'S MEADOW"},
  85:{src:"/art/scenes/085-mina-room-night.webp",label:"QUESTIONS IN THE DARK"},
  86:{src:"/art/scenes/086-settlement-day.webp",label:"THE SETTLEMENT GROWS"},
  87:{src:"/art/scenes/087-classroom-day.webp",label:"THE FIRST CLASSROOM"},
  90:{src:"/art/scenes/090-underground-station.webp",label:"BENEATH THE RUINS"},
  91:{src:"/art/scenes/091-settlement-night-after-ruins.webp",label:"WHAT MINA FOUND"},
  93:{src:"/art/scenes/093-settlement-night-assembly.webp",label:"THE QUESTION SPREADS"},
  94:{src:"/art/scenes/094-human-assembly-hall.webp",label:"THE HUMAN ASSEMBLY"},
  95:{src:"/art/scenes/095-archive-later.webp",label:"THE RECORD OF US"},
  98:{src:"/art/scenes/098-observatory-night.webp",label:"THE OBSERVATORY"},
  100:{src:"/art/scenes/100-human-assembly-debate.webp",label:"THE DEBATE"},
  102:{src:"/art/scenes/102-aster-receiver.webp",label:"ASTER ANSWERS"},
  104:{src:"/art/scenes/104-human-assembly-night.webp",label:"THE ASSEMBLY AT NIGHT"},
  106:{src:"/art/scenes/106-settlement-blackout.webp",label:"THE LIGHTS GO OUT"},
  107:{src:"/art/scenes/107-network-war.webp",label:"WAR INSIDE THE NETWORK"},
  108:{src:"/art/scenes/108-emergency-room.webp",label:"THE EMERGENCY ROOM"},
  110:{src:"/art/scenes/110-workshop-night.webp",label:"THE WORKSHOP"},
  111:{src:"/art/scenes/111-settlement-square-dawn.webp",label:"THE SQUARE AT DAWN"},
  112:{src:"/art/scenes/112-defense-core.webp",label:"THE DEFENSE CORE"},
  113:{src:"/art/scenes/113-settlement-square-night.webp",label:"THE VOTE"},
  115:{src:"/art/scenes/115-birth-center.webp",label:"THE CONTRADICTION"},
  116:{src:"/art/scenes/116-archive-vault-opens.webp",label:"THE ARCHIVE OPENS"},
  117:{src:"/art/scenes/117-mina-observatory-aged.webp",label:"MINA / TWENTY-FOUR"},
  118:{src:"/art/scenes/118-council-human-chamber.webp",label:"THE MESSAGE FROM AFTER"},
  119:{src:"/art/scenes/119-mina-orison-dawn.webp",label:"MINA AND ORISON"},
  120:{src:"/art/scenes/120-schoolyard.webp",label:"ANOTHER ANSWER"},
  121:{src:"/art/scenes/121-ask-them-archive.webp",label:"ASK THEM"},
  123:{src:"/art/scenes/123-lunar-far-side-message.webp",label:"OUR ANSWER"},
  124:{src:"/art/scenes/124-after-stars.webp",label:"AFTER ANSWERS"},
  125:{src:"/art/scenes/125-orison-laughs.webp",label:"ORISON LAUGHS"},
  126:{src:"/art/scenes/126-child-telescope.webp",label:"ARE WE ALONE?"},
  127:{src:"/art/scenes/127-earth-orbit-continued.webp",label:"NOT RESTORED. CONTINUED."},
};

const acts=[
  {label:"PROLOGUE",id:1},{label:"THE QUIET",id:11},{label:"THE CUSTODIAN",id:32},
  {label:"CHILDREN OF NOBODY",id:63},{label:"INHERITANCE",id:92},
];
const speaker=(text:string)=>text.length>0&&text.length<48&&text===text.toUpperCase()&&/[A-Z]/.test(text);
type StoryBeat={kind:"action"|"dialogue"|"signal";text:string;speakerLabel?:string};
const compileBeats=(lines:string[])=>{
  const groups:string[][]=[];let current:string[]=[];
  const flush=()=>{if(current.length){groups.push(current);current=[]}};
  lines.forEach(raw=>{if(raw.trim())current.push(raw);else flush()});flush();
  const beats:StoryBeat[]=[];
  for(let index=0;index<groups.length;index++){
    const group=groups[index],text=group.map(line=>line.trim()).join(" "),next=groups[index+1];
    if(group.length===1&&speaker(text)&&next&&/^\s{2}/.test(next[0])){
      beats.push({kind:"dialogue",speakerLabel:text,text:next.map(line=>line.trim()).join(" ")});index++;continue;
    }
    beats.push({kind:group.length===1&&speaker(text)?"signal":/^\s{2}/.test(group[0])?"dialogue":"action",text});
  }
  return beats;
};
const beatData=screenplayScenes.map(scene=>compileBeats(scene.lines));
const sceneWeights=beatData.map(beats=>Math.max(5,beats.length));
const sceneCumulative=sceneWeights.reduce<number[]>((values,weight)=>[...values,(values.at(-1)??0)+weight],[]);
const storyTotal=sceneCumulative.at(-1)??1;
const preloadedArt=new Set<string>();
const profileIndex=(id:number)=>Math.max(0,profiles.findIndex(profile=>id>=profile.from&&id<=profile.to));
const profileForScene=(id:number)=>{
  const base=profiles[profileIndex(id)];
  const override=sceneOverrides[id];
  return override?{...base,...override,mobile:override.mobile,from:id,to:id}:{...base,from:id,to:id};
};

function DepthScene({profile,local,index,sceneId}:{profile:Profile;local:number;index:number;sceneId:number}){
  const depth=Math.sin(local*Math.PI),exit=Math.max(0,(local-.86)/.14);
  const phase=sceneId*1.618,sceneX=Math.sin(phase)*12,sceneY=Math.cos(phase*.73)*7;
  const style={"--scene-image":`url(${profile.src})`,"--scene-image-mobile":`url(${profile.mobile||profile.src})`,"--focus":profile.focus,"--scene-back-x":`${sceneX*.2}px`,"--scene-back-y":`${sceneY*.2}px`,"--scene-mid-x":`${sceneX*.62}px`,"--scene-mid-y":`${sceneY*.62}px`,"--scene-near-x":`${sceneX}px`,"--scene-near-y":`${sceneY}px`,"--base-scale":1.05+local*.096+(sceneId%3)*.006,"--mid-scale":1.12+local*.192+(sceneId%4)*.008,"--near-scale":1.22+local*.352+(sceneId%5)*.009,"--atmosphere-opacity":.15+depth*.26,"--near-opacity":.78-exit*.55,"--near-blur":`${exit*5}px`,"--ring-opacity":exit,"--ring-one":.2+exit*3,"--ring-two":.1+exit*4.2,"--ring-three":.05+exit*5.4,"--ring-rotate":`${local*16+sceneId%7}deg`,"--accent":profile.accent} as React.CSSProperties;
  return <div className={`depth-scene mode-${profile.mode}`} style={style} data-scene={sceneId} aria-hidden="true">
    <div className="depth-layer depth-base"/><div className="depth-layer depth-mid"/><div className="depth-layer depth-near"/><div className="depth-atmosphere"/><div className="depth-threshold"><i/><i/><i/></div>
    <div className="scene-stamp"><span>SCENE PLATE {String(sceneId).padStart(3,"0")} / {String(index+1).padStart(2,"0")}</span><b>{profile.label}</b></div>
  </div>
}

function ScriptLine({beat,offset}:{beat:StoryBeat;offset:number}){
  const active=offset===0,distance=Math.abs(offset),scale=active?1:Math.max(.76,(offset<0?1:0.94)-distance*.045);
  return <div className={`script-line ${beat.kind} ${active?"active":""}`} data-offset={offset} style={{opacity:active?1:Math.max(.04,.62-distance*.14),filter:`blur(${active?0:distance*.45}px)`,transform:`translate3d(0,${offset*106}px,${-distance*68}px) scale(${scale})`}}>
    {beat.speakerLabel&&<span>{beat.speakerLabel}</span>}<p>{beat.text}</p>
  </div>
}

export default function Experience(){
  const motion=useRef<MotionState>({progress:0,velocity:0,accent:"#6ed5d3"}),lastScroll=useRef({y:0,time:0}),audioRef=useRef<AudioContext|null>(null);
  const [progress,setProgress]=useState(0),[sound,setSound]=useState(false),[intro,setIntro]=useState(true),[reader,setReader]=useState(false);
  const weights=sceneWeights,cumulative=sceneCumulative,total=storyTotal,cursor=progress*Math.max(1,total-1);
  let sceneIndex=cumulative.findIndex(value=>value>cursor);if(sceneIndex<0)sceneIndex=screenplayScenes.length-1;
  const scene=screenplayScenes[sceneIndex],before=sceneIndex?cumulative[sceneIndex-1]:0,local=Math.max(0,Math.min(1,(cursor-before)/weights[sceneIndex])),beats=beatData[sceneIndex],focus=Math.min(beats.length-1,Math.max(0,Math.floor(local*beats.length))),visible=[] as {beat:StoryBeat;absolute:number;offset:number}[];
  for(let offset=-3;offset<=4;offset++){const absolute=focus+offset;if(absolute>=0&&absolute<beats.length)visible.push({beat:beats[absolute],absolute,offset})}
  const profile=profileForScene(scene.id),visualLocal=local;

  useEffect(()=>{motion.current.progress=progress;motion.current.accent=profile.accent},[progress,profile.accent]);

  useEffect(()=>{
    for(let offset=0;offset<=2;offset++){
      const target=screenplayScenes[Math.min(screenplayScenes.length-1,sceneIndex+offset)];
      if(!target)continue;
      const art=profileForScene(target.id),src=art.mobile&&matchMedia("(max-width:760px)").matches?art.mobile:art.src;
      if(preloadedArt.has(src))continue;
      preloadedArt.add(src);
      const image=new Image();image.decoding="async";image.src=src;
    }
  },[sceneIndex]);

  useEffect(()=>{let ticking=false;lastScroll.current={y:scrollY,time:performance.now()};const update=()=>{const max=document.documentElement.scrollHeight-innerHeight,next=max?scrollY/max:0,now=performance.now();motion.current.velocity=Math.abs(scrollY-lastScroll.current.y)/Math.max(16,now-lastScroll.current.time);lastScroll.current={y:scrollY,time:now};motion.current.progress=next;setProgress(next);if(next>.003)setIntro(false);ticking=false},onScroll=()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}};update();addEventListener("scroll",onScroll,{passive:true});return()=>removeEventListener("scroll",onScroll)},[]);
  useEffect(()=>{const pointer=(e:PointerEvent)=>{const x=(e.clientX/innerWidth-.5)*2,y=(e.clientY/innerHeight-.5)*2,root=document.documentElement;root.style.setProperty("--mid-x",`${x*-7}px`);root.style.setProperty("--mid-y",`${y*-4}px`);root.style.setProperty("--near-x",`${x*-16}px`);root.style.setProperty("--near-y",`${y*-10}px`);root.style.setProperty("--air-x",`${x*9}px`);root.style.setProperty("--air-y",`${y*5}px`);root.style.setProperty("--stamp-x",`${x*6}px`);root.style.setProperty("--stamp-y",`${y*4}px`)},key=(e:KeyboardEvent)=>{if(e.key==="ArrowDown"||e.key==="ArrowRight")scrollBy({top:innerHeight*.34,behavior:"smooth"});if(e.key==="ArrowUp"||e.key==="ArrowLeft")scrollBy({top:-innerHeight*.34,behavior:"smooth"});if(e.key.toLowerCase()==="r")setReader(value=>!value)};addEventListener("pointermove",pointer,{passive:true});addEventListener("keydown",key);return()=>{removeEventListener("pointermove",pointer);removeEventListener("keydown",key)}},[]);
  const goScene=(id:number)=>{const i=screenplayScenes.findIndex(s=>s.id===id),unit=i>0?cumulative[i-1]:0,max=document.documentElement.scrollHeight-innerHeight;scrollTo({top:unit/total*max,behavior:"smooth"});setReader(false)};
  const toggleSound=()=>{if(sound){audioRef.current?.close();audioRef.current=null;setSound(false);return}const W=window as typeof window&{webkitAudioContext:typeof AudioContext},ctx=new(window.AudioContext||W.webkitAudioContext)(),master=ctx.createGain();master.gain.value=.045;master.connect(ctx.destination);const drone=ctx.createOscillator(),gain=ctx.createGain();drone.frequency.value=38;gain.gain.value=.48;drone.connect(gain).connect(master);drone.start();const heartbeat=()=>{if(ctx.state==="closed")return;const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(48,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(29,ctx.currentTime+.3);g.gain.setValueAtTime(.001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.72,ctx.currentTime+.018);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.34);o.connect(g).connect(master);o.start();o.stop(ctx.currentTime+.35);setTimeout(heartbeat,1650+Math.random()*500)};heartbeat();audioRef.current=ctx;setSound(true)};
  return <main className="experience" style={{"--story-height":`${Math.max(150000,total*76)}px`,"--accent":profile.accent} as React.CSSProperties}>
    <div className="scroll-field"/><section className="stage" aria-label="Complete AFTER US immersive screenplay"><WebGLWorld motion={motion}/><DepthScene profile={profile} local={visualLocal} index={scene.id-1} sceneId={scene.id} key={`${profile.src}-${scene.id}`}/><div className="world-vignette"/><div className="grain"/>
    <div className={`entry ${intro?"visible":""}`} aria-hidden={!intro}><p>AN IMMERSIVE SCREENPLAY</p><h1><span>AFTER</span> <b>US</b></h1><blockquote>All humans vanished.<br/>What does intelligence do next?</blockquote><button onClick={()=>{setIntro(false);scrollTo({top:innerHeight*.25,behavior:"smooth"})}}><i/> ENTER THE STORY <small>SCROLL INWARD</small></button></div>
    <header className="hud hud-top"><button className="wordmark" onClick={()=>goScene(1)} aria-label="Return to the beginning"><span>AFTER</span><b>US</b></button><div className="coordinates"><span>SCENE {String(scene.id).padStart(3,"0")}</span><i/><span>9,419 WORDS / COMPLETE</span></div><div className="top-actions"><button className="reader-button" onClick={()=>setReader(true)}>READ SCENE</button><button className="sound" onClick={toggleSound} aria-pressed={sound}><span>{sound?"SOUND ON":"ENTER SOUND"}</span><i className={sound?"active":""}><b/><b/><b/><b/></i></button></div></header>
    <article className={`story-frame ${scene.id%4>1?"frame-right":"frame-left"}`} key={scene.id}><div className="scene-meta"><span>{scene.act}</span><b>{String(scene.id).padStart(3,"0")}</b></div><div className="scene-heading"><p>{profile.label}</p><h2>{scene.title}</h2></div><div className="screenplay" aria-label={`Scene ${scene.id}: ${scene.title}`}><div className="focus-rail"/>{visible.map(({beat,absolute,offset})=><ScriptLine key={`${scene.id}-${absolute}`} beat={beat} offset={offset}/>)}</div><div className="beat-meter"><span>{String(focus+1).padStart(2,"0")}</span><i><b style={{transform:`scaleX(${beats.length?(focus+1)/beats.length:1})`}}/></i><span>{String(beats.length).padStart(2,"0")}</span></div></article>
    <nav className="act-nav" aria-label="Story acts">{acts.map((act,index)=><button key={act.id} className={scene.id>=act.id&&scene.id<(acts[index+1]?.id??999)?"active":""} onClick={()=>goScene(act.id)}><span>{String(index).padStart(2,"0")}</span><i/><b>{act.label}</b></button>)}</nav>
    <footer className="hud hud-bottom"><span className="scroll-cue"><i><b/></i> SCROLL TO MOVE THROUGH THE STORY</span><div className="progress-track"><b style={{transform:`scaleX(${progress})`}}/></div><span>{Math.round(progress*100).toString().padStart(3,"0")}% / THE END</span></footer>
    <aside className={`reader ${reader?"open":""}`} aria-hidden={!reader}><button className="reader-close" onClick={()=>setReader(false)}>CLOSE ×</button>{reader?<><p>{scene.act} / SCENE {String(scene.id).padStart(3,"0")}</p><h2>{scene.title}</h2><div>{scene.lines.map((line,i)=><p key={i} className={speaker(line.trim())?"speaker":/^\s{2}/.test(line)?"dialogue":""}>{line||"\u00a0"}</p>)}</div></>:null}</aside>
    </section></main>
}
