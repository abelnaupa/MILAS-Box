// ==========================================
// CONFIGURACIÓN DE GOOGLE SHEETS
// ==========================================
const SPREADSHEET_ID = "1aphxXLYW3hP1OK_H2J8EYLZQ6E8K3nZ3AL4XJ76jX4o";

// DATOS INICIALES DE RESPALDO (SE MUESTRAN AL INSTANTE)
const DATOS_INICIALES = {
  profesores: [
    { nombre: "MATÍAS LAGOS", rol: "HEAD COACH · BOXEO", desc: "Técnica, guardia y trabajo de saco con enfoque en rendimiento deportivo.", img: "profesor1.jpg" },
    { nombre: "CAMILA SOTO", rol: "KINESIÓLOGA · MOVIMIENTO", desc: "Evaluación kinésica, movilidad articular y prevención de lesiones.", img: "profesor2.jpg" },
    { nombre: "DIEGO FUENTES", rol: "PREPARADOR FÍSICO · FUERZA", desc: "Fuerza funcional y acondicionamiento de alta intensidad.", img: "profesor3.jpg" }
  ],
  planes: [
    { nombre: "MENSUAL", precio: "$39.990", periodo: "/mes", destacado: false, beneficios: "Clases de Boxeo incluidas, Acceso a Sala de Musculación, Modalidad Full Acceso" },
    { nombre: "TRIMESTRAL", precio: "$84.990", periodo: "/3 meses", destacado: false, beneficios: "Clases de Boxeo incluidas, Acceso a Sala de Musculación, Modalidad Full Acceso" },
    { nombre: "SEMESTRAL", precio: "$139.990", periodo: "/6 meses", destacado: true, badge: "MÁS RECOMENDADO", beneficios: "Clases de Boxeo incluidas, Acceso a Sala de Musculación, Modalidad Full Acceso, ★ Incluye Evaluación Kinésica" }
  ],
  horarios: [
    { hora: "08:00 - 09:30", lunes: "Boxeo", martes: "Movimiento", miercoles: "Boxeo", jueves: "Movimiento", viernes: "Boxeo", sabado: "-", domingo: "-" },
    { hora: "18:00 - 19:30", lunes: "Boxeo", martes: "Fuerza", miercoles: "Boxeo", jueves: "Fuerza", viernes: "Boxeo", sabado: "Open Gym", domingo: "-" }
  ]
};

function renderProfesores(lista) {
  const contenedor = document.getElementById("lista-profesores");
  if (!contenedor) return;

  contenedor.innerHTML = lista.map(p => `
    <div class="card-profesor">
      <img src="${p.imagen || p.Imagen || p.img || 'profesor1.jpg'}" alt="${p.nombre || p.Nombre}">
      <div class="card-profesor-info">
        <span class="card-profesor-role">${p.rol || p.Rol || p.especialidad || ''}</span>
        <h3 class="card-profesor-nombre">${p.nombre || p.Nombre}</h3>
        <p class="card-profesor-desc">${p.descripcion || p.Descripcion || p.desc || ''}</p>
      </div>
    </div>
  `).join("");
}

function renderPlanes(lista) {
  const contenedor = document.getElementById("lista-planes");
  if (!contenedor) return;

  contenedor.innerHTML = lista.map(plan => {
    const nombre = plan.nombre || plan.Nombre || "";
    const precio = plan.precio || plan.Precio || "";
    const periodo = plan.periodo || plan.Periodo || "";
    const badge = plan.badge || plan.Badge || "MÁS RECOMENDADO";
    const dest = plan.destacado || plan.Destacado;
    const esDestacado = dest === true || dest === "true" || nombre.toUpperCase() === "SEMESTRAL";

    const beneficiosRaw = plan.beneficios || plan.Beneficios || "";
    const beneficios = Array.isArray(beneficiosRaw) 
      ? beneficiosRaw 
      : beneficiosRaw.split(",").map(b => b.trim());

    return `
      <div class="tarjeta-plan ${esDestacado ? 'destacado' : ''}">
        ${esDestacado ? `<div class="badge-pop">${badge}</div>` : ''}
        <div>
          <h3 class="nombre-plan">${nombre}</h3>
          <div class="precio-plan">${precio} <span>${periodo}</span></div>
          <ul class="lista-beneficios">
            ${beneficios.map(b => `
              <li class="${b.includes('★') \vert{}\vert{} b.includes('Incluye') ? 'destacado-texto' : ''}">${b}</li>
            `).join('')}
          </ul>
        </div>
        <a href="https://wa.me/569XXXXXXXX?text=Hola%20MILAS,%20quiero%20el%20plan%20${encodeURIComponent(nombre)}" 
           target="_blank" 
           class="btn-plan">
           QUIERO ESTE PLAN
        </a>
      </div>
    `;
  }).join('');
}

function renderHorarios(lista) {
  const cuerpo = document.getElementById("cuerpo-horarios");
  if (!cuerpo) return;

  cuerpo.innerHTML = lista.map(h => `
    <tr>
      <td><strong>${h.hora || h.Hora || ''}</strong></td>
      <td>${h.lunes || h.Lunes || ''}</td>
      <td>${h.martes || h.Martes || ''}</td>
      <td>${h.miercoles || h.Miercoles || h.miércoles || ''}</td>
      <td>${h.jueves || h.Jueves || ''}</td>
      <td>${h.viernes || h.Viernes || ''}</td>
      <td>${h.sabado || h.Sabado || h.sábado || ''}</td>
      <td>${h.domingo || h.Domingo || ''}</td>
    </tr>
  `).join("");
}

// Carga inmediata
document.addEventListener("DOMContentLoaded", () => {
  renderProfesores(DATOS_INICIALES.profesores);
  renderPlanes(DATOS_INICIALES.planes);
  renderHorarios(DATOS_INICIALES.horarios);
});
