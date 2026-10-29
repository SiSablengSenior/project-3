const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const STORE='sisableng_ops_v1';
const types=[
 ['verify','✓','Verifikasi berhasil','Submit nopol dan jenis bahan bakar'],
 ['reset_person','↻','Reset data nopol (Perorangan)','Reset data biasa akun perorangan'],
 ['reset_hang','◉','Reset nopol gantung (Perorangan)','Perlu unggah foto STNK'],
 ['reset_company','▣','Reset data nopol (Perusahaan)','Perlu unggah foto STNK'],
 ['unblock','🔓','Buka blokir permanen nopol','Pilih alasan/data dari sistem pusat'],
 ['block','⛔','Blokir permanen setiap nopol','Pilih alasan/data dari sistem pusat'],
 ['delete_person','♙','Hapus akun Perorangan','Submit identitas akun'],
 ['delete_company','▤','Hapus akun Perusahaan','Submit identitas akun']
];
const load=()=>{try{return JSON.parse(localStorage.getItem(STORE))||{user:'SiSablengSenior',password:'demo12345',apiKey:'',apiUrl:'',logs:[]}}catch{return {user:'SiSablengSenior',password:'demo12345',apiKey:'',apiUrl:'',logs:[]}}};
let db=load(),current='verify';
function save(){localStorage.setItem(STORE,JSON.stringify(db))}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function dateParts(d=new Date()){return {day:d.getDate(),month:d.getMonth()+1,year:d.getFullYear()}}
function updateClock(){const d=new Date();$('#clock').textContent=d.toLocaleTimeString('id-ID',{hour12:false});$('#dateLine').textContent=d.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});$('#summaryDate').textContent=d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}
setInterval(updateClock,1000);updateClock();
$('#loginForm').addEventListener('submit',e=>{e.preventDefault();if($('#username').value.trim()===db.user&&$('#password').value===db.password){$('#loginError').textContent='';$('#loginScreen').classList.add('hidden');$('#app').classList.remove('hidden');$('#welcomeName').textContent=db.user;$('#welcomeModal').classList.remove('hidden');render()}else $('#loginError').textContent='Username atau password tidak sesuai.'});
$('#startBtn').onclick=()=>$('#welcomeModal').classList.add('hidden');
$('#logoutBtn').onclick=()=>{ $('#app').classList.add('hidden');$('#loginScreen').classList.remove('hidden');$('#password').value=''};
function navigate(page){$$('.page').forEach(x=>x.classList.add('hidden'));$('#'+page+'Page').classList.remove('hidden');$$('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.page===page));$('#pageTitle').textContent={dashboard:'Dashboard',control:'Pusat Control',settings:'Pengaturan'}[page];if(page==='control')renderLogs();if(page==='settings')fillSettings()}
$$('.nav-item').forEach(b=>b.onclick=()=>navigate(b.dataset.page));$$('[data-goto]').forEach(b=>b.onclick=()=>navigate(b.dataset.goto));
function render(){ $('#headerUser').textContent=db.user;$('#accountName').textContent=db.user;renderStats();renderActions();renderLogs();apiStatus(); }
function renderStats(){const now=new Date(),p=dateParts(now),logs=db.logs;const today=logs.filter(x=>x.day===p.day&&x.month===p.month&&x.year===p.year).length,month=logs.filter(x=>x.month===p.month&&x.year===p.year).length,year=logs.filter(x=>x.year===p.year).length;$('#todayCount').textContent=today;$('#monthCount').textContent=month;$('#yearCount').textContent=year;
$('#activityGrid').innerHTML=types.map(t=>{let n=logs.filter(x=>x.type===t[0]).length;return `<div class="activity-card"><div class="symbol">${t[1]}</div><b>${n}</b><span>${t[2]}</span></div>`}).join('');
$('#recentRows').innerHTML=logs.slice(0,5).map(x=>`<tr><td>${esc(x.time)}</td><td>${esc(x.label)}</td><td>${esc(x.subject)}</td><td><span class="pill pending">${esc(x.status)}</span></td></tr>`).join('')||'<tr><td colspan="4">Belum ada aktivitas.</td></tr>'}
function renderActions(){$('#actionGrid').innerHTML=types.map(t=>`<button class="action-card ${current===t[0]?'active':''}" data-type="${t[0]}"><span class="symbol">${t[1]}</span><b>${t[2]}</b><small>${t[3]}</small></button>`).join('');$$('[data-type]').forEach(b=>b.onclick=()=>selectType(b.dataset.type))}
function selectType(type){current=type;renderActions();const t=types.find(x=>x[0]===type);$('#operationType').value=type;$('#formTitle').textContent=t[2];$('#formFeedback').textContent='';let fields='';
if(['verify','reset_person'].includes(type))fields=`<label>Nomor Polisi (Nopol)<input name="subject" required placeholder="Contoh: B 1234 KZ"></label><label>Bahan bakar<select name="fuel"><option value="Pertalite">Pertalite</option><option value="Biosolar">Biosolar</option></select></label>`;
else if(['reset_hang','reset_company'].includes(type))fields=`<label>Nomor Polisi (Nopol)<input name="subject" required placeholder="Contoh: B 1234 KZ"></label><label>Foto STNK<input name="stnk" type="file" accept="image/*,.pdf" required></label>`;
else if(['unblock','block'].includes(type))fields=`<label>Nomor Polisi (Nopol)<input name="subject" required placeholder="Contoh: B 1234 KZ"></label><label>Data/alasan sistem pusat<select name="reason"><option value="">Pilih data/alasan</option><option>Permohonan koreksi data</option><option>Dokumen telah diverifikasi</option><option>Keputusan administrator berwenang</option></select></label>`;
else fields=`<label>Username / ID akun<input name="subject" required placeholder="Masukkan identitas akun"></label><label>Jenis akun<select name="fuel"><option>Perorangan</option><option>Perusahaan</option></select></label>`;
$('#dynamicFields').innerHTML=fields}
$('#operationForm').addEventListener('submit',e=>{e.preventDefault();const form=new FormData(e.currentTarget),type=$('#operationType').value,subject=String(form.get('subject')||'').trim().toUpperCase();if(!subject)return;const file=form.get('stnk');if(file&&file.size>5*1024*1024){$('#formFeedback').textContent='Ukuran file maksimal 5 MB.';return}const now=new Date(),p=dateParts(now);db.logs.unshift({id:Date.now(),type,label:types.find(x=>x[0]===type)[2],subject,fuel:form.get('fuel')||'-',day:p.day,month:p.month,year:p.year,time:now.toLocaleString('id-ID'),status:'Menunggu integrasi'});save();$('#formFeedback').textContent='Permintaan tercatat di log lokal. Belum dikirim ke sistem pusat.';e.currentTarget.reset();renderStats();renderLogs()});
function renderLogs(){const q=($('#tableSearch')?.value||'').toLowerCase();const rows=db.logs.filter(x=>x.subject.toLowerCase().includes(q));$('#allRows').innerHTML=rows.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.subject)}</td><td>${esc(x.fuel)}</td><td>${x.day}/${x.month}/${x.year}</td><td>${esc(x.label)}</td><td><span class="pill pending">${esc(x.status)}</span></td></tr>`).join('')||'<tr><td colspan="6">Belum ada data input.</td></tr>'}
$('#tableSearch').addEventListener('input',renderLogs);
function fillSettings(){$('#profileUsername').value=db.user;$('#apiKey').value=db.apiKey;$('#apiUrl').value=db.apiUrl}
$('#profileForm').onsubmit=e=>{e.preventDefault();db.user=$('#profileUsername').value.trim();if($('#newPassword').value)db.password=$('#newPassword').value;save();$('#profileFeedback').textContent='Profil tersimpan pada browser ini.';render()};
$('#apiForm').onsubmit=e=>{e.preventDefault();db.apiKey=$('#apiKey').value.trim();db.apiUrl=$('#apiUrl').value.trim();save();apiStatus();$('#apiFeedback').textContent='Konfigurasi tersimpan lokal. Status belum diuji.'};
$('#testApi').onclick=async()=>{const url=$('#apiUrl').value.trim();if(!url){$('#apiFeedback').textContent='Masukkan URL endpoint terlebih dahulu.';return}try{const r=await fetch(url,{method:'GET',mode:'cors'});$('#apiFeedback').textContent=`Endpoint merespons HTTP ${r.status}. Ini belum membuktikan otorisasi API.`}catch(err){$('#apiFeedback').textContent='Tidak dapat menjangkau endpoint. Periksa URL, CORS, HTTPS, dan status server.'}};
function apiStatus(){const ok=Boolean(db.apiUrl&&db.apiKey);$('#apiPill').textContent=ok?'● API DIKONFIGURASI':'● MODE DEMO';$('#apiPill').style.color=ok?'#087b48':'#946300';$('#apiLed').style.background=ok?'#13a36b':'#e4a51d';$('#apiStatusText').textContent=ok?'Kredensial tersedia — belum diverifikasi':'Belum dikonfigurasi';$('#apiUrlText').textContent=db.apiUrl||'Tambahkan endpoint API di pengaturan.';$('#sideApiDot').style.background=ok?'#13a36b':'#e4a51d';$('#sideApiText').textContent=ok?'API dikonfigurasi':'API belum dikonfigurasi'}
selectType('verify');
