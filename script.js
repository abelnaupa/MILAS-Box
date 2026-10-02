// Remplace con la URL desplegada como Ejecutar como: Yo / Tiene acceso: Cualquier persona
const URL_WEB_APP = 'TU_URL_DE_APPS_SCRIPT_AQUI';

document.addEventListener('DOMContentLoaded', () => {
  cargarDatosGoogleSheet();
});

async function cargarDatosGoogleSheet() {
  try {
    const respuesta = await fetch(URL_WEB_APP);
    const datos = await respuesta.json();

    console.log("Datos recibidos del Sheet:", datos);

    if (datos.profesores) renderizarProfesores(datos.profesores);
    if (datos.planes) renderizarPlanes(datos.planes);
    if (datos.horarios) renderizarHorarios(datos.horarios);

  } catch (error) {
    console.error("Error al cargar datos desde Google Sheets:", error);
  }
}

// 1. PROFESORES
function renderizarProfesores(profesores) {
  const contenedor = document.getElementById('lista-profesores');
  if (!contenedor) return;
  contenedor.innerHTML = '';

  profesores.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card-profesor';
    card.style.border = "1px solid #ccc"; // Estilo básico para verificar render
    card.style.padding = "10px";

    card.innerHTML = `
      <h3>${p.nombre || p.Nombre || 'Sin nombre'}</h3>
      <p><strong>${p.cargo || p.Cargo || ''}</strong></p>
      <p>${p.descripcion || p.Descripcion || ''}</p>
    `;
    contenedor.appendChild(card);
  });
}

// 2. PLANES
function renderizarPlanes(planes) {
  const contenedor = document.getElementById('lista-planes');
  if (!contenedor) return;
  contenedor.innerHTML = '';

  planes.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card-plan';
    card.style.border = "1px solid #ccc";
    card.style.padding = "15px";

    // Convertimos la lista de beneficios si vienen separados por coma
    let beneficiosHTML = '';
    const items = (p.beneficios || p.Beneficios || '').split(',');
    items.forEach(item => {
      if (item.trim()) beneficiosHTML += `<li>✓ ${item.trim()}</li>`;
    });

    card.innerHTML = `
      <h3>${p.nombre || p.Nombre || 'Plan'}</h3>
      <h4>${p.precio || p.Precio || ''}</h4>
      <ul style="list-style:none; padding:0;">${beneficiosHTML}</ul>
    `;
    contenedor.appendChild(card);
  });
}

// 3. HORARIOS
function renderizarHorarios(horarios) {
  const cuerpoTabla = document.getElementById('cuerpo-horarios');
  if (!cuerpoTabla) return;
  cuerpoTabla.innerHTML = '';

  horarios.forEach(h => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td><strong>${h.hora || h.Hora || ''}</strong></td>
      <td>${h.lunes || h.Lunes || '-'}</td>
      <td>${h.martes || h.Martes || '-'}</td>
      <td>${h.miercoles || h.Miercoles || '-'}</td>
      <td>${h.jueves || h.Jueves || '-'}</td>
      <td>${h.viernes || h.Viernes || '-'}</td>
      <td>${h.sabado || h.Sabado || '-'}</td>
      <td>${h.domingo || h.Domingo || '-'}</td>
    `;
    cuerpoTabla.appendChild(fila);
  });
}
