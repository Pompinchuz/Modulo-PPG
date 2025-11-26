    const cursosContainer = document.getElementById("cursos");
    const ppActual = document.getElementById("ppActual");
    const ppSimulado = document.getElementById("ppSimulado");

    let cursos = [
      { nombre: "Algoritmos", nota: 12, creditos: 3, fijo: true },
      { nombre: "Base de Datos II", nota: 12, creditos: 4, fijo: true },
      { nombre: "Redes II", nota: 14, creditos: 2, fijo: true },
      { nombre: "Teoria de sistemas", nota: null, creditos: 3, fijo: false },
      { nombre: "Ingles IV", nota: null, creditos: 3, fijo: false },
      { nombre: "Javascript Avanzado", nota: null, creditos: 4, fijo: false },
      { nombre: "Seguridad informática", nota: null, creditos: 2, fijo: false }
    ];

    cursos.forEach((curso, i) => {
      let div = document.createElement("div");
      div.classList.add("nota");
      div.innerHTML = `
        <span>${curso.nombre}</span>
        <input type="number" min="0" max="20" value="${curso.nota ?? ''}" ${curso.fijo ? "readonly" : ""} class="notaInput" data-index="${i}" placeholder="Nota">
        <span class="credito">${curso.creditos} créditos</span>
      `;
      cursosContainer.appendChild(div);
    });

let ppgActualCalculado = false; // Flag para indicar si ya se calculó el PPG Actual


// Función para redondear hacia arriba si termina en .5
function redondearNota(nota) {
  const decimal = nota - Math.floor(nota);
  if (decimal >= 0.5) {
    return Math.ceil(nota);
  }
  return Math.floor(nota);
}

function calcularPromedio() {
  let totalNotasSimulado = 0;
  let totalCreditosSimulado = 0;
  let totalNotasActual = 0;
  let totalCreditosActual = 0;

  cursos.forEach(curso => {
    // Para el promedio SIMULADO: solo contar cursos CON nota
    if (curso.nota !== null && curso.nota !== undefined) {
      totalNotasSimulado += curso.nota * curso.creditos;
      totalCreditosSimulado += curso.creditos;
    }
    
    // Para el promedio ACTUAL: contar TODOS los cursos (asumiendo 0 si no tiene nota)
    const notaParaActual = (curso.nota !== null && curso.nota !== undefined) ? curso.nota : 0;
    totalNotasActual += notaParaActual * curso.creditos;
    totalCreditosActual += curso.creditos;
  });

  // PPG Simulado (solo cursos con nota)
  let promedioSimulado = totalCreditosSimulado > 0 ? totalNotasSimulado / totalCreditosSimulado : 0;
  let promedioSimuladoRedondeado = redondearNota(promedioSimulado);
  ppSimulado.textContent = promedioSimuladoRedondeado.toFixed(2);

  // PPG Actual (todos los cursos, asumiendo 0 en los sin nota)
  let promedioActual = totalCreditosActual > 0 ? totalNotasActual / totalCreditosActual : 0;
  let promedioActualRedondeado = redondearNota(promedioActual);
  ppActual.textContent = promedioActualRedondeado.toFixed(2);
}


    document.querySelectorAll(".notaInput").forEach(input => {
      input.addEventListener("input", function() {
        let valor = parseFloat(this.value);
        if (valor < 0) {
          this.value = 0;
          valor = 0;
        } else if (valor > 20) {
          this.value = 20;
          valor = 20;
        }
        let index = this.dataset.index;
        cursos[index].nota = isNaN(valor) ? null : valor;
        calcularPromedio();
      });
    });

    calcularPromedio();

    document.getElementById("back-button").addEventListener("click", function() {
      window.location.href = "cursos.html";
    });

 // Botón Compartir
document.getElementById("btn-Compartir").addEventListener("click", function() {
  const ppSimulado = document.getElementById("ppSimulado").textContent;
  const ppActual = document.getElementById("ppActual").textContent;
  
  const mensaje = `🎓 Mi Promedio Ponderado UTP\n\n` +
                  `📊 PPG Actual: ${ppActual}\n` +
                  `✨ PPG Simulado: ${ppSimulado}\n\n` +
                  `¡Sigue tu progreso académico con el Simulador UTP!`;
  
  if (navigator.share) {
    // Para móviles con API de compartir nativa
    navigator.share({
      title: 'Mi Promedio UTP',
      text: mensaje
    }).catch(err => console.log('Error al compartir:', err));
  } else {
    // Para desktop - copiar al portapapeles
    navigator.clipboard.writeText(mensaje).then(() => {
      alert('✅ Texto copiado al portapapeles.\n\nPuedes pegarlo en WhatsApp, Email, etc.');
    }).catch(() => {
      // Fallback si clipboard no funciona
      prompt('Copia este texto:', mensaje);
    });
  }
});

// Botón Calcular Nota Necesaria - Abrir modal
document.getElementById("btn-Calcular").addEventListener("click", function() {
  const calculoModal = document.getElementById("calculoModal");
  const calculoResultado = document.getElementById("calculoResultado");
  
  // Mostrar formulario de entrada
  calculoResultado.innerHTML = `
    <div class="objetivo-input">
      <p style="font-size: 1.1rem; margin-bottom: 15px;">
        ¿Qué promedio ponderado general deseas alcanzar?
      </p>
      <input type="number" id="ppg-objetivo" min="0" max="20" step="0.01" placeholder="Ej: 15.5" />
      <button onclick="calcularNotaNecesaria()">Calcular 🎯</button>
    </div>
    <p style="text-align: center; color: #b3b3b3; font-size: 0.9rem;">
      💡 Ingresa un valor entre 0 y 20
    </p>
  `;
  
  calculoModal.style.display = "flex";
});

// Cerrar modal de cálculo
document.getElementById("closeCalculo").addEventListener("click", function() {
  document.getElementById("calculoModal").style.display = "none";
});




// Función principal de cálculo
function calcularNotaNecesaria() {
  const ppObjetivoInput = document.getElementById("ppg-objetivo");
  const ppObjetivo = parseFloat(ppObjetivoInput.value);
  
  if (isNaN(ppObjetivo) || ppObjetivo < 0 || ppObjetivo > 20) {
    alert('❌ Por favor ingresa un promedio válido entre 0 y 20');
    return;
  }
  
  // Separar cursos en tres categorías
  let creditosFijos = 0;
  let notasPonderadasFijas = 0;
  let creditosSimulados = 0;
  let notasPonderadasSimuladas = 0;
  let creditosSinNota = 0;
  let cursosSinNota = [];
  let cursosConNotaSimulada = [];
  
  cursos.forEach(curso => {
    if (curso.fijo && curso.nota !== null && curso.nota !== undefined) {
      // Cursos ya cursados (fijos)
      creditosFijos += curso.creditos;
      notasPonderadasFijas += curso.nota * curso.creditos;
    } else if (!curso.fijo && curso.nota !== null && curso.nota !== undefined) {
      // Cursos con nota simulada
      creditosSimulados += curso.creditos;
      notasPonderadasSimuladas += curso.nota * curso.creditos;
      cursosConNotaSimulada.push(curso);
    } else {
      // Cursos sin nota (null o undefined)
      creditosSinNota += curso.creditos;
      cursosSinNota.push(curso);
    }
  });
  
  const totalCreditos = creditosFijos + creditosSimulados + creditosSinNota;
  const creditosConNota = creditosFijos + creditosSimulados;
  const notasPonderadasConNota = notasPonderadasFijas + notasPonderadasSimuladas;
  
  const ppActualSinRedondear = creditosFijos > 0 ? notasPonderadasFijas / creditosFijos : 0;
  const ppActual = redondearNota(ppActualSinRedondear);
  
  const ppSimuladoActualSinRedondear = creditosConNota > 0 ? notasPonderadasConNota / creditosConNota : 0;
  const ppSimuladoActual = redondearNota(ppSimuladoActualSinRedondear);
  
  // Calcular PPG máximo posible (asumiendo 20 en todos los cursos restantes)
  const ppMaximoAlcanzableSinRedondear = creditosSinNota > 0 
    ? (notasPonderadasConNota + (20 * creditosSinNota)) / totalCreditos
    : ppSimuladoActual;
  const ppMaximoAlcanzable = redondearNota(ppMaximoAlcanzableSinRedondear);
  
  const calculoResultado = document.getElementById("calculoResultado");
  
  // CASO CRÍTICO: Verificar primero si es TOTALMENTE imposible
  const esTotalmenteImposible = ppMaximoAlcanzable < ppObjetivo;
  
  if (esTotalmenteImposible) {
    // CASO EXTREMO: Ni sacando 20 en todo alcanza el objetivo
    calculoResultado.innerHTML = `
      <div class="resultado-box inalcanzable">
        <div class="resultado-principal">
          <h3>🚫 Objetivo imposible este ciclo</h3>
          <p style="font-size: 1.2rem; margin: 15px 0; color: #f44336;">
            <strong>Incluso sacando 20</strong> en todos los cursos restantes, 
            el máximo PPG alcanzable es <strong>${ppMaximoAlcanzable.toFixed(2)}</strong>
          </p>
          <p style="font-size: 1.1rem; margin: 15px 0;">
            Tu objetivo de <strong>${ppObjetivo.toFixed(2)}</strong> es <strong>${(ppObjetivo - ppMaximoAlcanzable).toFixed(2)} puntos</strong> 
            más alto que lo matemáticamente posible.
          </p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <span class="numero" style="color: #f44336;">${ppObjetivo.toFixed(2)}</span>
            <span class="label">Tu Objetivo</span>
          </div>
          <div class="stat-card">
            <span class="numero" style="color: #FF9800;">${ppMaximoAlcanzable.toFixed(2)}</span>
            <span class="label">Máximo Posible</span>
          </div>
          <div class="stat-card">
            <span class="numero" style="color: #f44336;">${(ppObjetivo - ppMaximoAlcanzable).toFixed(2)}</span>
            <span class="label">Diferencia</span>
          </div>
        </div>
        
        <div style="background: rgba(244, 67, 54, 0.1); border: 2px solid #f44336; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <h4 style="color: #f44336; margin-bottom: 15px;">⚠️ Situación actual:</h4>
          <p style="line-height: 1.8; color: #e0e0e0;">
            Las notas de los cursos ya cursados han determinado que <strong>no es posible</strong> 
            alcanzar un PPG de ${ppObjetivo.toFixed(2)} en este ciclo académico, sin importar 
            qué tan altas sean las notas en los cursos restantes.
          </p>
        </div>
        
        <div class="estrategia-section">
          <h4>💪 Enfócate en el futuro:</h4>
          <ul class="consejos-list">
            <li><strong>Este ciclo:</strong> Da lo mejor en los cursos restantes para alcanzar el PPG máximo (${ppMaximoAlcanzable.toFixed(2)})</li>
            <li><strong>Próximo ciclo:</strong> Parte desde un mejor promedio base y establece objetivos alcanzables</li>
            <li><strong>Largo plazo:</strong> Cada ciclo es una oportunidad para mejorar tu promedio acumulado</li>
            <li><strong>Perspectiva:</strong> No te desanimes, el camino académico es largo y tienes tiempo de recuperarte</li>
          </ul>
        </div>
        
        <div class="estrategia-section">
          <h4>🎯 Recomendaciones prácticas:</h4>
          <ul class="consejos-list">
            <li>Establece un objetivo realista de <strong>${ppMaximoAlcanzable.toFixed(2)}</strong> para este ciclo</li>
            <li>Aprovecha tutorías y recursos académicos disponibles</li>
            <li>Identifica cursos difíciles y busca apoyo temprano</li>
            <li>Considera ajustar tu carga académica en el próximo ciclo si es necesario</li>
            <li>Habla con tu asesor académico sobre estrategias de recuperación</li>
          </ul>
        </div>
        
        <div style="background: rgba(33, 150, 243, 0.1); border-radius: 10px; padding: 20px; margin-top: 20px; text-align: center;">
          <p style="font-size: 1.1rem; color: #2196F3; margin: 0;">
            💡 <strong>Recuerda:</strong> El éxito académico no se mide solo en un ciclo. 
            ¡Cada semestre es una nueva oportunidad!
          </p>
        </div>
      </div>
    `;
    return;
  }
  
  // CASO 1: Si ya alcanzó el objetivo con las notas simuladas
  if (creditosSinNota === 0 && ppSimuladoActual >= ppObjetivo) {
    calculoResultado.innerHTML = `
      <div class="resultado-box alcanzado">
        <div class="resultado-principal">
          <h3>🎉 ¡Ya alcanzaste tu objetivo!</h3>
          <p style="font-size: 1.2rem; margin: 15px 0;">
            Tu PPG simulado (${ppSimuladoActual.toFixed(2)}) ya alcanza tu objetivo de ${ppObjetivo.toFixed(2)}
          </p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <span class="numero">${ppSimuladoActual.toFixed(2)}</span>
            <span class="label">PPG Simulado</span>
          </div>
          <div class="stat-card">
            <span class="numero">${ppActual.toFixed(2)}</span>
            <span class="label">PPG Actual (Fijo)</span>
          </div>
          <div class="stat-card">
            <span class="numero">${totalCreditos}</span>
            <span class="label">Total Créditos</span>
          </div>
        </div>
        
        <div class="estrategia-section">
          <h4>💪 Recomendaciones:</h4>
          <ul class="consejos-list">
            <li>¡Excelente trabajo! Has simulado todas las notas necesarias</li>
            <li>Mantén o mejora estas notas en la realidad</li>
            <li>Considera aplicar a becas académicas</li>
          </ul>
        </div>
      </div>
    `;
    return;
  }
  
  // CASO 2: Si NO hay cursos sin nota pero NO alcanza el objetivo
  if (creditosSinNota === 0 && ppSimuladoActual < ppObjetivo) {
    const diferencia = ppObjetivo - ppSimuladoActual;
    
    calculoResultado.innerHTML = `
      <div class="resultado-box inalcanzable">
        <div class="resultado-principal">
          <h3>📊 No alcanzas el objetivo con estas notas</h3>
          <p style="font-size: 1.1rem; margin: 15px 0;">
            Con las notas simuladas actuales, tu PPG es <strong style="color: #FF9800;">${ppSimuladoActual.toFixed(2)}</strong>
            <br>Tu objetivo es <strong>${ppObjetivo.toFixed(2)}</strong>
            <br>Te faltan <strong style="color: #f44336;">${diferencia.toFixed(2)}</strong> puntos
          </p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <span class="numero" style="color: #FF9800;">${ppSimuladoActual.toFixed(2)}</span>
            <span class="label">PPG Simulado</span>
          </div>
          <div class="stat-card">
            <span class="numero" style="color: #f44336;">${diferencia.toFixed(2)}</span>
            <span class="label">Te Faltan</span>
          </div>
          <div class="stat-card">
            <span class="numero">${ppObjetivo.toFixed(2)}</span>
            <span class="label">Objetivo</span>
          </div>
        </div>
        
        <div class="estrategia-section">
          <h4>💡 Para alcanzar tu objetivo, debes:</h4>
          <ul class="consejos-list">
            <li>Mejorar las notas simuladas de algunos cursos</li>
            <li>Enfócate en los cursos con más créditos para mayor impacto</li>
            <li>Experimenta en el simulador subiendo notas estratégicamente</li>
          </ul>
        </div>
        
        <div class="estrategia-section">
          <h4>📚 Cursos que puedes mejorar (ordenados por impacto):</h4>
          ${cursosConNotaSimulada
            .sort((a, b) => b.creditos - a.creditos)
            .map(curso => {
              const mejoraSugerida = Math.min(20, Math.ceil(curso.nota + (diferencia * 2)));
              const impacto = (curso.creditos / totalCreditos) * 100;
              return `
                <div class="curso-estrategia prioridad-${curso.creditos >= 4 ? 'alta' : curso.creditos >= 3 ? 'media' : 'baja'}">
                  <strong>${curso.nombre}</strong>
                  <div style="margin: 8px 0;">
                    📊 Nota actual simulada: <strong>${curso.nota}</strong>
                    <br>
                    📚 Créditos: <strong>${curso.creditos}</strong> (${impacto.toFixed(1)}% de impacto)
                    <br>
                    💡 Intenta subirla a: <strong>${mejoraSugerida}</strong>
                    ${curso.creditos >= 4 ? '<br>🔴 <strong>ALTA PRIORIDAD</strong> - Este curso tiene mayor impacto' : ''}
                  </div>
                </div>
              `;
            }).join('')}
        </div>
      </div>
    `;
    return;
  }
  
  // CASO 3: Hay cursos sin nota - Calcular nota necesaria
  const notaNecesariaPromedio = (ppObjetivo * totalCreditos - notasPonderadasConNota) / creditosSinNota;
  const notaRedondeada = redondearNota(notaNecesariaPromedio);
  
  // Sub-caso: Meta inalcanzable pero aún puede mejorar notas simuladas
  if (notaNecesariaPromedio > 20) {
    calculoResultado.innerHTML = `
      <div class="resultado-box inalcanzable">
        <div class="resultado-principal">
          <h3>😢 Meta inalcanzable con cursos restantes</h3>
          <p style="font-size: 1.1rem; margin: 15px 0;">
            Para alcanzar un PPG de <strong>${ppObjetivo.toFixed(2)}</strong>, necesitarías sacar 
            <strong style="color: #f44336;">${notaRedondeada}</strong> en los ${cursosSinNota.length} cursos sin nota.
          </p>
          <p style="color: #b3b3b3;">La nota máxima permitida es 20</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <span class="numero" style="color: #f44336;">${notaRedondeada}</span>
            <span class="label">Nota Necesaria</span>
          </div>
          <div class="stat-card">
            <span class="numero" style="color: #4CAF50;">${ppMaximoAlcanzable.toFixed(2)}</span>
            <span class="label">PPG Máximo Alcanzable</span>
          </div>
          <div class="stat-card">
            <span class="numero">${creditosSinNota}</span>
            <span class="label">Créditos sin Nota</span>
          </div>
        </div>
        
        <div class="estrategia-section">
          <h4>💡 Opciones alternativas:</h4>
          <ul class="consejos-list">
            <li><strong>Opción 1:</strong> Ajusta tu objetivo a <strong>${ppMaximoAlcanzable.toFixed(2)}</strong> (si sacas 20 en todo)</li>
            <li><strong>Opción 2:</strong> Mejora las notas simuladas actuales antes de preocuparte por los cursos sin nota</li>
            <li><strong>Opción 3:</strong> Un objetivo más realista sería <strong>${(ppMaximoAlcanzable - 0.5).toFixed(2)}</strong></li>
          </ul>
        </div>
        
        ${cursosConNotaSimulada.length > 0 ? `
          <div class="estrategia-section">
            <h4>🔧 Cursos simulados que podrías mejorar:</h4>
            ${cursosConNotaSimulada
              .filter(c => c.nota < 20)
              .sort((a, b) => b.creditos - a.creditos)
              .map(curso => `
                <div class="curso-estrategia prioridad-${curso.creditos >= 4 ? 'alta' : curso.creditos >= 3 ? 'media' : 'baja'}">
                  <strong>${curso.nombre}</strong> - Nota actual: ${curso.nota} → Intenta subirla a ${Math.min(20, curso.nota + 3)}
                  <small style="display: block; margin-top: 5px;">
                    ${curso.creditos} créditos (${((curso.creditos / totalCreditos) * 100).toFixed(1)}% de impacto)
                  </small>
                </div>
              `).join('')}
          </div>
        ` : ''}
      </div>
    `;
    return;
  }
  
  // CASO 4: Meta alcanzable - Mostrar estrategia detallada
  const cursosOrdenados = [...cursosSinNota].sort((a, b) => b.creditos - a.creditos);
  const cursosConImpacto = cursosOrdenados.map(curso => {
    const impacto = (curso.creditos / totalCreditos) * 100;
    let prioridad = 'baja';
    if (curso.creditos >= 4) prioridad = 'alta';
    else if (curso.creditos >= 3) prioridad = 'media';
    
    return { ...curso, impacto, prioridad };
  });
  
  const emoji = notaRedondeada <= 14 ? '✅' : notaRedondeada <= 17 ? '💪' : '🔥';
  const mensaje = notaRedondeada <= 14 
    ? '¡Es totalmente alcanzable con esfuerzo regular!' 
    : notaRedondeada <= 17 
    ? '¡Requiere dedicación, pero puedes lograrlo!' 
    : '¡Es un desafío importante, necesitarás máximo esfuerzo!';
  
  calculoResultado.innerHTML = `
    <div class="resultado-box">
      <div class="resultado-principal">
        <h3>${emoji} Nota Necesaria: ${notaRedondeada}</h3>
        <p style="font-size: 1.1rem; margin: 15px 0;">
          Para alcanzar un PPG de <strong style="color: #4CAF50;">${ppObjetivo.toFixed(2)}</strong>, 
          necesitas sacar <strong style="color: #2196F3;">${notaRedondeada}</strong> puntos 
          en los <strong>${cursosSinNota.length} cursos sin nota</strong>.
        </p>
        <p style="color: #b3b3b3; font-size: 0.95rem;">${mensaje}</p>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <span class="numero">${notaRedondeada}</span>
          <span class="label">Nota Requerida</span>
        </div>
        <div class="stat-card">
          <span class="numero">${cursosSinNota.length}</span>
          <span class="label">Cursos sin Nota</span>
        </div>
        <div class="stat-card">
          <span class="numero">${ppObjetivo.toFixed(2)}</span>
          <span class="label">Objetivo PPG</span>
        </div>
        <div class="stat-card">
          <span class="numero">${ppSimuladoActual > 0 ? ppSimuladoActual.toFixed(2) : ppActual.toFixed(2)}</span>
          <span class="label">PPG Actual</span>
        </div>
      </div>
      
      ${cursosConNotaSimulada.length > 0 ? `
        <div class="estrategia-section">
          <h4>✅ Notas ya simuladas (contribuyendo al objetivo):</h4>
          ${cursosConNotaSimulada
            .sort((a, b) => b.creditos - a.creditos)
            .map(curso => `
              <div style="background: rgba(76, 175, 80, 0.1); padding: 10px; margin: 5px 0; border-radius: 5px; border-left: 3px solid #4CAF50;">
                <strong>${curso.nombre}:</strong> ${curso.nota} puntos (${curso.creditos} créditos) 
                <span style="color: #4CAF50;">✓</span>
              </div>
            `).join('')}
        </div>
      ` : ''}
      
      <div class="estrategia-section">
        <h4>🎯 Estrategia para cursos sin nota:</h4>
        <p style="color: #b3b3b3; margin-bottom: 15px;">
          Estos ${cursosSinNota.length} cursos aún no tienen nota. Necesitas <strong>${notaRedondeada}</strong> en cada uno.
        </p>
        
        ${cursosConImpacto.map(curso => `
          <div class="curso-estrategia prioridad-${curso.prioridad}">
            <strong>
              ${curso.nombre}
              <span class="badge-prioridad badge-${curso.prioridad}">
                ${curso.prioridad === 'alta' ? '🔴 PRIORIDAD ALTA' : curso.prioridad === 'media' ? '🟡 PRIORIDAD MEDIA' : '🟢 PRIORIDAD BAJA'}
              </span>
            </strong>
            <div style="margin: 8px 0;">
              📊 Impacto en tu PPG: <strong>${curso.impacto.toFixed(1)}%</strong>
              <br>
              💯 Nota necesaria: <strong>${notaRedondeada}</strong> puntos
              <br>
              📚 Créditos: <strong>${curso.creditos}</strong>
            </div>
            <small>
              ${curso.prioridad === 'alta' 
                ? '⚠️ Este curso tiene el mayor impacto. Dedícale más tiempo y recursos.' 
                : curso.prioridad === 'media'
                ? '📌 Importante para tu objetivo. Mantén un esfuerzo constante.'
                : '✓ Menor impacto, pero igual importante. No lo descuides.'}
            </small>
          </div>
        `).join('')}
      </div>
      
      <div class="estrategia-section">
        <h4>💡 Consejos para alcanzar tu objetivo:</h4>
        <ul class="consejos-list">
          <li>Enfócate primero en ${cursosConImpacto[0].nombre} (mayor impacto: ${cursosConImpacto[0].impacto.toFixed(1)}%)</li>
          ${cursosConNotaSimulada.length > 0 ? '<li>Las notas simuladas actuales ya están sumando a tu objetivo</li>' : ''}
          <li>Distribuye tu tiempo de estudio según la prioridad de cada curso</li>
          <li>Establece metas semanales para cada materia</li>
          <li>Busca apoyo en temas difíciles: tutorías, grupos de estudio</li>
          <li>Usa este simulador regularmente para seguir tu progreso</li>
          ${notaRedondeada >= 17 ? '<li>⚠️ Tu objetivo requiere alto rendimiento. ¡Pero es posible!</li>' : ''}
        </ul>
      </div>
      
      <div style="background: rgba(33, 150, 243, 0.1); padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
        <p style="margin: 0; color: #b3b3b3;">
          📝 Nota: Los promedios que terminan en .5 o más se redondean hacia arriba
        </p>
      </div>
    </div>
  `;
}
    document.getElementById('ir-becas').addEventListener('click', function() {
      window.location.href = "becas.html";
    });

    const modal = document.getElementById("becasModal");
    const openModalBtn = document.getElementById("openModal");
    const closeModalBtn = document.getElementById("closeModal");
    const becasLista = document.getElementById("becasLista");

    openModalBtn.addEventListener("click", () => {
      modal.style.display = "flex";
      mostrarBecas();
    });

    closeModalBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });

    function mostrarBecas() {
      const ppg = parseFloat(document.getElementById("ppSimulado").textContent) || 0;
      const cursos = document.querySelectorAll("#cursos input");
      let desaprobado = false;

      cursos.forEach(input => {
        const nota = parseFloat(input.value);
        if (!isNaN(nota) && nota < 12) {
          desaprobado = true;
        }
      });

      becasLista.innerHTML = "";

      if (desaprobado) {
        let mensaje = document.createElement("div");
        mensaje.classList.add("beca");
        mensaje.innerHTML = `
          <strong>⚠ No puedes acceder a ninguna beca</strong><br>
          Debido a que has desaprobado al menos un curso (nota menor a 12).
        `;
        becasLista.appendChild(mensaje);
        return;
      }

      // Beca por excelencia
      if (ppg > 17) {
        let becaExcelencia = document.createElement("div");
        becaExcelencia.classList.add("beca");
        becaExcelencia.innerHTML = `
          <strong>Beca por excelencia</strong><br>
          ✔ Cumples con los requisitos (PPG mayor a 17).
        `;
        becasLista.appendChild(becaExcelencia);
      }

      // CÓDIGO QR para estudiantes con buen rendimiento (PPG >= 14)
    // CÓDIGO QR para estudiantes con buen rendimiento (PPG >= 14)
if (ppg >= 14) {
  let qrSection = document.createElement("div");
  qrSection.classList.add("qr-container");
  qrSection.innerHTML = `
    <h3>🎓 Acceso a Talleres y Cursos Gratuitos</h3>
    <p>¡Felicidades! Tu buen rendimiento académico te permite acceder a talleres exclusivos.</p>
    <div class="qr-code">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + 'talleres.html')}" alt="Código QR">
    </div>
    <p class="qr-info">📱 Escanea este código QR para registrarte en talleres y cursos gratuitos de la universidad.</p>
    <small style="display:block; margin-top:10px;">Talleres disponibles: GameLab, Desarrollo Web Avanzado, Inteligencia Artificial, Ciberseguridad y más.</small>
  `;
  becasLista.appendChild(qrSection);
}

      // Beca socioeconómica
      let becaSocio = document.createElement("div");
      becaSocio.classList.add("beca");
      becaSocio.innerHTML = `
        <strong>Beca socioeconómica</strong><br>
        ✔ Cumples con los requisitos (no tienes cursos desaprobados).<br>
        <small>Recuerda que se requiere papeles adicionales.</small>
        <small>Recuerda que la beca esta bajo disponibilidad de fechas</small>
      `;
      becasLista.appendChild(becaSocio);

      // Beca por orfandad
      let becaOrfandad = document.createElement("div");
      becaOrfandad.classList.add("beca");
      becaOrfandad.innerHTML = `
        <strong>Beca por orfandad</strong><br>
        ✔ Cumples con los requisitos (no tienes cursos desaprobados).<br>
        <small>Se requiere documentación que acredite la situación.</small>
      `;
      becasLista.appendChild(becaOrfandad);

      // Beca Cultura
      let becaCultura = document.createElement("div");
      becaCultura.classList.add("beca");
      becaCultura.innerHTML = `
        <strong>Beca Cultura</strong><br>
        ✔ Puedes postular si destacas en actividades artísticas, culturales o deportivas.
      `;
      becasLista.appendChild(becaCultura);

      // Beca PILA
      let becaPila = document.createElement("div");
      becaPila.classList.add("beca");
      becaPila.innerHTML = `
        <strong>Beca PILA</strong><br>
        ✔ Acceso a intercambios en el extranjero en universidades participantes.
      `;
      becasLista.appendChild(becaPila);
    }