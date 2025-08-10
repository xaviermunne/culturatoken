// En tu appState() de Alpine.js, actualiza estas funciones:

register() {
  if (!this.auth.email || !this.auth.password) {
    alert('Por favor, completa todos los campos.');
    return;
  }
  
  // 1. Generar wallet custodial
  const custodialWallet = `0x${Math.random().toString(16).slice(2, 42)}_custodial`;
  
  // 2. Actualizar estado del usuario
  this.user = { 
    ...this.user,
    email: this.auth.email,
    walletAddress: custodialWallet,
    balanceUSDC: 1000.00,
    balanceCTK: 50.00,
    investments: []
  };
  
  // 3. Actualizar flags de estado
  this.loggedIn = true;
  this.walletType = 'custodial';
  this.showLoginModal = false;
  
  // 4. Guardar en localStorage (ahora con estructura completa)
  localStorage.setItem('culturatoken_user', JSON.stringify({
    email: this.auth.email,
    walletAddress: custodialWallet,
    walletType: 'custodial',
    balanceUSDC: 1000.00,
    balanceCTK: 50.00,
    investments: []
  }));
  
  // 5. Resetear formulario
  this.auth = { email: '', password: '' };
  
  alert(`¡Bienvenido a CulturaToken, ${this.user.email}! Se ha creado tu wallet custodial.`);
},

login() {
  if (!this.auth.email || !this.auth.password) {
    alert('Por favor, completa todos los campos.');
    return;
  }
  
  // 1. Buscar usuario en localStorage
  const storedUser = JSON.parse(localStorage.getItem('culturatoken_user'));
  
  // 2. Verificar credenciales (simulado)
  if (storedUser && storedUser.email === this.auth.email) {
    // 3. Actualizar estado
    this.user = { ...storedUser };
    this.loggedIn = true;
    this.walletType = storedUser.walletType || 'custodial';
    this.showLoginModal = false;
    
    alert(`¡Bienvenido de nuevo, ${this.user.email}!`);
  } else {
    alert('Credenciales incorrectas o usuario no registrado.');
  }
  
  // 4. Resetear formulario
  this.auth = { email: '', password: '' };
},

// Asegúrate que init() cargue correctamente:
init() {
  const savedUser = localStorage.getItem('culturatoken_user');
  if (savedUser) {
    try {
      const userData = JSON.parse(savedUser);
      this.user = { 
        ...this.user, // Valores por defecto
        ...userData   // Datos guardados
      };
      this.loggedIn = true;
      this.walletType = userData.walletType || null;
    } catch (e) {
      console.error("Error cargando usuario:", e);
    }
  }
}