// ==========================================
// CONFIGURACIÓN DE GOOGLE SHEETS (vía endpoint gviz/tq de Google)
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
  try {
    const profesores = await sheetFetch("Profesores");
    const contenedor = document.getElementById("lista-profesores");
    if (!contenedor) return;

    if (!profesores || profesores.length === 0) {
      contenedor.innerHTML = "<p>No hay profesores registrados.</p>";
      return;
    }

    contenedor.innerHTML = profesores.map(p => {
      const nombre = p.nombre || p.Nombre || 'Profesor';
      const rol = p.rol || p.Rol || p.especialidad || p.Especialidad || '';
      const descripcion = p.descripcion || p.Descripcion || '';
      const imagen = p.imagen || p.Imagen || p.fotoURL || p.Foto || '';

      return `
        <div class="card-profesor">
          ${imagen ? `<img src="${imagen}" alt="${nombre}">` : ''}
          <div class="card-profesor-info">
            <span class="card-profesor-role">${rol}</span>
            <h3 class="card-profesor-nombre">${nombre}</h3>
            <p class="card-profesor-desc">${descripcion}</p>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Error cargando Profesores:", err);
  }
}

// ==========================================
// 3. PLANES (Leyendo dinámicamente desde la hoja "Planes")
// ==========================================
async function cargarPlanes() {
  const contenedor = document.getElementById("lista-planes");
  if (!contenedor) return;

  try {
    // Intentamos leer la pestaña "Planes" desde tu Google Sheet
    const planesSheet = await sheetFetch("Planes");

    if (planesSheet && planesSheet.length > 0) {
      contenedor.innerHTML = planesSheet.map(plan => {
        const nombre = plan.nombre || plan.Nombre || "";
        const precio = plan.precio || plan.Precio || "";
        const periodo = plan.periodo || plan.Periodo || "";
        const badge = plan.badge || plan.Badge || "MÁS RECOMENDADO";
        const esDestacado = plan.destacado === "true" || plan.destacado === true || plan.Destacado === "true" || nombre.toUpperCase() === "SEMESTRAL";
        
        // Formatear beneficios (si vienen separados por coma o salto de línea en el Excel)
        const beneficiosRaw = plan.beneficios || plan.Beneficios || "";
        const listaBeneficios = Array.isArray(beneficiosRaw) 
          ? beneficiosRaw 
          : beneficiosRaw.split(/,|\n/).map(b => b.trim()).filter(b => b !== "");

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
  } catch (err) {
    console.error("Error cargando Planes desde Google Sheets:", err);
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
      const obtener = (nombre) => {
        const clave = Object.keys(h).find(k => k.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === nombre.toLowerCase());
        return clave ? h[clave] : '';
      };

      return `
        <tr>
          <td><strong>${obtener('hora')}</strong></td>
          <td>${obtener('lunes')}</td>
          <td>${obtener('martes')}</td>
          <td>${obtener('miercoles')}</td>
          <td>${obtener('jueves')}</td>
          <td>${obtener('viernes')}</td>
          <td>${obtener('sabado')}</td>
          <td>${obtener('domingo')}</td>
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
