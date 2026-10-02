// ==========================================
// CONFIGURACIÓN DE GOOGLE SHEETS
// ==========================================
const SPREADSHEET_ID = "1aphxXLYW3hP1OK_H2J8EYLZQ6E8K3nZ3AL4XJ76jX4o";

async function sheetFetch(nombrePestana) {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(nombrePestana)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error leyendo pestaña "${nombrePestana}": ${res.status}`);

  const buffer = await res.arrayBuffer();
  const textoCSV = new TextDecoder("utf-8").decode(buffer);
  return parsearCSV(textoCSV);
}

function parsearCSV(csv) {
  const lineas = csv.split(/\r?\n/).filter(l => l.trim() !== "");
  if (lineas.length === 0) return [];

  const limpiar = celda => celda ? celda.replace(/^"(.*)"$/, "$1").replace(/""/g, '"').trim() : "";
  const encabezados = lineas[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(limpiar);

  return lineas.slice(1).map(linea => {
    const valores = linea.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(limpiar);
    const objeto = {};
    encabezados.forEach((h, i) => {
      if (h) objeto[h] = valores[i] || "";
    });
    return objeto;
  });
}

function getProp(obj, keyName) {
  if (!obj) return "";
  const foundKey = Object.keys(obj).find(k => k.trim().toLowerCase() === keyName.toLowerCase());
  return foundKey ? obj[foundKey] : "";
}

// ==========================================
// DATOS POR DEFECTO (GARANTIZAN QUE SE VEA SIEMPRE)
// ==========================================
const DATOS_DEFECTO = {
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

// ==========================================
// RENDERIZADO
// ==========================================
function renderProfesores(lista) {
  const contenedor = document.getElementById("lista-profesores");
  if (!contenedor) return;

  contenedor.innerHTML = lista.map(p => {
    const nombre = getProp(p, "nombre") || p.nombre || 'Profesor';
    const rol = getProp(p, "rol") || getProp(p, "especialidad") || p.rol || '';
    const desc = getProp(p, "descripcion") || getProp(p, "desc") || p.desc || '';
    const img = getProp(p, "imagen") || getProp(p, "foto") || p.img || 'profesor1.jpg';

    return `
      <div class="card-profesor">
        ${img ? `<img src="${img}" alt="${nombre}">` : ''}
        <div class="card-profesor-info">
          <span class="card-profesor-role">${rol}</span>
          <h3 class="card-profesor-nombre">${nombre}</h3>
          <p class="card-profesor-desc">${desc}</p>
        </div>
      </div>
    `;
  }).join("");
}

function renderPlanes(lista) {
  const contenedor = document.getElementById("lista-planes");
  if (!contenedor) return;

  contenedor.innerHTML = lista.map(plan => {
    const nombre = getProp(plan, "nombre") || plan.nombre || "";
    const precio = getProp(plan, "precio") || plan.precio || "";
    const periodo = getProp(plan, "periodo") || plan.periodo || "";
    const badge = getProp(plan, "badge") || plan.badge || "MÁS RECOMENDADO";
    const destVal = getProp(plan, "destacado") ?? plan.destacado;
    const esDestacado = destVal === true || destVal.toString().toLowerCase() === "true" || nombre.toUpperCase() === "SEMESTRAL";

    const rawBen = getProp(plan, "beneficios") || plan.beneficios || "";
    const listaBeneficios = Array.isArray(rawBen) 
      ? rawBen 
      : rawBen.split(/,|\n/).map(b => b.trim()).filter(b => b !== "");

    return `
      <div class="tarjeta-plan ${esDestacado ? 'destacado' : ''}">
        ${esDestacado ? `<div class="badge-pop">${badge}</div>` : ''}
        <div>
          <h3 class="nombre-plan">${nombre}</h3>
          <div class="precio-plan">${precio} <span>${periodo}</span></div>
          <ul class="lista-beneficios">
            ${listaBeneficios.map(b => `
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
      <td><strong>${getProp(h, 'hora') || h.hora || ''}</strong></td>
      <td>${getProp(h, 'lunes') || h.lunes || ''}</td>
      <td>${getProp(h, 'martes') || h.martes || ''}</td>
      <td>${getProp(h, 'miercoles') || h.miercoles || ''}</td>
      <td>${getProp(h, 'jueves') || h.jueves || ''}</td>
      <td>${getProp(h, 'viernes') || h.viernes || ''}</td>
      <td>${getProp(h, 'sabado') || h.sabado || ''}</td>
      <td>${getProp(h, 'domingo') || h.domingo || ''}</td>
    </tr>
  `).join("");
}

// ==========================================
// INICIALIZACIÓN Y LECTURA
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Mostrar todo de inmediato con datos base
  renderProfesores(DATOS_DEFECTO.profesores);
  renderPlanes(DATOS_DEFECTO.planes);
  renderHorarios(DATOS_DEFECTO.horarios);

  // 2. Intentar actualizar en segundo plano con Google Sheets
  try {
    const profs = await sheetFetch("Profesores");
    if (profs && profs.length > 0) renderProfesores(profs);
  } catch (e) { console.log("Profesores usando datos locales"); }

  try {
    const planes = await sheetFetch("Planes");
    if (planes && planes.length > 0) renderPlanes(planes);
  } catch (e) { console.log("Planes usando datos locales"); }

  try {
    const horarios = await sheetFetch("Horarios");
    if (horarios && horarios.length > 0) renderHorarios(horarios);
  } catch (e) { console.log("Horarios usando datos locales"); }
});
