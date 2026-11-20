(function medfindApp(){
'use strict';
const KEY='medfind-v2-demo-v1';
const stamp=()=>new Date().toISOString();
const uid=(p)=>p+'-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const money=n=>'₦'+Number(n||0).toLocaleString('en-NG');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=s=>new Date(s).toLocaleDateString('en-NG',{day:'numeric',month:'short',year:'numeric'});
function initial(){
  const t=stamp();
  return {
    version:1,
    users:[
      {id:'c-demo',role:'customer',name:'Grace Eze',email:'grace@medfind.demo',password:'demo1234',phone:'08012345678',address:'12 Adeola Odeku Street, Victoria Island, Lagos'},
      {id:'p-demo',role:'pharmacy',name:'Emeka Okafor',email:'pharmacy@medfind.demo',password:'demo1234',phone:'08055551234',address:'24 Admiralty Way, Lekki, Lagos',pharmacyId:'blue'},
    ],
    pharmacies:[
      {id:'blue',ownerId:'p-demo',name:'BlueCross Pharmacy',address:'24 Admiralty Way, Lekki, Lagos',phone:'08055551234',hours:'Mon–Sat, 8 AM–9 PM',description:'Your trusted neighbourhood pharmacy',delivery:true,verified:true},
      {id:'wellcare',ownerId:null,name:'WellCare Pharmacy',address:'15 Allen Avenue, Ikeja, Lagos',phone:'08055551999',hours:'Daily, 9 AM–8 PM',description:'Everyday family health essentials',delivery:false,verified:true},
    ],
    meds:[
      {id:'m1',pharmacyId:'blue',name:'Paracetamol',strength:'500 mg · 20 tablets',category:'Pain relief',price:850,stock:45},
      {id:'m2',pharmacyId:'blue',name:'Vitamin C',strength:'1000 mg · 30 tablets',category:'Vitamins',price:3200,stock:30},
      {id:'m3',pharmacyId:'blue',name:'Cetirizine',strength:'10 mg · 10 tablets',category:'Allergy',price:1200,stock:16},
      {id:'m4',pharmacyId:'blue',name:'ORS Sachets',strength:'5 sachets',category:'First aid',price:950,stock:52},
      {id:'m5',pharmacyId:'wellcare',name:'Paracetamol',strength:'500 mg · 20 tablets',category:'Pain relief',price:900,stock:29},
    ],
    bookings:[
      {id:'MF-1042',customerId:'c-demo',pharmacyId:'blue',medicineId:'m1',name:'Paracetamol',qty:2,price:850,method:'Pickup',payment:'Pay at pharmacy',status:'Ready for pickup',address:'',created:t,updated:t},
      {id:'MF-1041',customerId:'c-demo',pharmacyId:'blue',medicineId:'m2',name:'Vitamin C',qty:1,price:3200,method:'Delivery',payment:'Pay online (demo)',status:'Completed',address:'12 Adeola Odeku Street, Victoria Island, Lagos',created:t,updated:t},
    ],
    saved:{'c-demo':['m2']},
    notices:[{id:'n1',userId:'c-demo',text:'Paracetamol is ready for pickup at BlueCross Pharmacy.',created:t,read:false}],
    activity:[{id:'a1',pharmacyId:'blue',text:'Reservation MF-1042 received',created:t}],
    sessions:{customer:null,pharmacy:null}
  };
}
function load(){try{let x=JSON.parse(localStorage.getItem(KEY));if(x&&x.version===1&&Array.isArray(x.users))return x}catch(e){}return initial()}
let db=load(),mode='customer',page='home',search='',detail=null,pending=null,filter='All',tab='Saved',notice='',error='';
const getUser=()=>db.users.find(u=>u.id===db.sessions[mode]);
const pharmacy=()=>db.pharmacies.find(p=>p.ownerId===getUser()?.id);
const med=id=>db.meds.find(m=>m.id===id);
const pharm=id=>db.pharmacies.find(p=>p.id===id);
function save(){localStorage.setItem(KEY,JSON.stringify(db));render()}
function toast(text,isError=false){notice=text;error=isError?text:'';render();setTimeout(()=>{if(notice===text){notice='';render()}},3800)}
function go(p){page=p;detail=null;filter='All';tab='Saved';window.location.hash='/'+mode+'/'+p;window.scrollTo(0,0);render()}
function setMode(m){mode=m;page='home';detail=null;window.location.hash='/'+mode+'/home';render()}
function fmtStatus(s){const type=s==='Completed'||s==='Ready for pickup'?'ok':s==='Cancelled'||s==='Declined'?'bad':s==='Pending'?'warn':'';return `<span class="pill ${type}">${escape(s)}</span>`}
function input(name,label,value='',type='text',required=true,placeholder=''){return `<div class="form-group"><label class="label" for="f-${name}">${escape(label)}</label><input class="field" id="f-${name}" name="${escape(name)}" type="${type}" value="${escape(value)}" placeholder="${escape(placeholder)}" ${required?'required':''} ${type==='password'?'minlength="6"':''}></div>`}
function textarea(name,label,value=''){return `<div class="form-group"><label class="label" for="f-${name}">${escape(label)}</label><textarea class="field" name="${escape(name)}" id="f-${name}">${escape(value)}</textarea></div>`}
function btn(text,action,id='',kind='outline'){return `<button class="btn ${kind}" data-action="${escape(action)}" data-id="${escape(id)}" type="button">${text}</button>`}
function empty(icon,title,description,action,cta){return `<div class="card empty"><div class="empty-ill">${icon}</div><h2>${title}</h2><p>${description}</p>${action?btn(cta,action,'',''):''}</div>`}
function shell(content){
 const u=getUser();
 const nav=mode==='customer'?
 [['home','⌂','Home'],['search','⌕','Find medicines'],['reservations','◷','My reservations'],['saved','♡','Saved & refills'],['wallet','▣','Wallet & payments'],['map','♧','Pharmacies & map'],['notifications','♧','Notifications'],['profile','☻','Profile & settings']]:
 [['home','⌂','Dashboard'],['reservations','◷','Reservations'],['inventory','▦','Inventory'],['deliveries','▤','Deliveries'],['earnings','▥','Earnings'],['activity','◷','Activity'],['notifications','♧','Notifications'],['profile','☻','Profile & hours']];
 return `<div class="shell"><header class="mast"><div class="mast-inner"><a class="brand" href="#/" data-action="welcome"><span class="brand-mark">+</span> MedFind <span class="small muted">V2</span></a><div class="mast-actions"><div class="switch"><button data-mode="customer" class="${mode==='customer'?'selected':''}">Customer</button><button data-mode="pharmacy" class="${mode==='pharmacy'?'selected':''}">Pharmacy</button></div>${u?`<span class="small hide-mobile">${escape(u.name)}</span>${btn('Sign out','signout','','ghost')}`:''}</div></div></header><div class="container">${u?`<div class="app-layout"><nav class="sidebar"><div class="caption">${mode==='customer'?'Customer app':'Pharmacy workspace'}</div>${nav.map(([p,i,l])=>`<a href="#/${mode}/${p}" data-nav="${p}" class="${page===p?'active':''}"><span>${i}</span>${l}</a>`).join('')}</nav><main class="main">${content}<div class="footer">MedFind V2 demonstration · No real payments or medical advice · Browser-local data</div></main></div>`:content}</div>${notice?`<div class="toast">${escape(notice)}</div>`:''}</div>`
}
function title(heading,description='',actions=''){return `<div class="page-header"><div><h1>${heading}</h1>${description?`<p class="muted">${description}</p>`:''}</div>${actions}</div>`}
function landing(){return `<div class="welcome"><div class="welcome-inner"><div class="welcome-top"><span class="pill">Healthcare, made simpler</span><h1>Find care, closer to you.</h1><p>One connected MedFind demonstration for people looking for medicines and the pharmacies serving them.</p></div><div class="grid two"><div class="card"><div class="empty-ill" style="margin:0 0 18px">♡</div><h2>I'm looking for medicine</h2><p class="muted">Search nearby pharmacies, save medicines and make pickup or delivery reservations.</p><div class="actions">${btn('Explore customer app','mode-customer','','')}${btn('Try a returning user','demo-customer')}</div></div><div class="card"><div class="empty-ill" style="margin:0 0 18px">✚</div><h2>I run a pharmacy</h2><p class="muted">Manage inventory, reservations, deliveries, operating hours and earnings.</p><div class="actions">${btn('Explore pharmacy app','mode-pharmacy','','')}${btn('Try a returning pharmacy','demo-pharmacy')}</div></div></div><div class="callout"><b>Demo only.</b> Signing up, phone verification, online payments and notifications are simulated. Changes persist in this browser and sync across tabs on the same origin—not between different users' devices.</div></div></div>`}
function auth(){
 const titleText=page==='signup'?'Create your account':page==='forgot'?'Reset your password':page==='verify'?'Verify your phone':page==='reset'?'Choose a new password':'Welcome back';
 const content=page==='login'?`<form id="login-form">${input('email','Email address','','email')}${input('password','Password','','password')}<button class="btn block">Sign in</button></form><div class="auth-links"><a href="#/${mode}/forgot" data-nav="forgot">Forgot password?</a><a href="#/${mode}/signup" data-nav="signup">Create account</a></div><div class="divider"></div>${btn('Use demo '+(mode==='customer'?'customer':'pharmacy')+' account','demo-'+mode,'','outline')}`:
 page==='signup'?`<form id="signup-form">${input('name','Full name')}${input('email','Email address','','email')}${input('phone','Phone number','','tel')}${mode==='pharmacy'?input('pharmacyName','Pharmacy name'):''}${input('address',mode==='pharmacy'?'Pharmacy address':'Your address')}${input('password','Password','','password')}<button class="btn block">Continue to verification</button></form><div class="auth-links"><a data-nav="login" href="#/${mode}/login">Already have an account? Sign in</a></div>`:
 page==='verify'?`<p class="muted">Enter the six-digit demo verification code sent to ${escape(pending?.phone||'your phone')}.</p><div class="callout">Demo code: <b>123456</b></div><form id="verify-form">${input('code','6-digit code','','text')}<button class="btn block">Verify & create account</button></form>${btn('Back','signup','','ghost')}`:
 page==='forgot'?`<p class="muted">Enter an email registered to the ${mode} demo.</p><form id="forgot-form">${input('email','Email address','','email')}<button class="btn block">Send reset code</button></form>${btn('Back to sign in','login','','ghost')}`:
 page==='reset'?`<p class="muted">For this prototype, enter code <b>123456</b>.</p><form id="reset-form">${input('code','Verification code')}${input('password','New password','','password')}<button class="btn block">Reset password</button></form>`:'';
 return `<div class="auth-wrap"><div class="auth-card"><div class="card"><span class="pill">${mode==='customer'?'Customer':'Pharmacy'} account</span><h1 style="margin-top:15px">${titleText}</h1>${content}</div></div></div>`
}
function customerHome(){
 const u=getUser(),my=db.bookings.filter(r=>r.customerId===u.id),recent=my.slice(0,2);
 return `<div class="hero"><p class="small" style="margin:0">Good to see you</p><h1>Hi, ${escape(u.name.split(' ')[0])} 👋</h1><p>Find the medicines you need from pharmacies near you.</p>${btn('Search for a medicine','search','','')}</div><div class="grid"><div class="stat"><span class="muted small">My reservations</span><div class="metric">${my.length}</div>${btn('View reservations','reservations','','ghost')}</div><div class="stat"><span class="muted small">Saved medicines</span><div class="metric">${(db.saved[u.id]||[]).length}</div>${btn('View saved','saved','','ghost')}</div><div class="stat"><span class="muted small">Available pharmacies</span><div class="metric">${db.pharmacies.length}</div>${btn('Find pharmacies','map','','ghost')}</div></div><div style="height:25px"></div>${title('Recent reservations','Track and manage your medicines')}${recent.length?`<div class="rows">${recent.map(bookingRow).join('')}</div>`:empty('⌁','No reservations yet','Search for medicines to place your first reservation.','search','Find medicines')}`
}
function medicineRow(m){
 const p=pharm(m.pharmacyId),isSaved=(db.saved[getUser()?.id]||[]).includes(m.id);
 return `<div class="card"><div class="row-between"><span class="pill">${escape(m.category)}</span><span class="tag">${m.stock>0?`${m.stock} in stock`:'Out of stock'}</span></div><div style="height:18px"></div><h3>${escape(m.name)}</h3><p class="muted small">${escape(m.strength)}<br>${escape(p?.name||'Pharmacy')}</p><div class="row-between"><div class="metric" style="font-size:21px">${money(m.price)}</div></div><div class="actions">${btn('Reserve','medicine',m.id,'')}${btn(isSaved?'♥ Saved':'♡ Save','save',m.id)}</div></div>`
}
function customerSearch(){
 const meds=db.meds.filter(m=>m.stock>0&&(!search||`${m.name} ${m.category} ${pharm(m.pharmacyId)?.name}`.toLowerCase().includes(search.toLowerCase())));
 return `${title('Find medicines','Search available medicines at nearby pharmacies')}<form id="search-form" class="searchbox" style="margin-bottom:24px"><input class="field" name="query" value="${escape(search)}" placeholder="Search medicines, e.g. Paracetamol" aria-label="Search medicines"><button class="btn">Search</button></form>${meds.length?`<div class="grid">${meds.map(medicineRow).join('')}</div>`:empty('⌕','No medicines found','Try another search term or explore pharmacies.','map','Browse pharmacies')}`
}
function medicineDetail(){
 const m=med(detail);if(!m)return customerSearch();
 const p=pharm(m.pharmacyId);
 return `${btn('← Search results','search','','ghost')}<div class="grid two" style="margin-top:12px"><div class="card"><span class="pill">${escape(m.category)}</span><div class="empty-ill" style="height:145px;width:145px;font-size:70px;margin:28px auto">✚</div><h1>${escape(m.name)}</h1><p class="muted">${escape(m.strength)}</p><div class="metric">${money(m.price)}</div><p class="muted">Per pack · ${m.stock} available</p><h3>About this medicine</h3><p class="muted">Confirm the correct product and use with a licensed pharmacist. Follow product instructions.</p></div><div class="card"><h2>Reserve at ${escape(p?.name)}</h2><p class="muted">${escape(p?.address)}</p><form id="reserve-form"><input type="hidden" name="medicineId" value="${escape(m.id)}">${input('qty','Quantity',1,'number')}<div class="form-group"><label class="label">Fulfilment</label><select class="field" name="method"><option>Pickup</option>${p?.delivery?'<option>Delivery</option>':''}</select></div><div class="form-group"><label class="label">Payment</label><select class="field" name="payment"><option>Pay at pharmacy</option><option>Pay online (demo)</option></select></div>${input('address','Delivery address (if needed)',getUser().address,'text',false)}<p class="tip">No real payment is collected. Your reservation will appear in the pharmacy workspace.</p><button class="btn block" ${m.stock<1?'disabled':''}>Confirm reservation</button></form></div></div>`
}
function bookingRow(b){
 const p=pharm(b.pharmacyId);
 return `<div class="item"><div class="item-body"><h3>${escape(b.name)} × ${b.qty} <span class="small muted">· ${escape(b.id)}</span></h3><p>${escape(p?.name||'Pharmacy')} · ${date(b.created)} · ${escape(b.method)} · ${money(b.qty*b.price)}</p>${fmtStatus(b.status)}</div><div class="actions">${btn('Details','booking',b.id)}${!['Completed','Cancelled','Declined'].includes(b.status)?btn('Cancel','cancel-booking',b.id,'danger'):''}</div></div>`
}
function customerBookings(){
 const all=db.bookings.filter(b=>b.customerId===getUser().id);
 const list=filter==='All'?all:filter==='Active'?all.filter(b=>!['Completed','Cancelled','Declined'].includes(b.status)):filter==='Past'?all.filter(b=>b.status==='Completed'):all.filter(b=>['Cancelled','Declined'].includes(b.status));
 return `${title('My reservations','Your past reservations and active orders')}<div class="tabs">${['All','Active','Past','Cancelled'].map(f=>`<button class="btn ${f===filter?'':'outline'}" data-filter="${f}">${f} (${f==='All'?all.length:f==='Active'?all.filter(b=>!['Completed','Cancelled','Declined'].includes(b.status)).length:f==='Past'?all.filter(b=>b.status==='Completed').length:all.filter(b=>['Cancelled','Declined'].includes(b.status)).length})</button>`).join('')}</div>${list.length?`<div class="rows">${list.map(bookingRow).join('')}</div>`:empty('▣','Nothing here yet','Your reservations will appear here when you make one.','search','Search medicines')}`
}
function bookingDetail(){
 const b=db.bookings.find(b=>b.id===detail&&b.customerId===getUser().id);if(!b)return customerBookings();
 const p=pharm(b.pharmacyId);
 return `${btn('← Reservations','reservations','','ghost')}<div class="card" style="margin-top:14px"><div class="row-between"><h1>Reservation ${escape(b.id)}</h1>${fmtStatus(b.status)}</div><p>${escape(b.name)} × ${b.qty}</p><div class="divider"></div><p><b>Pharmacy:</b> ${escape(p?.name)}</p><p><b>Address:</b> ${escape(p?.address)}</p><p><b>Method:</b> ${escape(b.method)}</p><p><b>Payment:</b> ${escape(b.payment)}</p>${b.method==='Delivery'?`<p><b>Delivery address:</b> ${escape(b.address)}</p>`:''}<p><b>Total:</b> ${money(b.qty*b.price)}</p><p class="muted">Last updated ${date(b.updated)}</p><div class="actions">${!['Completed','Cancelled','Declined'].includes(b.status)?btn('Cancel reservation','cancel-booking',b.id,'danger'):''}${btn('Browse more medicines','search')}</div></div>`
}
function customerSaved(){
 const u=getUser(),ids=db.saved[u.id]||[],list=db.meds.filter(m=>ids.includes(m.id));
 return `${title('Saved & refills','Medications you saved for quick access')}<div class="tabs">${['Saved','Refills'].map(v=>`<button class="btn ${tab===v?'':'outline'}" data-tab="${v}">${v}</button>`).join('')}</div>${tab==='Refills'?empty('◷','No refill reminders yet','Your medicine refill reminders will appear here.','saved','View saved medicines'):list.length?`<div class="grid">${list.map(medicineRow).join('')}</div>`:empty('♡','No saved medications yet','When you save a medicine, it will show up here.','search','Search for medicine')}`
}
function customerWallet(){
 const bookings=db.bookings.filter(b=>b.customerId===getUser().id&&b.payment==='Pay online (demo)');
 return `${title('Wallet & payments','Manage your demo payments') }<div class="grid two"><div class="card"><p class="small muted">Wallet balance</p><div class="metric">₦0</div><p class="muted small">This is a demonstration. No deposits or real charges are supported.</p>${btn('Browse medicines','search','','')}</div><div class="card"><h3>Payment methods</h3><p class="muted">Pay at pharmacy</p><span class="pill ok">Available</span><div class="divider"></div><p class="muted">Pay online (demo)</p><span class="pill">Simulated checkout</span></div></div><div style="height:23px"></div>${title('Payment activity')}<div class="rows">${bookings.length?bookings.map(b=>`<div class="item"><div><b>${escape(b.name)}</b><p>${escape(b.id)} · ${date(b.created)}</p></div><span class="metric" style="font-size:18px">${money(b.qty*b.price)}</span></div>`).join(''):empty('▣','No payments yet','Your demo online payment activity will appear here.','search','Find medicine')}</div>`
}
function mapPage(){
 return `${title('Pharmacies near you','Explore participating locations in Lagos')}<div class="card"><iframe class="map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map of pharmacies in Lagos" src="https://www.openstreetmap.org/export/embed.html?bbox=3.25%2C6.39%2C3.6%2C6.65&layer=mapnik&marker=6.4474%2C3.4744"></iframe><div class="callout">Map is illustrative. Pharmacy listings and locations are demo data; pins do not represent live availability.</div><div class="rows">${db.pharmacies.map(p=>`<div class="item"><div class="item-body"><h3>${escape(p.name)}</h3><p>${escape(p.address)} · ${escape(p.hours)}</p><span class="pill ${p.verified?'ok':'warn'}">${p.verified?'Demo verified':'New pharmacy'}</span></div><div class="actions">${btn('See medicines','pharmacy-meds',p.id)}<a class="btn outline" href="https://www.openstreetmap.org/search?query=${encodeURIComponent(p.address)}" target="_blank" rel="noopener noreferrer">Map ↗</a></div></div>`).join('')}</div></div>`
}
function notifications(){
 const u=getUser(),ns=db.notices.filter(n=>n.userId===u.id);
 return `${title('Notifications','Updates about your '+(mode==='customer'?'reservations':'pharmacy activity'),btn('Mark all read','mark-read'))}${ns.length?`<div class="rows">${ns.map(n=>`<div class="item"><div class="item-body"><p style="color:#172c3d">${escape(n.text)}</p><span class="small muted">${date(n.created)}</span></div>${n.read?'<span class="tag">Read</span>':'<span class="pill">New</span>'}</div>`).join('')}</div>`:empty('♧','All caught up','Updates will appear here when something changes.','home','Go home')}`
}
function profile(){
 const u=getUser(),p=pharmacy();
 return `${title(mode==='customer'?'Profile & settings':'Pharmacy profile & hours','Keep your information up to date')}<div class="grid two"><div class="card"><h2>Personal information</h2><form id="profile-form">${input('name','Full name',u.name)}${input('email','Email address',u.email,'email')}${input('phone','Phone number',u.phone,'tel')}${input('address','Address',u.address)}<button class="btn block">Save changes</button></form></div><div class="card"><h2>Account security</h2><p class="muted">You can change your demo password.</p><form id="password-form">${input('password','New password','','password')}<button class="btn block">Update password</button></form><div class="divider"></div>${btn('Sign out','signout')}<div class="callout">Browser-local demo accounts are not suitable for real personal or medical information.</div></div></div>${p?`<div class="card" style="margin-top:18px"><h2>Pharmacy details & opening hours</h2><form id="pharmacy-profile-form" class="form-grid">${input('name','Pharmacy name',p.name)}${input('phone','Pharmacy phone',p.phone,'tel')}${input('address','Business address',p.address)}${input('hours','Operating hours',p.hours)}<div class="form-group full">${textarea('description','About your pharmacy',p.description)}</div><div class="form-group full"><label class="label"><input type="checkbox" name="delivery" ${p.delivery?'checked':''}> Offer delivery</label></div><div class="form-group full"><button class="btn">Save pharmacy profile</button></div></form></div>`:''}`
}
function pharmacyHome(){
 const p=pharmacy(),u=getUser();if(!p)return empty('✚','Complete pharmacy setup','Add your pharmacy details to begin.','profile','Open profile');
 const orders=db.bookings.filter(b=>b.pharmacyId===p.id),active=orders.filter(b=>!['Completed','Cancelled','Declined'].includes(b.status)),inventory=db.meds.filter(m=>m.pharmacyId===p.id),revenue=orders.filter(b=>b.status==='Completed').reduce((s,b)=>s+b.price*b.qty,0);
 return `${title('Good day, '+escape(u.name.split(' ')[0]),'Here is what is happening at '+escape(p.name),btn('Add medicine','add-medicine','',''))}<div class="grid"><div class="stat"><p class="small muted">Total reservations</p><div class="metric">${orders.length}</div>${btn('View all','reservations','','ghost')}</div><div class="stat"><p class="small muted">Active reservations</p><div class="metric">${active.length}</div>${btn('Manage','reservations','','ghost')}</div><div class="stat"><p class="small muted">Inventory items</p><div class="metric">${inventory.length}</div>${btn('Manage stock','inventory','','ghost')}</div><div class="stat"><p class="small muted">Demo earnings</p><div class="metric">${money(revenue)}</div>${btn('View earnings','earnings','','ghost')}</div></div><div style="height:22px"></div>${title('Recent reservations','Latest customer requests')}${orders.length?`<div class="rows">${orders.slice(0,5).map(pharmacyBookingRow).join('')}</div>`:empty('◷','No reservations yet','New customer reservations will appear here.','inventory','Add medicines')}`
}
function pharmacyBookingRow(b){
 const c=db.users.find(u=>u.id===b.customerId);
 return `<div class="item"><div class="item-body"><h3>${escape(b.name)} × ${b.qty} · ${escape(b.id)}</h3><p>${escape(c?.name||'Customer')} · ${escape(b.method)} · ${money(b.price*b.qty)} · ${date(b.created)}</p>${fmtStatus(b.status)}</div><div class="actions">${b.status==='Pending'?`${btn('Accept','status-Accepted',b.id,'')}${btn('Decline','status-Declined',b.id,'danger')}`:b.status==='Accepted'?btn(b.method==='Delivery'?'Out for delivery':'Ready for pickup','status-'+(b.method==='Delivery'?'Out for delivery':'Ready for pickup'),b.id,''):['Ready for pickup','Out for delivery'].includes(b.status)?btn('Mark completed','status-Completed',b.id,''):''}${btn('Details','booking',b.id)}</div></div>`
}
function pharmacyBookings(){
 const p=pharmacy(),all=db.bookings.filter(b=>b.pharmacyId===p?.id),list=filter==='All'?all:all.filter(b=>b.status===filter);
 return `${title('Reservations','Review and fulfil customer requests')}<div class="tabs">${['All','Pending','Accepted','Ready for pickup','Out for delivery','Completed','Cancelled'].map(v=>`<button class="btn ${v===filter?'':'outline'}" data-filter="${v}">${v}</button>`).join('')}</div>${list.length?`<div class="rows">${list.map(pharmacyBookingRow).join('')}</div>`:empty('▣','No reservations here','Customer reservations will appear as they are placed.','inventory','View inventory')}`
}
function pharmacyBookingDetail(){
 const b=db.bookings.find(x=>x.id===detail&&x.pharmacyId===pharmacy()?.id);if(!b)return pharmacyBookings();
 const c=db.users.find(u=>u.id===b.customerId);
 return `${btn('← Reservations','reservations','','ghost')}<div class="card" style="margin-top:15px"><div class="row-between"><h1>${escape(b.id)}</h1>${fmtStatus(b.status)}</div><p><b>Medicine:</b> ${escape(b.name)} × ${b.qty}</p><p><b>Customer:</b> ${escape(c?.name||'Customer')}</p><p><b>Fulfilment:</b> ${escape(b.method)}</p>${b.method==='Delivery'?`<p><b>Deliver to:</b> ${escape(b.address)}</p>`:''}<p><b>Payment:</b> ${escape(b.payment)}</p><p><b>Total:</b> ${money(b.qty*b.price)}</p><div class="actions">${['Pending','Accepted','Ready for pickup','Out for delivery'].includes(b.status)?['Accepted','Ready for pickup','Out for delivery','Completed','Declined'].filter(status=>status!==b.status&&!(b.method==='Pickup'&&status==='Out for delivery')&&!(b.method==='Delivery'&&status==='Ready for pickup')).map(status=>btn(status,'status-'+status,b.id,status==='Declined'?'danger':'outline')).join(''):btn('Back to reservations','reservations')}</div></div>`
}
function inventory(){
 const p=pharmacy(),list=db.meds.filter(m=>m.pharmacyId===p?.id);
 return `${title('Medicine inventory','Manage what customers can reserve',btn('+ Add medicine','add-medicine','',''))}${list.length?`<div class="rows">${list.map(m=>`<div class="item"><div class="item-body"><h3>${escape(m.name)}</h3><p>${escape(m.strength)} · ${escape(m.category)} · ${money(m.price)}</p><span class="pill ${m.stock<=5?'warn':'ok'}">${m.stock} in stock</span></div><div class="actions">${btn('Edit','edit-medicine',m.id)}${btn('Remove','delete-medicine',m.id,'danger')}</div></div>`).join('')}</div>`:empty('▦','Your inventory is empty','Add your first medicine so customers can find and reserve it.','add-medicine','Add first medicine')}`
}
function medicineEditor(){
 const editing=page==='edit-medicine',item=editing?med(detail):null;
 return `${btn('← Inventory','inventory','','ghost')}<div class="card" style="margin-top:15px;max-width:720px"><h1>${editing?'Edit':'Add'} medicine</h1><form id="medicine-form"><input name="medicineId" type="hidden" value="${escape(item?.id||'')}">${input('name','Medicine name',item?.name||'')}${input('strength','Strength / pack size',item?.strength||'')}${input('category','Category',item?.category||'')}${input('price','Price (NGN)',item?.price||'','number')}${input('stock','Available stock',item?.stock??'','number')}<button class="btn">Save medicine</button></form></div>`
}
function deliveries(){
 const all=db.bookings.filter(b=>b.pharmacyId===pharmacy()?.id&&b.method==='Delivery');
 return `${title('Deliveries','Track orders that require delivery')}${all.length?`<div class="rows">${all.map(b=>`<div class="item"><div class="item-body"><h3>${escape(b.id)} · ${escape(b.name)}</h3><p>${escape(b.address)} · ${money(b.price*b.qty)}</p>${fmtStatus(b.status)}</div><div class="actions">${b.status==='Accepted'?btn('Dispatch','status-Out for delivery',b.id,''):''}${b.status==='Out for delivery'?btn('Complete','status-Completed',b.id,''):''}${btn('Details','booking',b.id)}</div></div>`).join('')}</div>`:empty('▤','No deliveries yet','Delivery reservations will appear here.','reservations','View reservations')}`
}
function earnings(){
 const all=db.bookings.filter(b=>b.pharmacyId===pharmacy()?.id),paid=all.filter(b=>b.status==='Completed'),sum=paid.reduce((s,b)=>s+b.qty*b.price,0);
 return `${title('Earnings','Simulated pharmacy sales summary')}<div class="grid"><div class="stat"><p class="muted small">Completed reservation value</p><div class="metric">${money(sum)}</div></div><div class="stat"><p class="muted small">Completed orders</p><div class="metric">${paid.length}</div></div><div class="stat"><p class="muted small">Pending orders</p><div class="metric">${all.filter(b=>b.status==='Pending').length}</div></div></div><div class="callout">These figures are calculated from completed demo reservations. No money is transferred.</div><div class="rows">${paid.length?paid.map(b=>`<div class="item"><b>${escape(b.id)} · ${escape(b.name)}</b><div>${money(b.qty*b.price)}</div></div>`).join(''):empty('▥','No earnings yet','Completed reservations will show here.','reservations','View reservations')}</div>`
}
function activity(){
 const events=db.activity.filter(a=>a.pharmacyId===pharmacy()?.id);
 return `${title('Activity','Your pharmacy activity log')}${events.length?`<div class="rows">${events.map(a=>`<div class="item"><p>${escape(a.text)}</p><span class="small muted">${date(a.created)}</span></div>`).join('')}</div>`:empty('◷','No activity yet','Updates will appear as you manage the pharmacy.','inventory','Go to inventory')}`
}
function pharmacyMeds(){
 const list=db.meds.filter(m=>m.pharmacyId===detail);
 return `${btn('← Map & pharmacies','map','','ghost')}${title(escape(pharm(detail)?.name||'Pharmacy'),'Browse available stock')}${list.length?`<div class="grid">${list.map(medicineRow).join('')}</div>`:empty('⌕','No available stock','This pharmacy has not added any medicines yet.','map','Browse pharmacies')}`
}
function content(){
 const u=getUser();
 if(page==='welcome')return landing();
 if(!u){if(!['login','signup','verify','forgot','reset'].includes(page))page='login';return auth()}
 if(['login','signup','verify','forgot','reset'].includes(page))page='home';
 if(mode==='customer'){
  if(page==='home')return customerHome();
  if(page==='search')return customerSearch();
  if(page==='medicine')return medicineDetail();
  if(page==='pharmacy-meds')return pharmacyMeds();
  if(page==='reservations')return customerBookings();
  if(page==='booking')return bookingDetail();
  if(page==='saved')return customerSaved();
  if(page==='wallet')return customerWallet();
  if(page==='map')return mapPage();
 }else{
  if(page==='home')return pharmacyHome();
  if(page==='reservations')return pharmacyBookings();
  if(page==='booking')return pharmacyBookingDetail();
  if(page==='inventory')return inventory();
  if(page==='add-medicine'||page==='edit-medicine')return medicineEditor();
  if(page==='deliveries')return deliveries();
  if(page==='earnings')return earnings();
  if(page==='activity')return activity();
 }
 if(page==='notifications')return notifications();
 if(page==='profile')return profile();
 return mode==='customer'?customerHome():pharmacyHome();
}
function render(){
 const el=document.getElementById('app');if(!el)return;
 try{el.innerHTML=shell(content())}catch(e){console.error(e);el.innerHTML='<main class="container"><h1>Something went wrong</h1><p>Try refreshing this page.</p><button onclick="location.reload()">Refresh</button></main>'}
}
const value=(f,n)=>String(new FormData(f).get(n)||'').trim();
function activityLog(pid,text){db.activity.unshift({id:uid('a'),pharmacyId:pid,text,created:stamp()})}
function notify(userId,text){if(userId)db.notices.unshift({id:uid('n'),userId,text,created:stamp(),read:false})}
function bookingStatus(id,status){
 const b=db.bookings.find(x=>x.id===id);
 if(!b)return;
 if(['Cancelled','Declined','Completed'].includes(b.status)){toast('This reservation is already closed.',true);return}
 if(['Cancelled','Declined'].includes(status))db.meds.find(m=>m.id===b.medicineId).stock+=b.qty;
 b.status=status;b.updated=stamp();
 notify(b.customerId,`Reservation ${b.id} is ${status.toLowerCase()}.`);
 activityLog(b.pharmacyId,`Reservation ${b.id} marked ${status}`);
 save();toast('Reservation updated');
}
document.addEventListener('click',e=>{
 const switchBtn=e.target.closest('[data-mode]');if(switchBtn){e.preventDefault();setMode(switchBtn.dataset.mode);return}
 const nav=e.target.closest('[data-nav]');if(nav){e.preventDefault();go(nav.dataset.nav);return}
 const f=e.target.closest('[data-filter]');if(f){filter=f.dataset.filter;render();return}
 const t=e.target.closest('[data-tab]');if(t){tab=t.dataset.tab;render();return}
 const b=e.target.closest('[data-action]');if(!b)return;
 e.preventDefault();const a=b.dataset.action,id=b.dataset.id||'';
 if(a==='welcome'){page='welcome';render();return}
 if(a==='mode-customer'||a==='mode-pharmacy'){setMode(a.split('-')[1]);go('login');return}
 if(a==='demo-customer'||a==='demo-pharmacy'){const role=a.split('-')[1];mode=role;db.sessions[role]=role==='customer'?'c-demo':'p-demo';page='home';save();go('home');return}
 if(a==='signout'){db.sessions[mode]=null;save();go('login');return}
 if(['home','search','reservations','saved','wallet','map','notifications','profile','inventory','deliveries','earnings','activity','add-medicine','login','signup','forgot'].includes(a)){go(a);return}
 if(a==='medicine'||a==='booking'||a==='pharmacy-meds'||a==='edit-medicine'){page=a;detail=id;window.scrollTo(0,0);render();return}
 if(a==='pharmacy-meds'){page=a;detail=id;render();return}
 if(a==='save'){const uid=getUser()?.id;if(!uid)return;const list=db.saved[uid]||[];db.saved[uid]=list.includes(id)?list.filter(x=>x!==id):[...list,id];save();toast('Saved list updated');return}
 if(a==='cancel-booking'){const x=db.bookings.find(x=>x.id===id);if(x?.customerId!==getUser()?.id)return;if(confirm('Cancel this reservation?'))bookingStatus(id,'Cancelled');return}
 if(a.startsWith('status-')){const x=db.bookings.find(x=>x.id===id);if(x?.pharmacyId!==pharmacy()?.id)return;bookingStatus(id,a.slice(7));return}
 if(a==='delete-medicine'){const m=med(id);if(m?.pharmacyId!==pharmacy()?.id)return;if(confirm('Remove this medicine from inventory?')){db.meds=db.meds.filter(x=>x.id!==id);save();toast('Medicine removed')}return}
 if(a==='mark-read'){db.notices.filter(n=>n.userId===getUser().id).forEach(n=>n.read=true);save();return}
 if(a==='reset-demo'){if(confirm('Reset demo data in this browser?')){db=initial();save();go('home')}return}
});
document.addEventListener('submit',e=>{
 const form=e.target;if(!(form instanceof HTMLFormElement))return;
 e.preventDefault();
 const type=form.id;
 try{
 if(type==='login-form'){
  const u=db.users.find(x=>x.role===mode&&x.email.toLowerCase()===value(form,'email').toLowerCase()&&x.password===value(form,'password'));
  if(!u)throw Error('Email or password is incorrect. Use the demo account or create a new one.');
  db.sessions[mode]=u.id;save();go('home');toast('Welcome back, '+u.name.split(' ')[0]);return
 }
 if(type==='signup-form'){
  const email=value(form,'email'),password=value(form,'password');
  if(db.users.some(u=>u.role===mode&&u.email.toLowerCase()===email.toLowerCase()))throw Error('This email is already registered. Please sign in.');
  if(password.length<6)throw Error('Password should contain at least 6 characters.');
  pending={role:mode,name:value(form,'name'),email,phone:value(form,'phone'),address:value(form,'address'),pharmacyName:value(form,'pharmacyName'),password};
  go('verify');return
 }
 if(type==='verify-form'){
  if(!pending||pending.role!==mode)throw Error('Start by completing the signup form.');
  if(value(form,'code')!=='123456')throw Error('Use demo verification code 123456.');
  const id=uid('u');const phid=mode==='pharmacy'?uid('p'):null;
  db.users.push({id,role:mode,name:pending.name,email:pending.email,password:pending.password,phone:pending.phone,address:pending.address,...(phid?{pharmacyId:phid}:{})});
  if(phid)db.pharmacies.push({id:phid,ownerId:id,name:pending.pharmacyName||pending.name+"'s Pharmacy",address:pending.address,phone:pending.phone,hours:'Set your hours',description:'',delivery:false,verified:false});
  db.sessions[mode]=id;pending=null;save();go('home');toast('Your new account is ready.');return
 }
 if(type==='forgot-form'){
  const email=value(form,'email');if(!db.users.some(u=>u.role===mode&&u.email.toLowerCase()===email.toLowerCase()))throw Error('No matching demo account found.');
  pending={role:mode,email};go('reset');return
 }
 if(type==='reset-form'){
  if(!pending||pending.role!==mode)throw Error('Start with your email.');
  if(value(form,'code')!=='123456')throw Error('Use demo reset code 123456.');
  const u=db.users.find(u=>u.role===mode&&u.email.toLowerCase()===pending.email.toLowerCase());if(!u)throw Error('Account not found.');
  u.password=value(form,'password');pending=null;save();go('login');toast('Password updated. Sign in to continue.');return
 }
 if(type==='search-form'){search=value(form,'query');render();return}
 if(type==='reserve-form'){
  const m=med(value(form,'medicineId')),u=getUser(),qty=Number(value(form,'qty'));
  if(!m||!u)throw Error('Select a valid medicine.');
  if(!Number.isInteger(qty)||qty<1||qty>m.stock)throw Error('Choose a valid quantity within available stock.');
  const method=value(form,'method'),address=value(form,'address');
  if(method==='Delivery'&&!address)throw Error('Enter a delivery address.');
  if(method==='Delivery'&&!pharm(m.pharmacyId)?.delivery)throw Error('Delivery is not offered by this pharmacy.');
  const id='MF-'+Math.floor(Date.now()/1000).toString().slice(-6)+Math.floor(Math.random()*10);
  db.bookings.unshift({id,customerId:u.id,pharmacyId:m.pharmacyId,medicineId:m.id,name:m.name,qty,price:m.price,method,payment:value(form,'payment'),status:'Pending',address,created:stamp(),updated:stamp()});
  m.stock-=qty;activityLog(m.pharmacyId,'New reservation '+id+' received');
  const owner=pharm(m.pharmacyId)?.ownerId;notify(owner,'New reservation '+id+' from '+u.name);
  save();go('reservations');toast('Reservation '+id+' created successfully.');return
 }
 if(type==='profile-form'){
  const u=getUser();if(!u)return;
  const email=value(form,'email');if(db.users.some(x=>x.role===mode&&x.id!==u.id&&x.email.toLowerCase()===email.toLowerCase()))throw Error('Another account already uses this email.');
  Object.assign(u,{name:value(form,'name'),email,phone:value(form,'phone'),address:value(form,'address')});save();toast('Profile updated');return
 }
 if(type==='password-form'){const p=value(form,'password');if(p.length<6)throw Error('Use at least 6 characters.');getUser().password=p;save();toast('Demo password updated');return}
 if(type==='pharmacy-profile-form'){
  const p=pharmacy();if(!p)return;Object.assign(p,{name:value(form,'name'),phone:value(form,'phone'),address:value(form,'address'),hours:value(form,'hours'),description:value(form,'description'),delivery:new FormData(form).has('delivery')});activityLog(p.id,'Pharmacy information updated');save();toast('Pharmacy profile updated');return
 }
 if(type==='medicine-form'){
  const p=pharmacy();if(!p)throw Error('Set up your pharmacy first.');
  const medId=value(form,'medicineId'),existing=db.meds.find(x=>x.id===medId);
  if(existing&&existing.pharmacyId!==p.id)throw Error('You cannot edit another pharmacy’s inventory.');
  const price=Number(value(form,'price')),stock=Number(value(form,'stock'));
  if(price<=0||!Number.isInteger(stock)||stock<0)throw Error('Enter a valid price and stock level.');
  const item={id:existing?.id||uid('m'),pharmacyId:p.id,name:value(form,'name'),strength:value(form,'strength'),category:value(form,'category'),price,stock};
  if(existing)Object.assign(existing,item);else db.meds.unshift(item);
  activityLog(p.id,'Inventory saved: '+item.name);save();go('inventory');toast('Medicine saved');return
 }
 }catch(ex){toast(ex.message||'Something went wrong.',true)}
});
window.addEventListener('storage',e=>{if(e.key===KEY){db=load();render()}});
window.addEventListener('hashchange',()=>{
 const parts=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
 if(['customer','pharmacy'].includes(parts[0])){mode=parts[0];page=parts[1]||'home';render()}
 else if(!parts.length){page='welcome';render()}
});
const route=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
if(['customer','pharmacy'].includes(route[0])){mode=route[0];page=route[1]||'home'}else page='welcome';
render();
})();
