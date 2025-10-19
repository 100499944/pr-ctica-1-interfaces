/* script/app.js – EP02
   - Home: login con localStorage (ya lo teníamos)
   - Registro: validaciones estrictas + guardar + mensaje + sesión + redirect
*/

(function () {
  // ------------------ Helpers almacenamiento ------------------
  function getUsers() {
    try { return JSON.parse(localStorage.getItem('users')) || {}; }
    catch { return {}; }
  }
  function setUsers(obj) {
    localStorage.setItem('users', JSON.stringify(obj || {}));
  }
  function setSessionUser(login) {
    localStorage.setItem('sessionUser', String(login));
  }
  function isLoggedIn() {
  return !!localStorage.getItem('sessionUser');
  }
  function readFileAsDataURL(file) {
    return new Promise((res, rej) => {
      if (!file) return res(null);
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }

  // ------------------ Validadores ------------------
  const reNombre     = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]{3,}$/; // >=3 letras (permite acentos/espacios)
  const reSoloLetras = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'-]+$/;
  const reEmail      = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  // Password: >=8, >=2 dígitos, >=1 especial, >=1 mayús, >=1 minús
  const rePass = /^(?=(?:.*\d){2,})(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*[A-Z])(?=.*[a-z]).{8,}$/;

  function validarNombre(v) {
    return reNombre.test(v.trim());
  }
  // Apellidos: al menos DOS “cadenas” de >=3 letras cada una
  function validarApellidos(v) {
    const piezas = v.trim().split(/\s+/).filter(Boolean);
    if (piezas.length < 2) return false;
    return piezas.every(p => reSoloLetras.test(p) && p.length >= 3);
  }
  function validarEmail(v) {
    return reEmail.test(v.trim());
  }
  function validarNacimiento(v) {
    // Evitar datos irreales: entre 1900-01-01 y hoy
    if (!v) return false;
    const d = new Date(v + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return false;
    const min = new Date('1900-01-01T00:00:00');
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    return d >= min && d <= hoy;
  }
  function validarLogin(v) {
    return String(v || '').trim().length >= 5;
  }
  function validarPass(v) {
    return rePass.test(String(v || ''));
  }
  function validarArchivo(file) {
    if (!file) return false;
    const okTypes = ['image/webp', 'image/png', 'image/jpeg'];
    return okTypes.includes(file.type);
  }

  // ------------------ HOME: login ------------------
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.widget.login form');
    if (!form) return; // no estamos en Home

    const userInput = form.querySelector('input[name="user"]');
    const passInput = form.querySelector('input[name="pass"]');

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const login = (userInput?.value || '').trim();
      const pwd   = (passInput?.value  || '').trim();

      if (!login || !pwd) {
        alert('Por favor, introduce Usuario y Contraseña.');
        return;
      }
      const users = getUsers();
      const record = users[login];
      if (record && record.password === pwd) {
        setSessionUser(login);
        window.location.href = 'versionb.html';
      } else {
        alert('Inicio de sesión no válido. Regístrate o revisa tus credenciales.');
      }
    });
  });

  // === Carrusel (Home y Versión b): 3+ packs, flechas cíclicas, auto cada 2s ===
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.carrusel .carrusel-inner').forEach(inner => {
            const packs = Array.from(inner.querySelectorAll('.pack'));
            if (packs.length < 3) return; // el enunciado pide mínimo 3
            const prevBtn = inner.querySelector('.arrow.prev');
            const nextBtn = inner.querySelector('.arrow.next');

            let i = 0;
            function show(idx) {
                packs.forEach((p, k) => { p.style.display = (k === idx) ? '' : 'none'; });
                i = idx;
            }
            function next() { show((i + 1) % packs.length); }
            function prev() { show((i - 1 + packs.length) % packs.length); }

            // arranque
            show(0);

            // botones
            nextBtn?.addEventListener('click', () => { next(); restart(); });
            prevBtn?.addEventListener('click', () => { prev(); restart(); });

            // auto-rotación cada 2s
            let timer = setInterval(next, 2000);
            const restart = () => { clearInterval(timer); timer = setInterval(next, 2000); };

            // (opcional) pausar al pasar el ratón
            inner.addEventListener('mouseenter', () => clearInterval(timer));
            inner.addEventListener('mouseleave', () => restart());
        });
    });

    // === Compra: pinta el pack seleccionado (?pack=andes|paris|tanzania) ===
    document.addEventListener('DOMContentLoaded', () => {
        const onCompra = /compra\.html/i.test(location.pathname) || /compra\.html/i.test(location.href);
        if (!onCompra) return;

        const params = new URLSearchParams(location.search);
        const code = (params.get('pack') || 'andes').toLowerCase();

        const PACKS = {
            andes: {
                img: 'images/pack_andes.jpg',
                title: 'Ruta Andina: Cusco – Uyuni – Atacama',
                desc: 'Ruta clásica por la cordillera andina: Cusco y Valle Sagrado, tour de 3 días por el Salar de Uyuni y lagunas altiplánicas, y San Pedro de Atacama con Valle de la Luna y géiseres del Tatio. Incluye traslados, alojamientos seleccionados y guía de visados/pasos fronterizos Perú–Bolivia–Chile.',
                price: '1.200€'
            },
            paris: {
                img: 'images/paris.jpg',
                title: 'París con mochila',
                desc: 'Escapada urbana pensada para mochileros: 4 noches en hostel céntrico cercano al metro, pase de transporte ilimitado y ruta autoguiada por los imprescindibles (Île de la Cité, Louvre exterior, Trocadéro y Torre Eiffel, Montmartre y barrios con buen ambiente nocturno). Consejos para comer barato y horarios óptimos.',
                price: '680€'
            },
            tanzania: {
                img: 'images/tanzania.jpg',
                title: 'Safari Serengeti y Ngorongoro',
                desc: 'Aventura en 4x4 compartido con conductor y guía locales: jornadas de safari en Parque Nacional Serengeti y cráter de Ngorongoro, con acampada en zonas habilitadas, pensión completa y tasas de entrada incluidas. Mejor época recomendada y checklist de equipo ligero para acampada.',
                price: '2.150€'
            }
        };

        const data = PACKS[code] || PACKS.andes;

        const $img   = document.getElementById('packImg');
        const $title = document.getElementById('packTitle');
        const $desc  = document.getElementById('packDesc');
        const $price = document.getElementById('packPrice');

        if ($img)   { $img.src = data.img; $img.alt = data.title; }
        if ($title) $title.textContent = data.title;
        if ($desc)  $desc.textContent  = data.desc;
        if ($price) $price.textContent = `Precio: ${data.price}`;
    });


  // ------------------ REGISTRO: validaciones + guardar ------------------
  document.addEventListener('DOMContentLoaded', () => {
    // Form de registro tal y como lo pegaste (IDs ya presentes)
    const regForm = document.querySelector('section.panel.widget.form form');
    if (!regForm) return; // no estamos en registro

    const $nombre    = regForm.querySelector('#nombre');
    const $apellidos = regForm.querySelector('#apellidos');
    const $email     = regForm.querySelector('#email');
    const $email2    = regForm.querySelector('#email2');
    const $nac       = regForm.querySelector('#nacimiento');
    const $login     = regForm.querySelector('#login');
    const $pass      = regForm.querySelector('#pass');
    const $foto      = regForm.querySelector('#foto');
    const $priv      = regForm.querySelector('#chkPriv');
    const $btn       = regForm.querySelector('#btnGuardar');

    // Habilitar / deshabilitar botón según privacidad
    function syncBoton() {
      if ($priv?.checked) { $btn?.removeAttribute('disabled'); }
      else { $btn?.setAttribute('disabled', ''); }
    }
    $priv?.addEventListener('change', syncBoton);
    syncBoton();

    // Función para marcar campo inválido (accesible)
    function marcarInvalido(input, msg) {
      if (!input) return;
      input.setAttribute('aria-invalid', 'true');
      input.setCustomValidity(msg || 'Dato inválido');
      input.reportValidity(); // muestra tooltip nativo
    }
    function limpiarInvalido(input) {
      if (!input) return;
      input.removeAttribute('aria-invalid');
      input.setCustomValidity('');
    }

    async function onGuardar() {
      // Validaciones una a una según enunciado
      const nombreV = $nombre.value.trim();
      if (!validarNombre(nombreV)) {
        marcarInvalido($nombre, 'El nombre debe tener al menos 3 letras.');
        return;
      } else limpiarInvalido($nombre);

      const apellV = $apellidos.value.trim();
      if (!validarApellidos(apellV)) {
        marcarInvalido($apellidos, 'Introduce al menos dos apellidos de 3 letras cada uno.');
        return;
      } else limpiarInvalido($apellidos);

      const emailV = $email.value.trim();
      if (!validarEmail(emailV)) {
        marcarInvalido($email, 'Formato de email no válido (nombre@dominio.ext).');
        return;
      } else limpiarInvalido($email);

      const email2V = $email2.value.trim();
      if (email2V !== emailV) {
        marcarInvalido($email2, 'El correo de confirmación debe coincidir.');
        return;
      } else limpiarInvalido($email2);

      const nacV = $nac.value;
      if (!validarNacimiento(nacV)) {
        marcarInvalido($nac, 'Fecha de nacimiento no válida.');
        return;
      } else limpiarInvalido($nac);

      const loginV = $login.value.trim();
      if (!validarLogin(loginV)) {
        marcarInvalido($login, 'El login debe tener al menos 5 caracteres.');
        return;
      } else limpiarInvalido($login);

      const passV = $pass.value;
      if (!validarPass(passV)) {
        marcarInvalido($pass, 'La contraseña debe tener 8+ caracteres, 2 números, 1 especial, 1 mayúscula y 1 minúscula.');
        return;
      } else limpiarInvalido($pass);

      const file = $foto.files?.[0];
      if (!validarArchivo(file)) {
        // Solo webp, png, jpg
        marcarInvalido($foto, 'Adjunta imagen .webp, .png o .jpg.');
        return;
      } else limpiarInvalido($foto);

      if (!$priv.checked) {
        alert('Debes aceptar la política de privacidad.');
        return;
      }

      // Comprobar duplicidad de login
      const users = getUsers();
      if (users[loginV]) {
        marcarInvalido($login, 'Ese login ya existe. Elige otro.');
        return;
      }

      // Convertir imagen a DataURL para guardarla (opcional)
      const avatar = await readFileAsDataURL(file);

      // Guardar
      users[loginV] = {
        password: passV,
        nombre: nombreV,
        apellidos: apellV,
        email: emailV,
        nacimiento: nacV,
        avatar
      };
      setUsers(users);
      setSessionUser(loginV);

      // Mensaje de éxito + redirección
      alert('Registro completado correctamente. ¡Bienvenida/o!');
      window.location.href = 'versionb.html';
    }

    $btn?.addEventListener('click', onGuardar);

    // (opcional) Validación “al salir del campo” para feedback temprano
    $nombre?.addEventListener('blur', () => validarNombre($nombre.value) ? limpiarInvalido($nombre) : marcarInvalido($nombre, 'El nombre debe tener al menos 3 letras.'));
    $apellidos?.addEventListener('blur', () => validarApellidos($apellidos.value) ? limpiarInvalido($apellidos) : marcarInvalido($apellidos, 'Dos apellidos de 3+ letras cada uno.'));
    $email?.addEventListener('blur', () => validarEmail($email.value) ? limpiarInvalido($email) : marcarInvalido($email, 'Formato de email no válido.'));
    $email2?.addEventListener('blur', () => ($email2.value.trim() === $email.value.trim()) ? limpiarInvalido($email2) : marcarInvalido($email2, 'Debe coincidir con el email.'));
    $nac?.addEventListener('blur', () => validarNacimiento($nac.value) ? limpiarInvalido($nac) : marcarInvalido($nac, 'Fecha no válida.'));
    $login?.addEventListener('blur', () => validarLogin($login.value) ? limpiarInvalido($login) : marcarInvalido($login, 'Mínimo 5 caracteres.'));
    $pass?.addEventListener('blur', () => validarPass($pass.value) ? limpiarInvalido($pass) : marcarInvalido($pass, '8+, 2 números, 1 especial, 1 mayús, 1 minús.'));
    $foto?.addEventListener('change', () => validarArchivo($foto.files?.[0]) ? limpiarInvalido($foto) : marcarInvalido($foto, 'Imagen .webp, .png o .jpg.'));
  });

    // === COMPRA (versión c) — mensajes inline + éxito + borrar limpio ===
    document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formCompra');
    if (!form) return;

    const $fullName   = form.querySelector('#fullName');
    const $email      = form.querySelector('#emailCompra');
    const $cardType   = form.querySelector('#cardType');
    const $cardNumber = form.querySelector('#cardNumber');
    const $cardHolder = form.querySelector('#cardHolder');
    const $expMonth   = form.querySelector('#expMonth');
    const $cvv        = form.querySelector('#cvv');
    const $btnComprar = form.querySelector('#btnComprar');
    const $btnBorrar  = form.querySelector('#btnBorrar');

    const reEmail      = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const reCardNumber = /^(?:\d{13}|\d{15}|\d{16}|\d{19})$/;
    const reCVV        = /^\d{3}$/;

    // Inserta/recupera contenedor de error bajo el campo
    function msgEl(input) {
        let holder = input.parentElement.querySelector('.msg-error');
        if (!holder) {
        holder = document.createElement('div');
        holder.className = 'msg-error';
        input.parentElement.appendChild(holder);
        }
        return holder;
    }
    function showError(input, text) {
        input.classList.add('invalid');
        const el = msgEl(input);
        el.textContent = text;
        el.style.display = 'block';
    }
    function clearError(input) {
        input.classList.remove('invalid');
        const el = input.parentElement.querySelector('.msg-error');
        if (el) { el.textContent = ''; el.style.display = 'none'; }
    }
    function clearAllErrors() {
        [$fullName,$email,$cardType,$cardNumber,$cardHolder,$expMonth,$cvv].forEach(clearError);
    }

    // Min dinámico para caducidad = mes actual (YYYY-MM)
    (function setMinExp() {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        $expMonth.min = `${y}-${m}`;
    })();

    // Normaliza número (sin espacios)
    $cardNumber.addEventListener('input', () => {
        $cardNumber.value = $cardNumber.value.replace(/\s+/g, '');
    });

    // Validación completa al pulsar Comprar
    $btnComprar.addEventListener('click', () => {
        clearAllErrors();
        let ok = true;

        if ($fullName.value.trim().length < 3) {
        showError($fullName, 'El nombre completo debe tener al menos 3 caracteres.');
        ok = false;
        }
        if (!reEmail.test($email.value.trim())) {
        showError($email, 'Formato de email no válido (nombre@dominio.ext).');
        ok = false;
        }
        if (!$cardType.value) {
        showError($cardType, 'Selecciona el tipo de tarjeta.');
        ok = false;
        }
        const num = $cardNumber.value.trim();
        if (!reCardNumber.test(num)) {
        showError($cardNumber, 'El número debe tener 13, 15, 16 o 19 dígitos (solo números).');
        ok = false;
        }
        if ($cardHolder.value.trim().length < 3) {
        showError($cardHolder, 'El titular debe tener al menos 3 caracteres.');
        ok = false;
        }
        if (!$expMonth.value) {
        showError($expMonth, 'Indica la fecha de caducidad.');
        ok = false;
        } else {
        const [yy, mm] = $expMonth.value.split('-').map(Number);
        const now = new Date();
        const curY = now.getFullYear();
        const curM = now.getMonth() + 1;
        const notExpired = (yy > curY) || (yy === curY && mm >= curM);
        if (!notExpired) {
            showError($expMonth, 'La tarjeta está caducada.');
            ok = false;
        }
        }
        if (!reCVV.test($cvv.value.trim())) {
        showError($cvv, 'El CVV debe tener 3 dígitos.');
        ok = false;
        }

        if (ok) {
        alert('Compra realizada'); // notificación de éxito (requisito)
        // (opcional) form.reset(); clearAllErrors(); // si quieres limpiar tras comprar
        }
    });

    // Borrar: limpia valores + mensajes + estados
    $btnBorrar.addEventListener('click', () => {
        form.reset();
        clearAllErrors();
        // reponer min dinámico por si algún navegador lo borra
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        $expMonth.min = `${y}-${m}`;
    });
    });

    // === Versión b (área de usuaria) ===
    document.addEventListener('DOMContentLoaded', () => {
    // ¿Estamos en versionb?
    const isVersionB = /(^|\/)versionb\.html(\?|#|$)/i.test(location.pathname) || /versionb\.html/i.test(location.href);
    if (!isVersionB) return;

    // ---- Acceso: requiere sesión ----
    const sessionUser = localStorage.getItem('sessionUser');
    if (!sessionUser) {
        // sin sesión: fuera a Home
        location.replace('index.html?needLogin=1');
        return;
    }

    // ---- Cargar datos de usuario para perfil ----
    const users = (() => { try { return JSON.parse(localStorage.getItem('users')) || {}; } catch { return {}; } })();
    const u = users[sessionUser] || {};
    const profName = document.getElementById('profName');
    const profUser = document.getElementById('profUser');
    const profAvatar = document.getElementById('profAvatar');

    if (profName) profName.textContent = [u.nombre, u.apellidos].filter(Boolean).join(' ') || sessionUser;
    if (profUser) profUser.textContent = '@' + sessionUser;
    if (profAvatar && u.avatar) profAvatar.src = u.avatar; // DataURL guardada en registro
    
    const bannerName = document.getElementById('bannerName');
    if (bannerName) bannerName.textContent = (u.nombre && u.nombre.trim()) ? u.nombre : sessionUser;

    // ---- Cerrar sesión (modal confirmar/cancelar) ----
    const btnLogout = document.getElementById('btnLogout');
    const modal = document.getElementById('logoutModal');
    const btnCancel = document.getElementById('cancelLogout');
    const btnConfirm = document.getElementById('confirmLogout');

    const showModal = () => { modal.style.display = 'flex'; };
    const hideModal = () => { modal.style.display = 'none'; };

    btnLogout?.addEventListener('click', showModal);
    btnCancel?.addEventListener('click', hideModal);
    modal?.addEventListener('click', (e) => { if (e.target === modal) hideModal(); }); // cerrar al clicar fuera
    btnConfirm?.addEventListener('click', () => {
        localStorage.removeItem('sessionUser');
        // (opcional) también podrías limpiar más cosas si hace falta
        location.href = 'index.html';
    });

    // ---- Últimos consejos (persistentes) ----
    // Estructura localStorage['tips'] = [{id, title, desc, url, ts}, ...]
    function getTips() {
        try { return JSON.parse(localStorage.getItem('tips')) || []; }
        catch { return []; }
    }
    function setTips(arr) {
    localStorage.setItem('tips', JSON.stringify(arr || []));
    }

    // Render: siempre los 3 más recientes (ordenados por ts desc)
    function renderTips() {
        const list = document.getElementById('tipsList');
        if (!list) return;
        const tips = getTips().slice().sort((a, b) => b.ts - a.ts);
        list.innerHTML = '';
        tips.slice(0, 3).forEach(t => {
            const li = document.createElement('li');
            const a  = document.createElement('a');
            a.href = t.url || '#';
            a.textContent = t.title;
            li.appendChild(a);
            list.appendChild(li);
        });
    }

    // Pintar al entrar
    renderTips();

    // ---- Formulario para añadir consejos ----
    const form = document.getElementById('tipsForm');
    const tipTitle = document.getElementById('tipTitle');
    const tipDesc  = document.getElementById('tipDesc');
    const btnTip   = document.getElementById('btnTip');

    function showInlineError(input, msg) {
        let holder = input.parentElement.querySelector('.msg-error');
        if (!holder) {
            holder = document.createElement('div');
            holder.className = 'msg-error';
            input.parentElement.appendChild(holder);
        }
        holder.textContent = msg;
        holder.style.display = 'block';
        input.classList.add('invalid');
    }
    function clearInlineError(input) {
        input.classList.remove('invalid');
        const el = input.parentElement.querySelector('.msg-error');
        if (el) { el.textContent = ''; el.style.display = 'none'; }
    }

    btnTip?.addEventListener('click', () => {
        if (!form) return;

        clearInlineError(tipTitle);
        clearInlineError(tipDesc);

        const title = (tipTitle.value || '').trim();
        const desc  = (tipDesc.value  || '').trim();

        let ok = true;
        if (title.length < 15) { showInlineError(tipTitle, 'El título debe tener al menos 15 caracteres.'); ok = false; }
        if (desc.length  < 30) { showInlineError(tipDesc,  'La descripción debe tener al menos 30 caracteres.'); ok = false; }
        if (!ok) return;

        const tips = getTips();
        const now  = Date.now();
        tips.unshift({
            id:  now,
            title,
            desc,
            url: `consejo.html?id=${now}`, // página “no real” (válido por enunciado)
            ts:  now
        });
        setTips(tips);

        renderTips();   // repinta top-3
        form.reset();   // limpia campos
    });
    });
})();
