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

// Helper seguro para buscar claves sin importar mayúsculas
function getProp(obj, keyName) {
  if (!obj) return "";
  const foundKey = Object.keys(obj).find(k => k.trim().toLowerCase() === keyName.toLowerCase());
  return foundKey ? obj[foundKey] : "";
}

// ==========================================
// 1. GENERAL (Protegido contra elementos nulos)
// ==========================================
async function cargarGeneral() {
  try {
    const filas = await sheetFetch("General");
    const general = {};
    filas.forEach(fila => {
      const clave = getProp(fila, "campo") || Object.values(fila)[0];
      const valor = getProp(fila, "valor") || Object.values(fila)[1];
      if (clave) general[clave.trim()] = valor;
    });

    const elemSub = document.getElementById("hero-subtitulo");
    if (elemSub && general.subtitulo) elemSub.textContent = general.subtitulo;

    const elemDir = document.getElementById("footer-direccion");
    if (elemDir && general.direccion) elemDir.textContent = general.direccion;

    const redes = document.getElementById("footer-redes");
    if (redes) {
      redes.innerHTML = "";
      if (general.instagram) redes.innerHTML += `<a href="${general.instagram}" target="_blank">Instagram</a> `;
      if (general.whatsapp) redes.innerHTML += `<a href="${general.whatsapp}" target="_blank">WhatsApp</a>`;
    }
  } catch (err) {
    console.error("Error cargando General:", err);
  }
}

// ==========================================
// 2. PROFESORES
// ==========================================
async function cargarProfesores() {
  const contenedor = document.getElementById("lista-profesores");
  if (!contenedor) return;

  try {
    const profesores = await sheetFetch("Profesores");
    if (profesores && profesores.length > 0) {
      contenedor.innerHTML = profesores.map(p => {
        const nombre = getProp(p, "nombre") || 'Profesor';
        const rol = getProp(p, "rol") || getProp(p, "especialidad") || '';
        const desc = getProp(p, "descripcion") || getProp(p, "desc") || '';
        const img = getProp(p, "imagen") || getProp(p, "foto") || getProp(p, "fotourl") || 'profesor1.jpg';

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
  } catch (err) {
    console.error("Error cargando Profesores:", err);
  }
}

// ==========================================
// 3. PLANES
// ==========================================
async function cargarPlanes() {
  const contenedor = document.getElementById("lista-planes");
  if (!contenedor) return;

  let planesSheet = [];
  try {
    planesSheet = await sheetFetch("Planes");
  } catch (e) {
    try {
      planesSheet = await sheetFetch("Planes ");
    } catch (err) {
      console.error("No se pudo obtener la pestaña Planes:", err);
    }
  }

  if (planesSheet && planesSheet.length > 0) {
    contenedor.innerHTML = planesSheet.map(plan => {
      const nombre = getProp(plan, "nombre");
      const precio = getProp(plan, "precio");
      const periodo = getProp(plan, "periodo");
      const badge = getProp(plan, "badge") || "MÁS RECOMENDADO";
      const destVal = getProp(plan, "destacado");
      const esDestacado = destVal === true || destVal.toString().toLowerCase() === "true" || nombre.toUpperCase() === "SEMESTRAL";

      const rawBen = getProp(plan, "beneficios");
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
}

// ==========================================
// 4. HORARIOS
// ==========================================
async function cargarHorarios() {
  try {
    const horarios = await sheetFetch("Horarios");
    const cuerpo = document.getElementById("cuerpo-horarios");
    if (!cuerpo) return;

    if (!horarios || horarios.length === 0) {
      cuerpo.innerHTML = "<tr><td colspan='8'>No hay horarios registrados.</td></tr>";
      return;
    }

    cuerpo.innerHTML = horarios.map(h => {
      return `
        <tr>
          <td><strong>${getProp(h, 'hora')}</strong></td>
          <td>${getProp(h, 'lunes')}</td>
          <td>${getProp(h, 'martes')}</td>
          <td>${getProp(h, 'miercoles')}</td>
          <td>${getProp(h, 'jueves')}</td>
          <td>${getProp(h, 'viernes')}</td>
          <td>${getProp(h, 'sabado')}</td>
          <td>${getProp(h, 'domingo')}</td>
        </tr>
      `;
    }).join("");
  } catch (err) {
    console.error("Error cargando Horarios:", err);
  }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  cargarGeneral();
  cargarProfesores();
  cargarPlanes();
  cargarHorarios();
});
