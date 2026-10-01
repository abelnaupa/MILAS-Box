// ==========================================
// CONFIGURACIÓN DE GOOGLE SHEETS (vía endpoint gviz/tq de Google)
// No requiere API key. Funciona con la hoja compartida como
// "Cualquiera con el enlace puede ver" (no hace falta "Publicar en la web").
// A diferencia de /pub, este endpoint SÍ respeta el nombre de la pestaña.
// ==========================================
const SPREADSHEET_ID = "1aphxXLYW3hP1OK_H2J8EYLZQ6E8K3nZ3AL4XJ76jX4o";

async function sheetFetch(nombrePestana) {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(nombrePestana)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error leyendo pestaña "${nombrePestana}": ${res.status}`);

  // Forzamos la decodificación como UTF-8 explícitamente. Si usáramos
  // res.text() directo, el navegador a veces adivina mal la codificación
  // y las tildes (é, á, í, ó, ú, ñ) salen corruptas (ej: "Ã©" en vez de "é").
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

    // Solo actualiza el título si en Google Sheets viene definido y es distinto a "MILAS Gym"
    if (general.tituloPrincipal && general.tituloPrincipal !== "MILAS Box") {
      document.getElementById("hero-titulo").textContent = general.tituloPrincipal;
    } else if (!general.tituloPrincipal) {
      document.getElementById("hero-titulo").textContent = "MILAS Box";
    }

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
    document.getElementById("hero-titulo").textContent = "MILAS Box";
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
// Arreglo con los planes obtenidos de tu planilla
const planes = [
  {
    nombre: "MENSUAL",
    precio: "$39.990",
    destacado: false,
    beneficios: [
      "🥊 Clases de Boxeo incluidas",
      "🏋️ Accesso a Sala de Musculación",
      "🔥 Modalidad Full Acceso"
    ]
  },
  {
    nombre: "TRIMESTRAL",
    precio: "$84.990",
    destacado: false,
    beneficios: [
      "🥊 Clases de Boxeo incluidas",
      "🏋️ Accesso a Sala de Musculación",
      "🔥 Modalidad Full Acceso"
    ]
  },
  {
    nombre: "SEMESTRAL",
    precio: "$139.990",
    destacado: true, // Resalta la tarjeta visualmente
    badge: "MÁS RECOMENDADO",
    beneficios: [
      "🥊 Clases de Boxeo incluidas",
      "🏋️ Accesso a Sala de Musculación",
      "🔥 Modalidad Full Acceso",
      "⭐ Incluye Evaluación Kinésica O Rutina de Entrenamiento"
    ]
  }
];

// Función para renderizar los planes en la landing
function cargarPlanes() {
  const contenedor = document.getElementById("lista-planes");
  if (!contenedor) return;

  contenedor.innerHTML = planes.map(plan => `
    <div class="tarjeta-plan ${plan.destacado ? 'destacado' : ''}">
      ${plan.destacado ? `<div class="badge-pop">${plan.badge}</div>` : ''}
      <div>
        <h3 class="nombre-plan">${plan.nombre}</h3>
        <div class="precio-plan">${plan.precio}</div>
        <ul class="lista-beneficios">
          ${plan.beneficios.map(b => `
            <li class="${b.includes('⭐') ? 'beneficio-extra' : ''}">${b}</li>
          `).join('')}
        </ul>
      </div>
      <a href="https://wa.me/569XXXXXXXX?text=Hola%20MILAS,%20quiero%20más%20información%20del%20Plan%20${plan.nombre}" 
         target="_blank" 
         class="btn-plan">
         Elegir Plan ${plan.nombre}
      </a>
    </div>
  `).join('');
}

// Ejecutar cuando cargue el documento
document.addEventListener("DOMContentLoaded", cargarPlanes);// ==========================================
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
      // Helper para buscar el valor de la columna sin importar tildes o mayúsculas
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
