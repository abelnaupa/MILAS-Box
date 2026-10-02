const SPREADSHEET_ID = "1aphxXLYW3hP1OK_H2J8EYLZQ6E8K3nZ3AL4XJ76jX4o";

async function sheetFetch(nombrePestana) {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(nombrePestana)}`;
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: No se pudo acceder a la pestaña ${nombrePestana}`);
  }

  const textoCSV = await res.text();
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

function getVal(obj, keyName) {
  if (!obj) return "";
  const keys = Object.keys(obj);
  const matchedKey = keys.find(k => k.trim().toLowerCase() === keyName.toLowerCase());
  return matchedKey ? obj[matchedKey] : "";
}

// Carga General
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
  } catch (err) {
    console.warn("General:", err);
  }
}

// Carga Profesores
async function cargarProfesores() {
  const contenedor = document.getElementById("lista-profesores");
  if (!contenedor) return;

  try {
    const profesores = await sheetFetch("Profesores");
    if (profesores.length === 0) {
      contenedor.innerHTML = "<p style='color:#a1a9b8;'>Sin datos en la pestaña Profesores</p>";
      return;
    }

    contenedor.innerHTML = profesores.map(p => {
      const nombre = getVal(p, "nombre") || Object.values(p)[0] || "Profesor";
      const rol = getVal(p, "rol") || getVal(p, "especialidad") || Object.values(p)[1] || "";
      const desc = getVal(p, "descripcion") || getVal(p, "desc") || Object.values(p)[2] || "";
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
  } catch (err) {
    console.error(err);
    contenedor.innerHTML = `<p style='color:#ea2b2b;'>Error leyendo Profesores. Revisa el acceso del Sheet.</p>`;
  }
}

// Carga Planes
async function cargarPlanes() {
  const contenedor = document.getElementById("lista-planes");
  if (!contenedor) return;

  try {
    let planes = [];
    try {
      planes = await sheetFetch("Planes");
    } catch(e) {
      planes = await sheetFetch("Planes "); // Intento de respaldo con espacio
    }

    if (planes.length === 0) {
      contenedor.innerHTML = "<p style='color:#a1a9b8;'>Sin datos en la pestaña Planes</p>";
      return;
    }

    contenedor.innerHTML = planes.map(plan => {
      const nombre = getVal(plan, "nombre") || Object.values(plan)[0] || "";
      const precio = getVal(plan, "precio") || Object.values(plan)[1] || "";
      const periodo = getVal(plan, "periodo") || Object.values(plan)[2] || "";
      const badge = getVal(plan, "badge") || "MÁS RECOMENDADO";
      const dest = getVal(plan, "destacado");
      const esDestacado = dest === true || dest.toString().toLowerCase() === "true" || nombre.toUpperCase() === "SEMESTRAL";

      const rawBen = getVal(plan, "beneficios") || Object.values(plan)[5] || "";
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
  } catch (err) {
    console.error(err);
    contenedor.innerHTML = `<p style='color:#ea2b2b;'>Error leyendo Planes. Revisa el acceso del Sheet.</p>`;
  }
}

// Carga Horarios
async function cargarHorarios() {
  const cuerpo = document.getElementById("cuerpo-horarios");
  if (!cuerpo) return;

  try {
    const horarios = await sheetFetch("Horarios");
    if (horarios.length === 0) {
      cuerpo.innerHTML = "<tr><td colspan='8'>Sin horarios registrados en la hoja.</td></tr>";
      return;
    }

    cuerpo.innerHTML = horarios.map(h => `
      <tr>
        <td><strong>${getVal(h, 'hora') || Object.values(h)[0] || ''}</strong></td>
        <td>${getVal(h, 'lunes') || Object.values(h)[1] || ''}</td>
        <td>${getVal(h, 'martes') || Object.values(h)[2] || ''}</td>
        <td>${getVal(h, 'miercoles') || getVal(h, 'miércoles') || Object.values(h)[3] || ''}</td>
        <td>${getVal(h, 'jueves') || Object.values(h)[4] || ''}</td>
        <td>${getVal(h, 'viernes') || Object.values(h)[5] || ''}</td>
        <td>${getVal(h, 'sabado') || getVal(h, 'sábado') || Object.values(h)[6] || ''}</td>
        <td>${getVal(h, 'domingo') || Object.values(h)[7] || ''}</td>
      </tr>
    `).join("");
  } catch (err) {
    console.error(err);
    cuerpo.innerHTML = "<tr><td colspan='8' style='color:#ea2b2b;'>Error cargando Horarios.</td></tr>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarGeneral();
  cargarProfesores();
  cargarPlanes();
  cargarHorarios();
});
