// ==========================================
// CONFIGURACIÓN DE GOOGLE SHEETS (Vía CSV directo de Google)
// ==========================================
const SPREADSHEET_ID = "1aphxXLYW3hP1OK_H2J8EYLZQ6E8K3nZ3AL4XJ76jX4o";

// Función para descargar y parsear cada pestaña publicada como CSV
async function sheetFetch(nombrePestana) {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(nombrePestana)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error leyendo la pestaña "${nombrePestana}": ${res.status}`);
  
  const textoCSV = await res.text();
  return parsearCSV(textoCSV);
}

// Convierte el texto CSV en un arreglo de objetos JavaScript
function parsearCSV(csv) {
  const lineas = csv.split("\n").filter(l => l.trim() !== "");
  if (lineas.length === 0) return [];

  const limpiar = celda => celda.replace(/^"(.*)"$/, "$1").replace(/""/g, '"').trim();
  const encabezados = lineas[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(limpiar);

  return lineas.slice(1).map(linea => {
    const valores = linea.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(limpiar);
    const objeto = {};
    encabezados.forEach((h, i) => {
      objeto[h] = valores[i] || "";
    });
    return objeto;
  });
}

// ==========================================
// 1. DATOS GENERALES
// ==========================================
async function cargarGeneral() {
  const filas = await sheetFetch("General");
  const general = {};
  filas.forEach(fila => { general[fila.campo] = fila.valor; });

  document.getElementById("hero-titulo").textContent = general.tituloPrincipal || "";
  document.getElementById("hero-subtitulo").textContent = general.subtitulo || "";
  document.getElementById("footer-direccion").textContent = general.direccion || "";

  const redes = document.getElementById("footer-redes");
  redes.innerHTML = "";
  if (general.instagram) {
    redes.innerHTML += `<a href="${general.instagram}" target="_blank">Instagram</a> `;
  }
  if (general.whatsapp) {
    redes.innerHTML += `<a href="${general.whatsapp}" target="_blank">WhatsApp</a>`;
  }
}

// ==========================================
// 2. PROFESORES
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
