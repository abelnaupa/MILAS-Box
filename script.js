// ==========================================
// CONFIGURACIÓN DE GOOGLE SHEETS (vía opensheet.elk.wtf)
// No requiere API key: opensheet solo lee hojas públicas ("Cualquiera con el
// enlace, Lector") y las devuelve como JSON. No es una API oficial de Google,
// es un servicio gratuito de terceros que hace de intermediario.
// ==========================================
// ==========================================
// CONFIGURACIÓN DE GOOGLE SHEETS (vía opensheet.elk.sh)
// ==========================================
const SPREADSHEET_ID = "1aphxXLYW3hP1OK_H2J8EYLZQ6E8K3nZ3AL4XJ76jX4o";
const BASE_URL = `https://opensheet.elk.sh/${SPREADSHEET_ID}`;

// Helper genérico: trae una pestaña completa como array de objetos
async function sheetFetch(nombrePestana) {
  const url = `${BASE_URL}/${encodeURIComponent(nombrePestana)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error leyendo la pestaña "${nombrePestana}": ${res.status}`);
  return res.json();
}

// ==========================================
// 1. DATOS GENERALES (hero, dirección, redes)
// Pestaña "General" con columnas: campo | valor
// ==========================================
async function cargarGeneral() {
  const filas = await sheetFetch("General");

  // Convierte [{campo:"tituloPrincipal", valor:"..."}] en {tituloPrincipal: "..."}
  const general = {};
  filas.forEach(fila => { general[fila.campo] = fila.valor; });

  document.getElementById("hero-titulo").textContent = general.tituloPrincipal || "";
  document.getElementById("hero-subtitulo").textContent = general.subtitulo || "";
  document.getElementById("footer-direccion").textContent = general.direccion || "";

  const redes = document.getElementById("footer-redes");
  if (general.instagram) {
    redes.innerHTML += `<a href="${general.instagram}" target="_blank">Instagram</a>`;
  }
  if (general.whatsapp) {
    redes.innerHTML += `<a href="${general.whatsapp}" target="_blank">WhatsApp</a>`;
  }
}

// ==========================================
// 2. PROFESORES
// Pestaña "Profesores" con columnas: nombre | especialidad | fotoURL
// ==========================================
async function cargarProfesores() {
  const profesores = await sheetFetch("Profesores");
  const contenedor = document.getElementById("lista-profesores");

  contenedor.innerHTML = profesores.map(p => `
    <div class="card">
      <img src="${p.fotoURL || ""}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p>${p.especialidad}</p>
    </div>
  `).join("");
}

// ==========================================
// 3. PLANES
// Pestaña "Planes" con columnas: nombre | precio | descripcion | beneficios
// (beneficios: varios ítems separados por coma dentro de la misma celda)
// ==========================================
async function cargarPlanes() {
  const planes = await sheetFetch("Planes");
  const contenedor = document.getElementById("lista-planes");

  contenedor.innerHTML = planes.map(pl => {
    const beneficios = (pl.beneficios || "").split(",").map(b => b.trim()).filter(Boolean);
    return `
      <div class="card">
        <h3>${pl.nombre}</h3>
        <p><strong>$${pl.precio}</strong></p>
        <p>${pl.descripcion || ""}</p>
        <ul>${beneficios.map(b => `<li>${b}</li>`).join("")}</ul>
      </div>
    `;
  }).join("");
}

// ==========================================
// 4. HORARIOS
// Pestaña "Horarios" con columnas: dia | hora | actividad
// ==========================================
async function cargarHorarios() {
  const horarios = await sheetFetch("Horarios");
  const cuerpo = document.getElementById("cuerpo-horarios");

  cuerpo.innerHTML = horarios.map(h => `
    <tr>
      <td>${h.dia}</td>
      <td>${h.hora}</td>
      <td>${h.actividad}</td>
    </tr>
  `).join("");
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  cargarGeneral().catch(err => console.error("Error cargando general:", err));
  cargarProfesores().catch(err => console.error("Error cargando profesores:", err));
  cargarPlanes().catch(err => console.error("Error cargando planes:", err));
  cargarHorarios().catch(err => console.error("Error cargando horarios:", err));
});
