
// ==========================================
// CONFIGURACIÓN DE GOOGLE SHEETS PUBLICADO
// ==========================================
const PUB_ID = "e/2PACX-1vSAksM20_k4UPvSTi5FJuLrJuCNz9yBh4Md38atgbyQ8BnYzqe5V2mQa0LIbuoXVCEgyrwXrYS0oDUW";

async function sheetFetch(nombrePestana) {
  const url = `https://docs.google.com/spreadsheets/d/${PUB_ID}/pub?single=true&output=csv&sheet=${encodeURIComponent(nombrePestana)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error en pestaña "${nombrePestana}": ${res.status}`);
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

// ==========================================
// 1. GENERAL
// ==========================================
async function cargarGeneral() {
  try {
    const filas = await sheetFetch("General");
    const general = {};
    filas.forEach(fila => {
      const clave = fila.campo || fila.Campo || Object.values(fila)[0];
      const valor = fila.valor || fila.Valor || Object.values(fila)[1];
      if (clave) general[clave.trim()] = valor;
    });

    document.getElementById("hero-titulo").textContent = general.tituloPrincipal || "MILAS Gym";
    document.getElementById("hero-subtitulo").textContent = general.subtitulo || "";
    document.getElementById("footer-direccion").textContent = general.direccion || "";

    const redes = document.getElementById("footer-redes");
    if (redes) {
      redes.innerHTML = "";
      if (general.instagram) redes.innerHTML += `<a href="${general.instagram}" target="_blank">Instagram</a> `;
      if (general.whatsapp) redes.innerHTML += `<a href="${general.whatsapp}" target="_blank">WhatsApp</a>`;
    }
  } catch (err) {
    console.error("Error cargando General:", err);
    document.getElementById("hero-titulo").textContent = "MILAS Gym";
  }
}

// ==========================================
// 2. PROFESORES
// ==========================================
async function cargarProfesores() {
  try {
    const profesores = await sheetFetch("Profesores");
    const contenedor = document.getElementById("lista-profesores");
    if (!contenedor) return;

    if (profesores.length === 0) {
      contenedor.innerHTML = "<p>No hay profesores registrados.</p>";
      return;
    }

    contenedor.innerHTML = profesores.map(p => `
      <div class="card">
        ${p.fotoURL ? `<img src="${p.fotoURL}" alt="${p.nombre || ''}">` : ''}
        <h3>${p.nombre || 'Profesor'}</h3>
        <p>${p.especialidad || ''}</p>
      </div>
    `).join("");
  } catch (err) {
    console.error("Error cargando Profesores:", err);
  }
}

// ==========================================
// 3. PLANES
// ==========================================
async function cargarPlanes() {
  try {
    const planes = await sheetFetch("Planes");
    const contenedor = document.getElementById("lista-planes");
    if (!contenedor) return;

    if (planes.length === 0) {
      contenedor.innerHTML = "<p>No hay planes registrados.</p>";
      return;
    }

    contenedor.innerHTML = planes.map(pl => {
      const beneficios = (pl.beneficios || "").split(",").map(b => b.trim()).filter(Boolean);
      return `
        <div class="card">
          <h3>${pl.nombre || 'Plan'}</h3>
          <p><strong>$${pl.precio || '0'}</strong></p>
          <p>${pl.descripcion || ""}</p>
          <ul>${beneficios.map(b => `<li>${b}</li>`).join("")}</ul>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Error cargando Planes:", err);
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

    if (horarios.length === 0) {
      cuerpo.innerHTML = "<tr><td colspan='3'>No hay horarios asignados.</td></tr>";
      return;
    }

    cuerpo.innerHTML = horarios.map(h => `
      <tr>
        <td>${h.dia || ''}</td>
        <td>${h.hora || ''}</td>
        <td>${h.actividad || ''}</td>
      </tr>
    `).join("");
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
