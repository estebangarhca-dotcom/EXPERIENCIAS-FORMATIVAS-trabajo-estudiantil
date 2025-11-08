
// Datos iniciales de ejemplo (simulan perfiles de mentores)
const mentors = [
  {
    id: 1,
    name: 'Ana Paredes',
    career: 'Ingeniería de Software',
    specialty: 'Desarrollo web, React',
    bio: 'Mentora con 4 años de experiencia en proyectos fullstack.',
    rating: 4.8,
    ratingsCount: 28,
    photo: 'IMG/ana.jpg'
  },
  {
    id: 2,
    name: 'Carlos Ruiz',
    career: 'Ciencias de la Computación',
    specialty: 'Algoritmos y estructuras de datos',
    bio: 'Preparación para cursos básicos y competencias.',
    rating: 4.6,
    ratingsCount: 21,
    photo: 'IMG/carlos.jpg'
  },
  {
    id: 3,
    name: 'Lucía Gómez',
    career: 'Diseño Gráfico',
    specialty: 'UX/UI, Figma',
    bio: 'Acompaño en portafolio y entrevistas de trabajo.',
    rating: 4.9,
    ratingsCount: 31,
    photo: 'IMG/lucia.jpg'
  },
  {
    id: 4,
    name: 'Diego Morales',
    career: 'Ingeniería de Datos',
    specialty: 'Python, ML básico',
    bio: 'Introducción a machine learning y pipelines de datos.',
    rating: 4.7,
    ratingsCount: 15,
    photo: 'IMG/diego.jpg'
  }
];

// Cargar especialidades en filtro
const filterSelect = document.getElementById('filterSelect');
const selectMentor = document.getElementById('selectMentor');
const ratingMentor = document.getElementById('ratingMentor');
function populateFilters(){
    const specialties = Array.from(new Set(mentors.map(m=>m.specialty)));
    specialties.forEach(s=>{const opt=document.createElement('option');opt.value=s;opt.textContent=s;filterSelect.appendChild(opt)});
    mentors.forEach(m=>{const opt=document.createElement('option');opt.value=m.id;opt.textContent=m.name+' — '+m.specialty;selectMentor.appendChild(opt);const opt2=opt.cloneNode(true);ratingMentor.appendChild(opt2)})
}

// Render de cards
function renderMentors(list){
    const container = document.getElementById('mentorsList');container.innerHTML='';
    list.forEach(m=>{
    const el = document.createElement('article');el.className='mentor card';el.setAttribute('tabindex','0');
    el.innerHTML = `
        <div class="avatar"><img src="${m.photo}" alt="Foto de ${m.name}"></div>
        <div class="mentor-meta">
        <div class="meta-top">
            <div>
            <strong>${m.name}</strong>
            <div style="font-size:13px;color:var(--muted)">${m.career}</div>
            </div>
            <div style="text-align:right">
            <div style="font-weight:700">${m.rating.toFixed(1)} ★</div>
            <div style="font-size:13px;color:var(--muted)">${m.ratingsCount} valoraciones</div>
            </div>
        </div>
        <div class="tags">${m.specialty}</div>
        <p style="margin-top:8px;color:var(--muted);font-size:14px">${m.bio}</p>
        <div style="margin-top:8px">
            <button class="btn" data-action="view" data-id="${m.id}">Ver perfil</button>
            <button class="ghost" data-action="request" data-id="${m.id}">Solicitar</button>
        </div>
        </div>
    `;
    container.appendChild(el);
    })
}

// Búsqueda y filtrado
document.getElementById('searchInput').addEventListener('input', (e)=>{
    const q = e.target.value.toLowerCase();
    const f = filterSelect.value;
    const filtered = mentors.filter(m=>{
    const okQ = !q || (m.name+m.specialty+m.career+m.bio).toLowerCase().includes(q);
    const okF = !f || m.specialty===f;
    return okQ && okF;
    });
    renderMentors(filtered);
});
filterSelect.addEventListener('change', ()=>document.getElementById('searchInput').dispatchEvent(new Event('input')));

// Eventos de botones en lista de mentores
document.addEventListener('click', (e)=>{
    const btn = e.target.closest('button'); if(!btn) return;
    const action = btn.dataset.action; const id = btn.dataset.id && Number(btn.dataset.id);
    if(action==='view') openProfile(id);
    if(action==='request'){ document.getElementById('selectMentor').value = id; document.getElementById('sessionDate').focus(); window.scrollTo({top:0,behavior:'smooth'}) }
});

// Modal para perfil
function openProfile(id){
    const m = mentors.find(x=>x.id===id); if(!m) return;
    const tpl = document.getElementById('modalTpl'); const node = tpl.content.cloneNode(true);
    node.querySelector('#modalContent').innerHTML = `
    <h2>${m.name}</h2>
    <div style="color:var(--muted)">${m.career} — ${m.specialty}</div>
    <p style="margin-top:10px;color:var(--muted)">${m.bio}</p>
    <div style="margin-top:12px"><button class="btn" id="modalRequest" data-id="${m.id}">Solicitar mentoría</button></div>
    `;
    document.body.appendChild(node);
    document.getElementById('closeModal').addEventListener('click', ()=>{document.querySelector('.modal-backdrop').remove()});
    document.getElementById('modalRequest').addEventListener('click',(ev)=>{document.getElementById('selectMentor').value = ev.target.dataset.id; document.querySelector('.modal-backdrop').remove(); window.scrollTo({top:0,behavior:'smooth'})});
}

// Solicitud: crea una "solicitud" que el mentor puede aceptar. Aquí simulamos aceptación automática al guardar.
document.getElementById('btn-request').addEventListener('click', ()=>{
    const mentorId = Number(selectMentor.value); const dt = document.getElementById('sessionDate').value; if(!mentorId || !dt){alert('Selecciona un mentor y fecha/hora.');return}
    const m = mentors.find(x=>x.id===mentorId);
    const session = {id:Date.now(), mentorId, mentorName:m.name, datetime:dt};
    // Guardamos en localStorage para simular persistencia
    const sessions = JSON.parse(localStorage.getItem('sessions')||'[]'); sessions.push(session); localStorage.setItem('sessions',JSON.stringify(sessions));
    renderUpcoming();
    alert('Solicitud enviada. La sesión aparece en tu agenda local. El mentor debe confirmar para crear el evento en Google Calendar.');
});

// Render de próximas sesiones
function renderUpcoming(){
    const ul = document.getElementById('upcoming'); ul.innerHTML='';
    const sessions = JSON.parse(localStorage.getItem('sessions')||'[]');
    sessions.forEach(s=>{
    const li = document.createElement('li');
    const dt = new Date(s.datetime);
    const formatted = dt.toLocaleString();
    li.innerHTML = `<strong>${s.mentorName}</strong> — ${formatted} <button class="ghost" data-action="calendar" data-id="${s.id}">Agregar a Google Calendar</button>`;
    ul.appendChild(li);
    })
}

// Generar link a Google Calendar para crear evento (funciona vía URL)
document.addEventListener('click',(e)=>{
    const btn = e.target.closest('button'); if(!btn) return; if(btn.dataset.action!=='calendar') return;
    const id = Number(btn.dataset.id); const sessions = JSON.parse(localStorage.getItem('sessions')||'[]'); const s = sessions.find(x=>x.id===id);
    if(!s) return; const dtStart = new Date(s.datetime); const dtEnd = new Date(dtStart.getTime()+60*60*1000);
    function toCal(t){return t.toISOString().replace(/-|:|\.\d+/g,'')}
    const dates = toCal(dtStart) + '/' + toCal(dtEnd);
    // Prellenar título y detalles
    const title = encodeURIComponent('Sesión de mentoría con '+s.mentorName);
    const details = encodeURIComponent('Sesión agendada desde el prototipo de Mentoría entre Estudiantes.');
    const url = `https://calendar.google.com/calendar/r/eventedit?text=${title}&details=${details}&dates=${dates}`;
    window.open(url,'_blank');
});

// Valoraciones
let currentRating = 0;
function renderStars(){
    const starsDiv = document.getElementById('ratingStars'); starsDiv.innerHTML='';
    for(let i=1;i<=5;i++){
    const span = document.createElement('span'); span.className='star'; span.setAttribute('role','radio'); span.setAttribute('aria-checked','false'); span.tabIndex=0; span.innerHTML='★'; span.dataset.value=i;
    span.addEventListener('click', ()=>{currentRating = i; updateStarDisplay();});
    span.addEventListener('keydown', (ev)=>{ if(ev.key==='Enter' || ev.key===' ') {currentRating=i; updateStarDisplay(); ev.preventDefault()} });
    starsDiv.appendChild(span);
    }
}
function updateStarDisplay(){
    document.querySelectorAll('.star').forEach(s=>{s.classList.toggle('selected', Number(s.dataset.value) <= currentRating); s.setAttribute('aria-checked', Number(s.dataset.value) <= currentRating)});
}

document.getElementById('btn-submit-rating').addEventListener('click', ()=>{
    const mentorId = Number(document.getElementById('ratingMentor').value); const comment = document.getElementById('ratingComment').value;
    if(!mentorId || currentRating===0){alert('Selecciona un mentor y una puntuación.');return}
    // Simulamos almacenar la valoración
    const key = 'ratings_'+mentorId; const arr = JSON.parse(localStorage.getItem(key)||'[]'); arr.push({score:currentRating,comment,at:new Date().toISOString()}); localStorage.setItem(key,JSON.stringify(arr));
    alert('Gracias por tu valoración.'); document.getElementById('ratingComment').value=''; currentRating=0; updateStarDisplay();
});

// Placeholder: botón iniciar con Google
document.getElementById('btn-google').addEventListener('click', ()=>{
    alert('Este prototipo muestra un "Iniciar con Google" simulado. Para integración real, configurar OAuth2 en backend y usar la API de Google Identity.');
});

// Crear perfil (simulado)
document.getElementById('btn-create-profile').addEventListener('click', ()=>{
    openProfileForm();
});

function openProfileForm(){
    const tpl = document.getElementById('modalTpl'); const node = tpl.content.cloneNode(true);
    node.querySelector('#modalContent').innerHTML = `
    <h2>Crear perfil</h2>
    <label>Nombre completo</label>
    <input type="text" id="pf-name" />
    <label>Carrera</label>
    <input type="text" id="pf-career" />
    <label>Especialidad (ej: Desarrollo web)</label>
    <input type="text" id="pf-specialty" />
    <label>Biografía</label>
    <textarea id="pf-bio"></textarea>
    <div style="margin-top:10px"><button class="btn" id="pf-save">Guardar perfil</button></div>
    `;
    document.body.appendChild(node);
    document.getElementById('closeModal').addEventListener('click', ()=>{document.querySelector('.modal-backdrop').remove()});
    document.getElementById('pf-save').addEventListener('click', ()=>{
    const name = document.getElementById('pf-name').value || 'Sin nombre';
    const career = document.getElementById('pf-career').value || 'Por definir';
    const specialty = document.getElementById('pf-specialty').value || 'General';
    const bio = document.getElementById('pf-bio').value || '';
    const id = Date.now();
    const newMentor = {id,name,career,specialty,bio,rating:5.0,ratingsCount:0};
    mentors.push(newMentor); localStorage.setItem('mentors',JSON.stringify(mentors));
    document.querySelector('.modal-backdrop').remove(); populateFilters(); renderMentors(mentors);
    alert('Perfil creado (simulado). Ahora aparece en la lista de mentores.');
    });
}

// Inicialización
(function init(){
    const saved = JSON.parse(localStorage.getItem('mentors')||'null'); if(saved && Array.isArray(saved) && saved.length) { /* usamos mentores guardados si existen */ }
    populateFilters(); renderMentors(mentors); renderUpcoming(); renderStars();
})();


