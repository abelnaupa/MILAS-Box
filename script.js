// ID de tu Google Sheet
const SPREADSHEET_ID = "1aphxXLYW3hP1OK_H2J8EYLZQ6E8K3nZ3AL4XJ76jX4o";

// Función para descargar la pestaña en formato CSV
async function leerHoja(nombrePestana) {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(nombrePestana)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo cargar la pestaña: ${nombrePestana}`);
  const texto = await res.text();
  return parsearCSV(texto);
}

// Convertidor de CSV a objetos JSON de JavaScript
function parsearCSV(csv) {
  const lineas = csv.split(/\r?\n/).filter(l => l.trim() !== "");
  if (lineas.length === 0) return [];

  const limpiar = celda => celda ? celda.replace(/^"(.*)"$/, "$1").replace(/""/g, '"').trim() : "";
  const encabezados = lineas[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(limpiar);

  return lineas.slice(1).map(linea => {
    const valores = linea.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(limpiar);
    const obj = {};
    encabezados.forEach((h, i) => {
      if (h) obj[h.toLowerCase()] = valores[i] || "";
    });
    return obj;
  });
}

// 1. Cargar Profesores
async function cargarProfesores() {
  const cont = document.getElementById('lista-profesores');
  if (!cont) return;

  try {
    const profesores = await leerHoja("Profesores");
    if (profesores.length === 0) {
      cont.innerHTML = "<p>No hay profesores cargados en la hoja.</p>";
      return;
    }

    cont.innerHTML = profesores.map(p => {
      const valores = Object.values(p);

      const nombre = p.nombre || valores[0] || 'Profesor';
      const rol = p.rol || p.especialidad || valores[1] || '';

      // Filtramos para encontrar cuál campo contiene una extensión de imagen o link
      let rawImg = p.imagen || p.foto || valores.find(v => typeof v === 'string' && (v.includes('.') || v.includes('http'))) || 'profesor1.jpg';
      
      // La descripción será el texto que NO sea ni nombre, ni rol, ni link de imagen
      let desc = p.descripcion || p.desc || '';
      if (!desc) {
        const posibleDesc = valores.find(v => v !== nombre && v !== rol && v !== rawImg);
        desc = posibleDesc || '';
      }

      let imgUrl = rawImg.trim();

      // Conversión automática de enlaces de Google Drive
      if (imgUrl.includes('drive.google.com')) {
        const match = imgUrl.match(/\/d\/([^\/]+)/) || imgUrl.match(/id=([^&]+)/);
        if (match && match[1]) {
          imgUrl = `https://lh3.googleusercontent.com/d/${match[1]}`;
        }
      }

      return `
        <div class="card-profesor" style="border: 1px solid rgba(255,255,255,0.1); padding: 15px; margin-bottom: 10px;">
          <img src="${imgUrl}" alt="${nombre}" style="width:100%; max-height:250px; object-fit:cover;" onerror="this.src='https://via.placeholder.com/300x250?text=Sin+Imagen'">
          <div class="card-profesor-info">
            <span class="card-profesor-role" style="color:#ea2b2b;">${rol}</span>
            <h3 class="card-profesor-nombre">${nombre}</h3>
            <p class="card-profesor-desc">${desc}</p>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
    cont.innerHTML = `<p style="color:#ea2b2b;">Error al leer la pestaña "Profesores". Revisa que el Sheet sea público.</p>`;
  }
}
// 2. Cargar Planes
// PON AQUÍ TU NÚMERO DE WHATSAPP (código de país 56 + 9 + número sin espacios)
const NUMERO_WHATSAPP = "569XXXXXXXX"; 

async function cargarPlanes() {
  const cont = document.getElementById('lista-planes');
  if (!cont) return;

  try {
    const planes = await leerHoja("Planes");
    if (planes.length === 0) {
      cont.innerHTML = "<p>No hay planes cargados en la hoja.</p>";
      return;
    }

    cont.innerHTML = planes.map(p => {
      // Leemos el nombre, precio y periodo directamente del Google Sheet
      const nombre = p.nombre || Object.values(p)[0] || 'Plan';
      const precio = p.precio || Object.values(p)[1] || '';
      const periodo = p.periodo || Object.values(p)[2] || '';
      const beneficiosRaw = p.beneficios || Object.values(p)[3] || '';
      const listaBeneficios = beneficiosRaw.split(',').map(b => b.trim()).filter(b => b);

      // 1. CONSTRUCCIÓN DINÁMICA DEL MENSAJE DE WHATSAPP:
      // Si cambias el precio o nombre en Google Sheet, el mensaje se actualiza automáticamente.
      const mensaje = `Hola MILAS, me interesa el plan ${nombre} de ${precio} ${periodo}`.trim();
      
      // 2. CODIFICAMOS EL MENSAJE PARA LA URL
      const urlWsp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

      return `
        <div class="tarjeta-plan" style="border: 1px solid rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; background-color: #171d29; margin-bottom: 15px;">
          <h3 class="nombre-plan">${nombre}</h3>
          <div class="precio-plan" style="font-size: 2rem; font-weight: bold; margin: 10px 0;">
            ${precio} <span style="font-size: 1rem; font-weight: normal; color: #a1a9b8;">${periodo}</span>
          </div>
          <ul class="lista-beneficios" style="margin: 15px 0; padding-left: 20px; text-align: left;">
            ${listaBeneficios.map(b => `<li>✓ ${b}</li>`).join('')}
          </ul>

          <!-- BOTÓN DINÁMICO DE WHATSAPP -->
          <a href="${urlWsp}" target="_blank" class="btn-plan" style="display: block; text-align: center; background-color: #25d366; color: #ffffff; text-decoration: none; padding: 12px; border-radius: 6px; font-weight: bold; margin-top: 15px;">
            QUIERO ESTE PLAN
          </a>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
    cont.innerHTML = `<p style="color:#ea2b2b;">Error al leer la pestaña "Planes". Revisa que el Sheet sea público.</p>`;
  }
}
// 3. Cargar Horarios
async function cargarHorarios() {
  const cuerpo = document.getElementById('cuerpo-horarios');
  if (!cuerpo) return;

  try {
    const horarios = await leerHoja("Horarios");
    if (horarios.length === 0) {
      cuerpo.innerHTML = "<tr><td colspan='8'>Sin horarios en la hoja.</td></tr>";
      return;
    }

    cuerpo.innerHTML = horarios.map(h => `
      <tr>
        <td><strong>${h.hora || Object.values(h)[0] || ''}</strong></td>
        <td>${h.lunes || Object.values(h)[1] || '-'}</td>
        <td>${h.martes || Object.values(h)[2] || '-'}</td>
        <td>${h.miercoles || h['miércoles'] || Object.values(h)[3] || '-'}</td>
        <td>${h.jueves || Object.values(h)[4] || '-'}</td>
        <td>${h.viernes || Object.values(h)[5] || '-'}</td>
        <td>${h.sabado || h['sábado'] || Object.values(h)[6] || '-'}</td>
        <td>${h.domingo || Object.values(h)[7] || '-'}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
    cuerpo.innerHTML = "<tr><td colspan='8' style='color:#ea2b2b;'>Error cargando pestaña 'Horarios'.</td></tr>";
  }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarProfesores();
  cargarPlanes();
  cargarHorarios();
});
