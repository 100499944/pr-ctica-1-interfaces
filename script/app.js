/* script/app.js
   EP02 – Flujo completo:
   - Home (index.html): login con localStorage
   - Registro (registro.html): guarda usuario en localStorage y redirige a versionb.html
*/

(function () {
  // ---------- Helpers de almacenamiento ----------
  function getUsers() {
    try { return JSON.parse(localStorage.getItem('users')) || {}; }
    catch { return {}; }
  }
  function setUsers(usersObj) {
    localStorage.setItem('users', JSON.stringify(usersObj || {}));
  }
  function setSessionUser(login) {
    localStorage.setItem('sessionUser', String(login));
  }

  // (Opcional) leer archivo como DataURL (para foto de perfil)
  function readFileAsDataURL(file) {
    return new Promise((res, rej) => {
      if (!file) return res(null);
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }

  // ---------- Home: interceptar login ----------
  document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.widget.login form');
    if (loginForm) {
      const userInput = loginForm.querySelector('input[name="user"]');
      const passInput = loginForm.querySelector('input[name="pass"]');

      loginForm.addEventListener('submit', (ev) => {
        ev.preventDefault(); // no navegar por el action si falla
        const login = (userInput?.value || '').trim();
        const pwd = (passInput?.value || '').trim();

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
    }
  });

  // ---------- Registro: guardar usuario y pasar a Version b ----------
  document.addEventListener('DOMContentLoaded', () => {
    // Solo si estamos en registro.html (existe el formulario con esos campos)
    const regForm = document.querySelector('section.panel.widget.form form');
    if (!regForm) return;

    // Botón "Guardar datos y acceder" es un <a href="versionb.html"> dentro del form
    const goBtn = regForm.querySelector('a[href="versionb.html"]');
    if (!goBtn) return;

    // Campos (coinciden con tus IDs/names del HTML que pegaste)
    const $nombre    = regForm.querySelector('#nombre');
    const $apellidos = regForm.querySelector('#apellidos');
    const $email     = regForm.querySelector('#email');
    const $email2    = regForm.querySelector('#email2');
    const $nac       = regForm.querySelector('#nacimiento');
    const $login     = regForm.querySelector('#login');
    const $pass      = regForm.querySelector('#pass');
    const $foto      = regForm.querySelector('#foto');
    const $priv      = regForm.querySelector('input[type="checkbox"][required]');

    goBtn.addEventListener('click', async (ev) => {
      ev.preventDefault(); // evitamos que navegue sin guardar

      // Validaciones mínimas
      if (!$nombre.value.trim() || !$apellidos.value.trim() ||
          !$email.value.trim()  || !$email2.value.trim() ||
          !$nac.value           || !$login.value.trim()  || !$pass.value.trim()) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
      }
      if ($email.value.trim() !== $email2.value.trim()) {
        alert('El correo y su confirmación no coinciden.');
        $email2.focus();
        return;
      }
      if (!$priv.checked) {
        alert('Debes aceptar la política de privacidad.');
        return;
      }

      const users = getUsers();
      const loginKey = $login.value.trim();

      if (users[loginKey]) {
        alert('Ese login ya existe. Elige otro.');
        $login.focus();
        return;
      }

      // (Opcional) convertimos la foto a DataURL para guardarla
      const avatarDataURL = await readFileAsDataURL($foto?.files?.[0] || null);

      // Guardamos el usuario (contraseña en claro por simplicidad en la práctica)
      users[loginKey] = {
        password: $pass.value,
        nombre: $nombre.value.trim(),
        apellidos: $apellidos.value.trim(),
        email: $email.value.trim(),
        nacimiento: $nac.value,
        avatar: avatarDataURL // puede ser null si no se sube
      };
      setUsers(users);
      setSessionUser(loginKey);

      // Redirigimos a Versión b como pide el enunciado
      window.location.href = 'versionb.html';
    });
  });

})();
