// --- Cuenta regresiva al evento ---
const fechaEvento = new Date(evento.fecha.iso).getTime();
const cuentaRegresiva = document.getElementById("cuentaRegresiva");

function actualizarCuentaRegresiva() {
  const ahora = Date.now();
  const diferencia = fechaEvento - ahora;

  if (diferencia > 0) {
    const dias = Math.floor(diferencia / 86400000);
    const horas = Math.floor((diferencia % 86400000) / 3600000);
    const minutos = Math.floor((diferencia % 3600000) / 60000);
    const segundos = Math.floor((diferencia % 60000) / 1000);

    cuentaRegresiva.innerHTML = `
      <div class="countdown-item">
        <span>${dias}</span>
        <small>D</small>
      </div>
      <div class="countdown-item">
        <span>${horas}</span>
        <small>H</small>
      </div>
      <div class="countdown-item">
        <span>${minutos}</span>
        <small>M</small>
      </div>
      <div class="countdown-item">
        <span>${segundos}</span>
        <small>S</small>
      </div>
    `;
  } else {
    cuentaRegresiva.innerHTML = "¡Ya comenzó la celebración! 🎉";
    clearInterval(intervalo);
  }
}

const intervalo = setInterval(actualizarCuentaRegresiva, 1000);
actualizarCuentaRegresiva();

// --- Pausar música si se reproduce el video ---
const videoPresentacion = document.getElementById("videoPresentacion");
const musicaFondo = document.getElementById("musicaFondo");

videoPresentacion?.addEventListener("play", () => {
  if (musicaFondo && !musicaFondo.paused) musicaFondo.pause();
});

// --- Animación fade-in al hacer scroll ---
const faders = document.querySelectorAll(".fade-in");
const appearOnScroll = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

faders.forEach(fader => appearOnScroll.observe(fader));

const sourceMusica = document.getElementById("musica");

if (musicaFondo && sourceMusica && evento.musica?.archivo) {
  sourceMusica.src = evento.musica.archivo;
  musicaFondo.load();
}

// --- Control del reproductor de música ---
const btnPlayPause = document.getElementById("btnPlayPause");
const musicProgress = document.getElementById("musicProgress");
const musicCurrentTime = document.getElementById("musicCurrentTime");
const musicDuration = document.getElementById("musicDuration");

if (musicaFondo && btnPlayPause && musicProgress && musicCurrentTime && musicDuration) {
  btnPlayPause.addEventListener("click", () => {
    musicaFondo.paused ? musicaFondo.play() : musicaFondo.pause();
  });

  musicaFondo.addEventListener("play", () => {
    btnPlayPause.classList.add("corazon-activo");
    btnPlayPause.style.animationPlayState = "running";
  });

  musicaFondo.addEventListener("pause", () => {
    btnPlayPause.classList.remove("corazon-activo");
    btnPlayPause.style.animationPlayState = "paused";
  });

  musicaFondo.addEventListener("timeupdate", () => {
    const current = musicaFondo.currentTime;
    const duration = musicaFondo.duration || 0;
    musicProgress.value = duration ? (current / duration) * 100 : 0;
    musicCurrentTime.textContent = formatoTiempo(current);
    musicDuration.textContent = "-" + formatoTiempo(duration - current);
  });

  musicProgress.addEventListener("input", () => {
    const duration = musicaFondo.duration || 0;
    musicaFondo.currentTime = (musicProgress.value / 100) * duration;
  });

  musicaFondo.addEventListener("loadedmetadata", () => {
    musicCurrentTime.textContent = "0:00";
    musicDuration.textContent = "-" + formatoTiempo(musicaFondo.duration);
  });
}

// --- Formato de tiempo mm:ss ---
function formatoTiempo(segundos) {
  const s = Math.max(0, Math.floor(segundos));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${ss.toString().padStart(2, "0")}`;
}

// Detecta cuando el pergamino entra en el viewport
document.addEventListener("DOMContentLoaded", () => {
  const pergaminos = document.querySelectorAll(".pergamino-container");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      } else {
        entry.target.classList.remove("visible"); // se reinicia cuando sale
      }
    });
  }, {
    threshold: 0.2 // se activa con el 20% visible
  });

  pergaminos.forEach(perg => observer.observe(perg));
});

// --- Animación de la línea de tiempo ---
document.addEventListener("DOMContentLoaded", () => {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  const points = document.querySelectorAll('.timeline-point');
  const items = document.querySelectorAll('.timeline-item');

  // Crear la línea animada
  const line = document.createElement('div');
  line.classList.add('line-progress');
  timeline.appendChild(line);

  const timelineHeight = timeline.offsetHeight;
  let currentHeight = 0;
  const speed = 4; // px por frame
  let animating = false;

  // Calcular posiciones relativas de los puntos respecto a la timeline
  function getPointPositions() {
    const timelineRect = timeline.getBoundingClientRect();
    return Array.from(points).map(point => {
      const pointRect = point.getBoundingClientRect();
      return pointRect.top - timelineRect.top + point.offsetHeight / 2;
    });
  }

  let pointPositions = getPointPositions();

  function animateLine() {
    if (!animating) return;
    currentHeight += speed;
    if (currentHeight > timelineHeight) currentHeight = timelineHeight;
    line.style.height = currentHeight + 'px';

    pointPositions.forEach((pointPos, index) => {
      if (
        currentHeight >= pointPos &&
        !points[index].classList.contains('active')
      ) {
        points[index].classList.add('active');
        const texto = items[index].querySelector('.evento-texto');
        const icono = items[index].querySelector('.evento-icono');
        texto.classList.add('active');
        icono.classList.add('active');
      }
    });

    if (currentHeight < timelineHeight) {
      requestAnimationFrame(animateLine);
    }
  }

  // Observer para iniciar la animación cuando la timeline es visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animating) {
        animating = true;
        pointPositions = getPointPositions(); // recalcular posiciones
        animateLine();
      }
    });
  }, { threshold: 0.2 }); // con 20% visible arranca

  observer.observe(timeline);
});

/* =========================
   UBICACIONES MÚLTIPLES
========================= */
const listaUbicaciones = document.getElementById("ubicacionesLista");

if (listaUbicaciones && evento.ubicaciones && evento.ubicaciones.length) {
  listaUbicaciones.innerHTML = evento.ubicaciones
    .map(
      u => `
        <li class="ubicacion-item">
          <div class="ubicacion-tipo">${u.tipo}</div>
          <a href="${u.mapa}" target="_blank" rel="noopener noreferrer" class="btn-link">
             ${u.nombre}
          </a>
        </li> `)
    .join("");
}

const fechaTitulo = document.getElementById("fechaTitulo");
if (fechaTitulo && evento.fecha?.texto) {
  fechaTitulo.textContent = evento.fecha.texto;
}

/* =========================
   WHATSAPP DINÁMICO (BOTÓN)
========================= */
const btnWhatsapp = document.getElementById("btnWhatsapp");

if (btnWhatsapp && evento?.whatsapp) {
  const mensaje = evento.whatsapp.mensajeConfirmacion
    .replace("{evento}", evento.nombre);

  btnWhatsapp.href = `https://wa.me/${evento.whatsapp.telefono}?text=${encodeURIComponent(mensaje)}`;
}

/* =========================
   HASHTAG DINÁMICO
========================= */
const hashtagTexto = document.getElementById("hashtagTexto");

if (hashtagTexto && evento.hashtag) {
  hashtagTexto.textContent = evento.hashtag;
}

/* =========================
   PADRES Y PADRINOS DINÁMICOS
========================= */
const padresTitulo = document.getElementById("padresTitulo");
const padresNombres = document.getElementById("padresNombres");
const padrinosTitulo = document.getElementById("padrinosTitulo");
const padrinosNombres = document.getElementById("padrinosNombres");
const bloquePadrinos = document.getElementById("bloquePadrinos");
const seccionPadresPadrinos = document.getElementById("seccionPadresPadrinos");

// Padres
if (evento.padres && padresTitulo && padresNombres) {
  padresTitulo.textContent = evento.padres.titulo;
  padresNombres.innerHTML = evento.padres.nombres.join("<br>");
}

// Padrinos (opcional)
if (evento.padrinos && padrinosTitulo && padrinosNombres) {
  padrinosTitulo.textContent = evento.padrinos.titulo;
  padrinosNombres.innerHTML = evento.padrinos.nombres.join("<br>");
} else if (bloquePadrinos) {
  bloquePadrinos.style.display = "none";
}

/* =========================
   VIDEO OPCIONAL
========================= */
const seccionVideo = document.getElementById("seccionVideo");
const videoIframe = document.getElementById("videoPresentacion");

if (evento.video && evento.video.url && videoIframe) {
  videoIframe.src = evento.video.url;
} else if (seccionVideo) {
  seccionVideo.style.display = "none";
}

/* =========================
   ITINERARIO DINÁMICO
========================= */
const timelineLista = document.getElementById("timelineLista");

if (timelineLista && evento.itinerario && evento.itinerario.length) {
  timelineLista.innerHTML = evento.itinerario
    .map(item => {
      return `
        <li class="timeline-item ${item.lado}">
          ${item.lado === "left"
          ? `
              <div class="evento-texto">
                <span class="hora">${item.hora}</span>
                <span class="nombre">${item.nombre}</span>
              </div>
              <div class="timeline-point"></div>
              <div class="evento-icono">
                <img src="${item.icono}" alt="${item.nombre}" class="icono" />
              </div>
              `
          : `
              <div class="evento-icono">
                <img src="${item.icono}" alt="${item.nombre}" class="icono" />
              </div>
              <div class="timeline-point"></div>
              <div class="evento-texto">
                <span class="hora">${item.hora}</span>
                <span class="nombre">${item.nombre}</span>
              </div>
              `
        }
        </li>
      `;
    })
    .join("");
}

/* =========================
   POLÍTICAS DEL EVENTO
========================= */
const seccionPoliticas = document.getElementById("seccionPoliticas");
const politicasTitulo = document.getElementById("politicasTitulo");
const politicasLista = document.getElementById("politicasLista");

if (
  evento.politicas &&
  evento.politicas.reglas &&
  evento.politicas.reglas.length &&
  seccionPoliticas &&
  politicasTitulo &&
  politicasLista
) {
  politicasTitulo.textContent = evento.politicas.titulo;

  politicasLista.innerHTML = evento.politicas.reglas
    .map(regla => `<li>${regla}</li>`)
    .join("");
} else if (seccionPoliticas) {
  seccionPoliticas.style.display = "none";
}

// ✨ Microbrillos
for (let i = 0; i < 30; i++) {
  const brillo = document.createElement("div");
  brillo.className = "microbrillo";
  brillo.style.left = Math.random() * 100 + "vw";
  brillo.style.top = Math.random() * 100 + "vh";
  brillo.style.animationDelay = Math.random() * 3 + "s";
  document.body.appendChild(brillo);
}

// 💫 Partículas suaves
setInterval(() => {
  const p = document.createElement("div");
  p.className = "particula";
  p.style.left = Math.random() * 100 + "vw";
  p.style.animationDuration = 8 + Math.random() * 6 + "s";
  document.body.appendChild(p);

  setTimeout(() => {
    p.remove();
  }, 15000);
}, 800);
