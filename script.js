// ==========================================
// CONFIGURACIÓN DE SANITY
// ==========================================
const PROJECT_ID = "1ehiilvi";
const DATASET = "production";
const API_VERSION = "v2021-10-21";

const BASE_URL = `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/query/${DATASET}`;

// Helper genérico: ejecuta una query GROQ y devuelve el resultado
async function sanityFetch(query) {
  const url = `${BASE_URL}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error Sanity API: ${res.status}`);
  const data = await res.json();
  return data.result;
}

// Convierte la referencia de imagen de Sanity (ej: "image-abc123-800x600-jpg")
// en una URL real servida por el CDN de Sanity.
function urlFor(imageRef) {
  if (!imageRef) return "";
  // formato típico: image-<id>-<ancho>x<alto>-<formato>
  const parts = imageRef.split("-");
  const id = parts[1];
  const dimensiones = parts[2];
  const formato = parts[3];
  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}-${dimensiones}.${formato}`;
}

// ==========================================
// 1. DATOS GENERALES (hero, dirección, redes)
// AJUSTA los nombres de campo si en tu schema son distintos
// ==========================================
async function cargarGeneral() {
  const query = `*[_type == "general"][0]{tituloPrincipal, subtitulo, direccion, instagram, whatsapp}`;
  const general = await sanityFetch(query);
  if (!general) return;

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
// ==========================================
async function cargarProfesores() {
  const query = `*[_type == "profesor"]{nombre, especialidad, "fotoRef": foto.asset._ref}`;
  const profesores = await sanityFetch(query);
  const contenedor = document.getElementById("lista-profesores");

  contenedor.innerHTML = profesores.map(p => `
    <div class="card">
      <img src="${urlFor(p.fotoRef)}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p>${p.especialidad}</p>
    </div>
  `).join("");
}

// ==========================================
// 3. PLANES
// ==========================================
async function cargarPlanes() {
  const query = `*[_type == "plan"]{nombre, precio, descripcion, beneficios}`;
  const planes = await sanityFetch(query);
  const contenedor = document.getElementById("lista-planes");

  contenedor.innerHTML = planes.map(pl => `
    <div class="card">
      <h3>${pl.nombre}</h3>
      <p><strong>$${pl.precio}</strong></p>
      <p>${pl.descripcion || ""}</p>
      <ul>${(pl.beneficios || []).map(b => `<li>${b}</li>`).join("")}</ul>
    </div>
  `).join("");
}

// ==========================================
// 4. HORARIOS
// ==========================================
async function cargarHorarios() {
  const query = `*[_type == "horario"] | order(dia asc){dia, hora, actividad}`;
  const horarios = await sanityFetch(query);
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
