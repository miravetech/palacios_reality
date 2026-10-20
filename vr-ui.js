/* Stereo UI: native krpano WebGL hotspots, with controller and gaze selection. */
window.installGameVR=function(k,root){
 let active=false,key='',rendered='',page=0,anchor=0,pitch=0,used=0;
 const pool=[];let card;
 const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
 const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 const hitCanvas=document.createElement('canvas');hitCanvas.width=hitCanvas.height=8;const hitContext=hitCanvas.getContext('2d');hitContext.fillStyle='#a7f3d0';hitContext.fillRect(0,0,8,8);const hitTexture=hitCanvas.toDataURL();
 function spot(text,ath,atv,width,height,click){const n=used++;let h=pool[n];if(!h){k.call('addhotspot(game_vr_ui_'+n+');');h=k.get('hotspot[game_vr_ui_'+n+']');pool.push(h);Object.assign(h,{type:'image',url:hitTexture,renderer:'webgl',keep:true,distorted:true,depth:1000,scale:.45,zorder:10000+n,vr_timeout:1500});}Object.assign(h,{visible:true,enabled:true,handcursor:true,capture:true,width,height,onclick:click,alpha:.001});}
 function pages(text){const words=text.split(' '),out=[];let line='';for(const w of words){if(line.length+w.length>490){out.push(line);line='';}line+=(line?' ':'')+w;}if(line)out.push(line);return out.length?out:[''];}
 function renderCard(state,text,actions,pageCount){
  const W=1000,pad=48,canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  canvas.width=W;ctx.font='32px Arial';
  const wrap=(text,width)=>{const lines=[];for(const para of text.split('\n')){let line='';for(const word of para.split(' ')){const next=line?line+' '+word:word;if(ctx.measureText(next).width>width&&line){lines.push(line);line=word;}else line=next;}lines.push(line);}return lines;};
  const mission=state.id.startsWith('quest:'),close=mission?actions.find(a=>a[0]==='Cerrar pista'):null;
  const primary=actions.filter(a=>a!==close),body=mission?text.replace(/^MISIÓN[^\n]*\n*/,''):text;
  const lines=wrap(body,W-pad*2),bodyY=112,lineHeight=46,bodyBottom=bodyY+lines.length*lineHeight;
  const rects=[];let y=bodyBottom+25;
  const main=primary.filter(a=>!['Recentrar menú','Salir de VR'].includes(a[0])),tools=primary.filter(a=>['Recentrar menú','Salir de VR'].includes(a[0]));
  const cols=main.some(a=>a[0].length>26)?1:Math.min(3,main.length||1),gap=16,bw=(W-pad*2-gap*(cols-1))/cols;
  ctx.font='27px Arial';for(let i=0;i<main.length;i+=cols){const row=main.slice(i,i+cols),height=Math.max(76,...row.map(a=>wrap(a[0],bw-40).length*34+30));row.forEach((a,j)=>rects.push({a,x:pad+j*(bw+gap),y,w:bw,h:height,primary:i+j===0}));y+=height+16;}
  tools.forEach((a,i)=>rects.push({a,x:pad+i*260,y:y+10,w:244,h:66,tool:true}));
  const H=Math.ceil(y+(tools.length?106:30));canvas.height=H;
  const round=(x,y,w,h,r)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r);};
  const grad=ctx.createLinearGradient(0,0,W,H);grad.addColorStop(0,'rgba(17,51,67,0.88)');grad.addColorStop(1,'rgba(5,22,37,0.80)');
  ctx.fillStyle=grad;round(2,2,W-4,H-4,40);ctx.fill();ctx.strokeStyle='rgba(196,255,230,.48)';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#b5f4d9';ctx.font='bold 23px Arial';ctx.textAlign='left';ctx.fillText(mission?clean(state.text.split('\n')[0]):'EDUCADORES DEL FUTURO',pad,62);
  ctx.fillStyle='#fff';ctx.font='32px Arial';ctx.shadowColor='#000';ctx.shadowBlur=5;ctx.shadowOffsetY=2;
  lines.forEach((line,i)=>ctx.fillText(line,pad,bodyY+i*lineHeight));ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  if(pageCount>1){ctx.fillStyle='#bad2d7';ctx.font='22px Arial';ctx.textAlign='right';ctx.fillText((page+1)+' / '+pageCount,W-pad,H-32);}
  if(close)rects.push({a:close,x:W-94,y:20,w:64,h:64,close:true});
  rects.forEach(r=>{ctx.fillStyle=r.close?'rgba(255,255,255,.07)':r.tool?'rgba(255,255,255,.035)':r.primary?'rgba(167,243,208,.16)':'rgba(255,255,255,.06)';round(r.x,r.y,r.w,r.h,r.close?32:r.tool?28:20);ctx.fill();ctx.strokeStyle=r.primary?'rgba(167,243,208,.65)':'rgba(255,255,255,.2)';ctx.lineWidth=1.5;ctx.stroke();ctx.font=(r.tool?'24':'bold 27')+'px Arial';ctx.textAlign='center';ctx.fillStyle=r.primary?'#ffe5a3':'#f5faf8';const label=r.close?'×':r.a[0],labelLines=wrap(label,r.w-36);labelLines.forEach((line,i)=>ctx.fillText(line,r.x+r.w/2,r.y+r.h/2+9+(i-(labelLines.length-1)/2)*34));});
  if(!card){k.call('addhotspot(game_vr_card);');card=k.get('hotspot[game_vr_card]');Object.assign(card,{type:'image',renderer:'webgl',keep:true,distorted:true,depth:1000,scale:.45,zorder:9900,enabled:false});}
  Object.assign(card,{visible:true,ath:anchor,atv:pitch,width:W,height:H,url:canvas.toDataURL('image/png')});
  for(const r of rects){spot(' ',0,0,r.w,r.h,r.a[1]);const h=pool[used-1];Object.assign(h,{ath:anchor,atv:pitch,ox:.45*(r.x+r.w/2-W/2),oy:.45*(r.y+r.h/2-H/2),alpha:.001});h.onover=()=>{h.alpha=.15;};h.onout=()=>{h.alpha=.001;};}
 }
 function visible(e){return !e.closest('[hidden]');}
 function click(e){if(e&&!e.disabled)e.click();}
 function snapshot(){
  const modal=root.querySelector('#modal'),quest=root.querySelector('.quest');
  if(!modal.hidden){
   const panel=modal.querySelector('.panel'),cover=panel.querySelector('.cover-start');
   if(cover)return {id:'cover',text:'EDUCADORES DEL FUTURO · Una expedición casi académica',actions:[['Iniciar',()=>click(cover)]]};
   const texts=[...panel.querySelectorAll('h1,h2,p,.eyebrow')].filter(e=>!e.closest('button')&&visible(e)).map(e=>clean(e.textContent));
   const radios=[...panel.querySelectorAll('input[type=radio]')];
   const actions=[];
   if(radios.length){radios.forEach((r,i)=>{actions.push([(r.checked?'✓ ':'')+clean(r.closest('label').textContent),()=>click(r)]);});}
   for(const b of panel.querySelectorAll('button'))if(visible(b))actions.push([clean(b.textContent),()=>click(b)]);
   if(panel.querySelector('input[type=password]'))texts.push('Introduce la contraseña antes de entrar en VR.');
   return {id:'modal:'+panel.innerHTML,text:texts.join('\n\n'),actions};
  }
  if(!quest.hidden)return {id:'quest:'+quest.textContent,text:clean(quest.querySelector('#quest-number').textContent)+'\n\n'+clean(quest.querySelector('#quest-clue').textContent),actions:[['Cerrar pista',()=>click(quest.querySelector('.quest-close'))],['Ver pista',()=>click(quest.querySelector('#hint'))]]};
  const actions=[];
  for(const id of ['quest-small','ending-explore','ending-restart','visit-paper','visit-room1','visit-room2']){const b=root.querySelector('#'+id);if(b&&visible(b))actions.push([clean(b.textContent),()=>click(b)]);}
  if(!actions.some(a=>/misión/i.test(a[0]))){const show=root.querySelector('#show-quest');if(show&&visible(show))actions.push(['Ver misión',()=>click(show)]);}
  const sound=root.querySelector('#sound');if(sound)actions.push([sound.getAttribute('aria-label'),()=>click(sound)]);
  actions.push(['Ayuda',()=>click(root.querySelector('#help'))]);
  const toast=root.querySelector('.toast');
  const credits=root.querySelector('.gratitude-text');return {id:credits?'credits':'controls',text:credits?clean(credits.textContent):(toast&&!toast.hidden?toast.textContent:'EDUCADORES DEL FUTURO'),actions,compact:!credits};
 }
 function update(){
  const vr=!!k.get('webvr.isenabled');
  if(!vr){if(active){root.style.visibility='';for(const h of pool)h.visible=false;if(card)card.visible=false;active=false;key='';rendered='';}return;}
  if(!active){active=true;key='';root.style.visibility='hidden';k.call('stoplookto();set(autorotate.enabled,false);');}
  const state=snapshot();
  if(state.id!==key){key=state.id;page=0;anchor=Number(k.get('view.hlookat'))||0;pitch=Math.max(-25,Math.min(25,Number(k.get('view.vlookat'))||0));}
  const chunks=pages(state.text);page=Math.min(page,chunks.length-1);const signature=JSON.stringify([state.id,state.text,state.actions.map(a=>a[0]),page,anchor,pitch]);if(signature===rendered)return;rendered=signature;used=0;
  const actions=state.actions.slice();
  if(chunks.length>1){actions.unshift(['← Leer anterior',()=>{page=Math.max(0,page-1);}]);actions.unshift(['Leer siguiente →',()=>{page=Math.min(chunks.length-1,page+1);}]);}
  actions.push(['Recentrar menú',()=>{anchor=Number(k.get('view.hlookat'))||0;pitch=Number(k.get('view.vlookat'))||0;}]);
  actions.push(['Salir de VR',()=>k.call('webvr.exitVR();')]);
  renderCard(state,chunks[page],actions,chunks.length);
  for(let i=used;i<pool.length;i++)pool[i].visible=false;
 }
 return {update};
};
