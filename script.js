// ==========================================
// CONFIGURACIÓN DE GOOGLE SHEETS
// ==========================================
const SPREADSHEET_ID = "1aphxXLYW3hP1OK_H2J8EYLZQ6E8K3nZ3AL4XJ76jX4o";

// Lector inteligente de CSV desde Google Sheets
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

// Busca cualquier propiedad sin importar si está en mayúsculas o minúsculas
function getVal(obj, keyName) {
  if (!obj) return "";
  const keys = Object.keys(obj);
  const matchedKey = keys.find(k => k.trim().toLowerCase() === keyName.toLowerCase());
  return matchedKey ? obj[matchedKey] : "";
}

// ==========================================
// RENDERIZADO DESDE GOOGLE SHEETS
// ==========================================

async function cargarGeneral() {
  try {
    const filas = await sheetFetch("General");
    const general = {};
    filas.forEach(fila => {
      const clave = getVal(fila, "campo") || Object.values(fila)[0];
      const valor = getVal(fila, "valor") || Object.values(fila)[1];
      if (clave) general[clave.toLowerCase().trim()] = valor;
    });

    const elemSub = document.getElementById("hero-subtitulo");
    if (elemSub && general.subtitulo) elemSub.textContent = general.subtitulo;

    const elemDir = document.getElementById("footer-direccion");
    if (elemDir && general.direccion) elemDir.textContent = general.direccion;

    const redes = document.getElementById("footer-redes");
    if (redes) {
      redes.innerHTML = "";
      if (general.instagram) redes.innerHTML += `<a href="${general.instagram}" target="_blank" style="margin-right:15px; color:#ea2b2b;">Instagram</a>`;
      if (general.whatsapp) redes.innerHTML += `<a href="${general.whatsapp}" target="_blank" style="color:#ea2b2b;">WhatsApp</a>`;
    }
  } catch (err) {
    console.warn("Sección General no disponible:", err);
  }
}

async function cargarProfesores() {
  const contenedor = document.getElementById("lista-profesores");
  if (!contenedor) return;

  try {
    const profesores = await sheetFetch("Profesores");
    if (profesores && profesores.length > 0) {
      contenedor.innerHTML = profesores.map(p => {
        const nombre = getVal(p, "nombre") || "Profesor";
        const rol = getVal(p, "rol") || getVal(p, "especialidad") || "";
        const desc = getVal(p, "descripcion") || getVal(p, "desc") || "";
        const img = getVal(p, "imagen") || getVal(p, "foto") || "profesor1.jpg";

        return `
          <div class="card-profesor">
            <img src="${img}" alt="${nombre}">
            <div class="card-profesor-info">
              <span class="card-profesor-role">${rol}</span>
              <h3 class="card-profesor-nombre">${nombre}</h3>
              <p class="card-profesor-desc">${desc}</p>
            </div>
          </div>
        `;
      }).join("");
    }
  } catch (err) {
    console.error("Error cargando Profesores:", err);
  }
}

async function cargarPlanes() {
  const contenedor = document.getElementById("lista-planes");
  if (!contenedor) return;

  try {
    const planes = await sheetFetch("Planes");
    if (planes && planes.length > 0) {
      contenedor.innerHTML = planes.map(plan => {
        const nombre = getVal(plan, "nombre");
        const precio = getVal(plan, "precio");
        const periodo = getVal(plan, "periodo");
        const badge = getVal(plan, "badge") || "MÁS RECOMENDADO";
        const dest = getVal(plan, "destacado");
        const esDestacado = dest === true || dest.toString().toLowerCase() === "true" || nombre.toUpperCase() === "SEMESTRAL";

        const rawBen = getVal(plan, "beneficios");
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
                  <li class="${b.includes('★') \vert{}\vert{} b.toLowerCase().includes('incluye') ? 'destacado-texto' : ''}">${b}</li>
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
  } catch (err) {
    console.error("Error cargando Planes:", err);
  }
}

async function cargarHorarios() {
  const cuerpo = document.getElementById("cuerpo-horarios");
  if (!cuerpo) return;

  try {
    const horarios = await sheetFetch("Horarios");
    if (horarios && horarios.length > 0) {
      cuerpo.innerHTML = horarios.map(h => `
        <tr>
          <td><strong>${getVal(h, 'hora')}</strong></td>
          <td>${getVal(h, 'lunes')}</td>
          <td>${getVal(h, 'martes')}</td>
          <td>${getVal(h, 'miercoles') || getVal(h, 'miércoles')}</td>
          <td>${getVal(h, 'jueves')}</td>
          <td>${getVal(h, 'viernes')}</td>
          <td>${getVal(h, 'sabado') || getVal(h, 'sábado')}</td>
          <td>${getVal(h, 'domingo')}</td>
        </tr>
      `).join("");
    }
  } catch (err) {
    console.error("Error cargando Horarios:", err);
  }
}

// ==========================================
// EJECUCIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  cargarGeneral();
  cargarProfesores();
  cargarPlanes();
  cargarHorarios();
});
