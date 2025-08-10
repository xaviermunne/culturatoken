// Inicialización de componentes mejorada con manejo de errores
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Verificar que GSAP está cargado
        if (typeof gsap !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            
            // Animación mejorada para el hero con checks de elementos
            const heroBg = document.querySelector('.hero-bg');
            if (heroBg) {
                gsap.from(heroBg, {
                    opacity: 0,
                    y: 50,
                    duration: 1,
                    ease: 'power3.out'
                });
            }
            
            // Animación optimizada para secciones con Intersection Observer como fallback
            const sections = document.querySelectorAll('section');
            if (sections.length > 0) {
                if (typeof ScrollTrigger !== 'undefined') {
                    gsap.utils.toArray('section').forEach(section => {
                        gsap.from(section, {
                            scrollTrigger: {
                                trigger: section,
                                start: 'top 80%',
                                toggleActions: 'play none none none',
                                markers: false // Desactivado en producción
                            },
                            opacity: 0,
                            y: 50,
                            duration: 0.8,
                            ease: 'power3.out'
                        });
                    });
                } else {
                    // Fallback con Intersection Observer
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                gsap.to(entry.target, {
                                    opacity: 1,
                                    y: 0,
                                    duration: 0.8,
                                    ease: 'power3.out'
                                });
                                observer.unobserve(entry.target);
                            }
                        });
                    }, { threshold: 0.1 });
                    
                    sections.forEach(section => {
                        gsap.set(section, { opacity: 0, y: 50 });
                        observer.observe(section);
                    });
                }
            }
        }

        // Swiper mejorado con verificación de existencia
        const swiperContainer = document.querySelector('.swiper-container');
        if (swiperContainer && typeof Swiper !== 'undefined') {
            const swiper = new Swiper('.swiper-container', {
                slidesPerView: 1,
                spaceBetween: 20,
                loop: true, // Nuevo: permite loop infinito
                grabCursor: true, // Nuevo: cursor de agarre
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                    dynamicBullets: true, // Nuevo: bullets dinámicos
                },
                breakpoints: {
                    640: {
                        slidesPerView: 1,
                    },
                    768: {
                        slidesPerView: 2,
                    },
                    1024: {
                        slidesPerView: 3,
                    },
                },
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true, // Nuevo: pausa al hover
                },
                keyboard: {
                    enabled: true, // Nuevo: navegación con teclado
                },
                effect: 'slide', // Nuevo: efecto de transición
                speed: 600, // Nuevo: velocidad de transición
            });
        }

        // Gráfico CTK mejorado con verificación y animación
        const ctkChartEl = document.getElementById('ctkChart');
        if (ctkChartEl && typeof Chart !== 'undefined') {
            const ctx = ctkChartEl.getContext('2d');
            const ctkChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Inversores', 'Artistas', 'Reserva', 'Equipo'],
                    datasets: [{
                        data: [60, 20, 10, 10],
                        backgroundColor: [
                            '#764ba2',
                            '#4f46e5',
                            '#ec4899',
                            '#f59e0b'
                        ],
                        borderWidth: 0,
                        hoverOffset: 10, // Nuevo: efecto hover
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    animation: {
                        animateScale: true, // Nuevo: animación de escala
                        animateRotate: true // Nuevo: animación de rotación
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: { // Nuevo: tooltips mejorados
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${context.raw}%`;
                                }
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error en la inicialización:', error);
    }
});

// Alpine.js State Management mejorado con Type Checking y más funcionalidades
function appState() {
    return {
        // State mejorado con valores por defecto más claros
        loggedIn: false,
        isRegistering: false,
        showLoginModal: false,
        showInvestmentModal: false,
        showUsdcModal: false,
        showRoyaltiesModal: false, // Nuevo modal para royalties
        phantomConnected: false,
        walletType: null,
        loading: false, // Nuevo estado para cargas
        error: null, // Nuevo estado para errores
        
        // User Data mejorado con validaciones
        user: {
            email: '',
            walletAddress: '',
            balanceUSDC: 1000.00,
            balanceCTK: 50.00,
            royalties: 125.50,
            position: 15,
            totalInvested: 1250.00,
            investments: [],
            preferences: { // Nuevo: preferencias del usuario
                favoriteGenres: ['teatro', 'circo'],
                riskTolerance: 'medium', // low, medium, high
                investmentGoal: 'diversification' // growth, income, diversification
            }
        },
        
        // Auth Form con validación mejorada
        auth: { 
            email: '', 
            password: '',
            confirmPassword: '', // Nuevo campo para registro
            termsAccepted: false // Nuevo: aceptación de términos
        },

        // Investment Data mejorado
        investment: { 
            name: '', 
            price: 0, 
            amount: 100, 
            network: 'Polygon',
            showId: null,
            paymentMethod: 'usdc' // Nuevo: método de pago
        },
        
        // Shows Data con más información
        shows: [
            { 
                id: 1, 
                name: "Aetherium", 
                genre: "circo", 
                roi: 15, 
                funded: 78, 
                tokens: 1000, 
                pricePerToken: 50,
                description: "Un espectáculo de circo futurista que combina acrobacias con tecnología holográfica.",
                riskLevel: 'medium',
                duration: '6 meses',
                artists: ['Circo del Sol', 'Hologram Arts']
            },
            { 
                id: 2, 
                name: "Luz de Luna", 
                genre: "teatro", 
                roi: 10, 
                funded: 45, 
                tokens: 800, 
                pricePerToken: 40,
                description: "Obra de teatro clásico con un giro moderno y participación interactiva del público.",
                riskLevel: 'low',
                duration: '12 meses',
                artists: ['Teatro Nacional', 'Drama Collective']
            },
            // Nuevo show añadido
            { 
                id: 3, 
                name: "Digital Dreams", 
                genre: "danza", 
                roi: 18, 
                funded: 32, 
                tokens: 1200, 
                pricePerToken: 60,
                description: "Fusión de danza contemporánea con realidad aumentada.",
                riskLevel: 'high',
                duration: '8 meses',
                artists: ['Modern Dance Co.', 'AR Creators']
            }
        ],
        
        // AI Recommendations mejorado
        aiRecommendations: [],
        aiLoading: false, // Nuevo: estado de carga para AI

        // Fiat On-Ramp Data con más opciones
        fiat: { 
            amount: 100,
            currency: 'USD', // Nuevo: selección de moneda
            paymentMethod: 'credit_card' // Nuevo: método de pago
        },

        // Leaderboard Data paginado
        leaderboard: [
            { position: 1, name: 'CriptoArteLover', invested: 42500, ctk: 8500 },
            { position: 2, name: 'TeatroDigital', invested: 38200, ctk: 7640 },
            { position: 3, name: 'DanzaToken', invested: 35750, ctk: 7150 },
            { position: 4, name: 'CircoBlockchain', invested: 28500, ctk: 5700 },
            { position: 5, name: 'ArteTokenizado', invested: 27650, ctk: 5530 },
            { position: 6, name: 'CulturaFi', invested: 25400, ctk: 5080 },
            { position: 7, name: 'TokenTheatre', invested: 23100, ctk: 4620 },
            { position: 8, name: 'DramaCoin', invested: 21500, ctk: 4300 },
            { position: 9, name: 'OperaDAO', invested: 19800, ctk: 3960 },
            { position: 10, name: 'BalletToken', invested: 18750, ctk: 3750 }
        ],
        currentLeaderboardPage: 1, // Nuevo: paginación
        itemsPerPage: 5, // Nuevo: items por página

        // Nuevo: Propuestas DAO
        daoProposals: [
            {
                id: 1,
                title: "Nuevo sistema de recompensas CTK",
                description: "Propuesta para aumentar las recompensas CTK en un 10% para inversiones a largo plazo.",
                votesFor: 1250,
                votesAgainst: 320,
                deadline: "2023-12-15",
                userVoted: null // 'for', 'against', null
            },
            {
                id: 2,
                title: "Expansión a nuevos géneros artísticos",
                description: "Incluir proyectos de arte digital y NFT en la plataforma.",
                votesFor: 980,
                votesAgainst: 450,
                deadline: "2023-12-20",
                userVoted: null
            }
        ],

        // Métodos mejorados con manejo de errores
        init() {
            try {
                // Cargar datos del usuario si está logueado
                const userData = localStorage.getItem('culturatoken_user');
                if (userData) {
                    const savedUser = JSON.parse(userData);
                    
                    // Validar datos del usuario
                    if (this.validateUserData(savedUser)) {
                        this.user = { ...this.user, ...savedUser };
                        this.loggedIn = true;
                        
                        // Determinar tipo de wallet
                        this.detectWalletType();
                    } else {
                        console.warn('Datos de usuario inválidos, limpiando almacenamiento');
                        localStorage.removeItem('culturatoken_user');
                    }
                }
                
                // Cargar recomendaciones AI si está logueado
                if (this.loggedIn) {
                    this.getAIRecommendations();
                }
            } catch (error) {
                console.error('Error en init:', error);
                this.error = 'Error al cargar los datos del usuario';
            }
        },
        
        // Nuevo: Validación de datos del usuario
        validateUserData(userData) {
            const requiredFields = ['email', 'walletAddress', 'balanceUSDC', 'balanceCTK'];
            return requiredFields.every(field => userData[field] !== undefined);
        },
        
        // Nuevo: Detección mejorada de tipo de wallet
        detectWalletType() {
            if (!this.user.walletAddress) {
                this.walletType = null;
                return;
            }
            
            if (this.user.walletAddress.startsWith('0x')) {
                this.walletType = this.user.walletAddress.includes('custodial') ? 'custodial' : 'metamask';
            } else if (this.user.walletAddress.startsWith('sol')) {
                this.walletType = 'phantom';
            } else {
                this.walletType = 'other';
            }
        },
        
        // ===== WALLETS ===== //
        // Registro con wallet custodial mejorado
        async registerWithEmail() {
            try {
                this.loading = true;
                this.error = null;
                
                // Validación mejorada
                if (!this.auth.email || !this.validateEmail(this.auth.email)) {
                    this.error = 'Por favor, introduce un email válido.';
                    return;
                }
                
                if (!this.auth.password || this.auth.password.length < 8) {
                    this.error = 'La contraseña debe tener al menos 8 caracteres.';
                    return;
                }
                
                if (this.auth.password !== this.auth.confirmPassword) {
                    this.error = 'Las contraseñas no coinciden.';
                    return;
                }
                
                if (!this.auth.termsAccepted) {
                    this.error = 'Debes aceptar los términos y condiciones.';
                    return;
                }
                
                // Simulación: Generar dirección custodial más segura
                const custodialWallet = `0x${Array.from({length: 40}, () => 
                    Math.floor(Math.random() * 16).toString(16)).join('')}_custodial`;
                
                // Crear usuario con datos iniciales
                this.user = { 
                    ...this.user,
                    email: this.auth.email,
                    walletAddress: custodialWallet,
                    createdAt: new Date().toISOString() // Nuevo: fecha de creación
                };
                
                this.walletType = 'custodial';
                this.loggedIn = true;
                this.showLoginModal = false;
                this.resetAuthForm();
                
                localStorage.setItem('culturatoken_user', JSON.stringify(this.user));
                
                // Mostrar feedback visual (podría ser un toast en lugar de alert)
                this.showToast('¡Registro exitoso! Se ha creado tu wallet custodial.');
                
                // Cargar recomendaciones iniciales
                this.getAIRecommendations();
            } catch (error) {
                console.error('Error en registro:', error);
                this.error = 'Error durante el registro. Por favor, intenta nuevamente.';
            } finally {
                this.loading = false;
            }
        },
        
        // Nuevo: Validación de email
        validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        
        // Nuevo: Resetear formulario de auth
        resetAuthForm() {
            this.auth = { 
                email: '', 
                password: '',
                confirmPassword: '',
                termsAccepted: false
            };
        },
        
        // Conexión con Metamask mejorada (Polygon)
        async connectMetamask() {
            try {
                this.loading = true;
                this.error = null;
                
                if (!window.ethereum) {
                    this.error = '¡Instala Metamask para continuar!';
                    return;
                }
                
                // Verificar red Polygon
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                if (chainId !== '0x89') { // 0x89 es Polygon
                    try {
                        await window.ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: '0x89' }],
                        });
                    } catch (switchError) {
                        // Si no existe la red, agregarla
                        if (switchError.code === 4902) {
                            try {
                                await window.ethereum.request({
                                    method: 'wallet_addEthereumChain',
                                    params: [{
                                        chainId: '0x89',
                                        chainName: 'Polygon Mainnet',
                                        nativeCurrency: {
                                            name: 'MATIC',
                                            symbol: 'MATIC',
                                            decimals: 18
                                        },
                                        rpcUrls: ['https://polygon-rpc.com/'],
                                        blockExplorerUrls: ['https://polygonscan.com/']
                                    }],
                                });
                            } catch (addError) {
                                this.error = 'No se pudo agregar la red Polygon.';
                                return;
                            }
                        } else {
                            this.error = 'Error cambiando a Polygon.';
                            return;
                        }
                    }
                }
                
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (!accounts || accounts.length === 0) {
                    this.error = 'No se detectaron cuentas en Metamask.';
                    return;
                }
                
                this.user.walletAddress = accounts[0];
                this.walletType = 'metamask';
                this.loggedIn = true;
                
                localStorage.setItem('culturatoken_user', JSON.stringify(this.user));
                this.showToast(`Conectado a Metamask: ${this.shortenAddress(accounts[0])}`);
                
                // Escuchar cambios de cuenta
                window.ethereum.on('accountsChanged', (newAccounts) => {
                    if (newAccounts.length === 0) {
                        this.logout();
                    } else {
                        this.user.walletAddress = newAccounts[0];
                        localStorage.setItem('culturatoken_user', JSON.stringify(this.user));
                        this.showToast('Cuenta de Metamask actualizada.');
                    }
                });
            } catch (error) {
                console.error("Error conectando Metamask:", error);
                this.error = this.getFriendlyErrorMessage(error);
            } finally {
                this.loading = false;
            }
        },
        
        // Conexión con Phantom mejorada (Solana)
        async connectPhantom() {
            try {
                this.loading = true;
                this.error = null;
                
                if (!window.solana || !window.solana.isPhantom) {
                    this.error = '¡Instala Phantom Wallet para continuar!';
                    return;
                }
                
                const response = await window.solana.connect();
                if (!response.publicKey) {
                    this.error = 'No se pudo obtener la clave pública.';
                    return;
                }
                
                this.user.walletAddress = response.publicKey.toString();
                this.walletType = 'phantom';
                this.loggedIn = true;
                this.phantomConnected = true;
                
                localStorage.setItem('culturatoken_user', JSON.stringify(this.user));
                this.showToast(`Conectado a Phantom: ${this.shortenAddress(response.publicKey.toString())}`);
                
                // Escuchar desconexión
                window.solana.on('disconnect', () => {
                    this.logout();
                });
            } catch (error) {
                console.error("Error conectando Phantom:", error);
                this.error = this.getFriendlyErrorMessage(error);
            } finally {
                this.loading = false;
            }
        },
        
        // Nuevo: Acortar dirección para mostrar
        shortenAddress(address, chars = 4) {
            if (!address) return '';
            return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
        },
        
        // Nuevo: Mostrar notificación toast
        showToast(message, duration = 3000) {
            // Implementación básica - en un caso real podrías usar un componente toast
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg';
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        },
        
        // Nuevo: Mensajes de error amigables
        getFriendlyErrorMessage(error) {
            if (error.code === 4001) {
                return 'Has rechazado la conexión con la wallet.';
            } else if (error.message.includes('already pending')) {
                return 'Ya hay una solicitud pendiente. Por favor, revisa tu wallet.';
            } else {
                return 'Error al conectar con la wallet. Por favor, intenta nuevamente.';
            }
        },
        
        // Logout mejorado
        logout() {
            try {
                // Limpiar listeners de eventos
                if (window.ethereum && window.ethereum.removeListener) {
                    window.ethereum.removeListener('accountsChanged', () => {});
                }
                
                if (window.solana && window.solana.removeListener) {
                    window.solana.removeListener('disconnect', () => {});
                }
                
                // Resetear estado
                this.loggedIn = false;
                this.user = {
                    email: '',
                    walletAddress: '',
                    balanceUSDC: 1000.00,
                    balanceCTK: 50.00,
                    royalties: 125.50,
                    position: 15,
                    totalInvested: 1250.00,
                    investments: [],
                    preferences: {
                        favoriteGenres: ['teatro', 'circo'],
                        riskTolerance: 'medium',
                        investmentGoal: 'diversification'
                    }
                };
                this.walletType = null;
                this.phantomConnected = false;
                
                localStorage.removeItem('culturatoken_user');
                this.showToast('Sesión cerrada correctamente.');
            } catch (error) {
                console.error('Error en logout:', error);
                this.error = 'Error al cerrar sesión.';
            }
        },

        // ===== INVERSIONES MEJORADAS ===== //
        openInvestmentModal(showId) {
            if (!this.loggedIn) {
                this.error = 'Por favor, inicia sesión para invertir.';
                this.showLoginModal = true;
                return;
            }
            
            const show = this.shows.find(s => s.id === showId);
            if (!show) {
                this.error = 'Show no encontrado.';
                return;
            }
            
            // Verificar si ya está totalmente financiado
            if (show.funded >= 100) {
                this.error = 'Este show ya ha alcanzado su meta de financiación.';
                return;
            }
            
            this.investment = { 
                name: show.name, 
                price: show.pricePerToken, 
                amount: 100, 
                network: 'Polygon',
                showId: showId,
                paymentMethod: 'usdc',
                maxInvestment: (show.tokens * show.pricePerToken) * (1 - show.funded/100) // Nuevo: máximo invertible
            };
            
            this.showInvestmentModal = true;
            this.error = null;
        },

        closeInvestmentModal() {
            this.showInvestmentModal = false;
            this.error = null;
        },

        // Inversión mejorada con validaciones y simulaciones más realistas
        async confirmInvestment() {
            try {
                this.loading = true;
                this.error = null;
                
                // Validaciones
                if (this.investment.amount < 100) {
                    this.error = 'La inversión mínima es de 100 USDT/USDC.';
                    return;
                }
                
                if (this.investment.amount > this.investment.maxInvestment) {
                    this.error = `El monto excede el disponible para este show (máximo: $${this.investment.maxInvestment.toFixed(2)}).`;
                    return;
                }
                
                const show = this.shows.find(s => s.id === this.investment.showId);
                if (!show) {
                    this.error = 'Show no encontrado.';
                    return;
                }
                
                // Verificar saldo según método de pago
                if (this.investment.paymentMethod === 'usdc' && this.user.balanceUSDC < this.investment.amount) {
                    this.error = 'Saldo insuficiente de USDT/USDC.';
                    this.showUsdcModal = true;
                    return;
                } else if (this.investment.paymentMethod === 'ctk') {
                    const ctkValue = this.investment.amount / 2.5; // 1 CTK = $2.50
                    if (this.user.balanceCTK < ctkValue) {
                        this.error = 'Saldo insuficiente de CTK.';
                        return;
                    }
                }
                
                // Simular delay de transacción
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Calcular tokens comprados
                const tokensBought = parseFloat((this.investment.amount / show.pricePerToken).toFixed(2));
                
                // Actualizar balances según método de pago
                if (this.investment.paymentMethod === 'usdc') {
                    this.user.balanceUSDC -= this.investment.amount;
                } else {
                    const ctkSpent = this.investment.amount / 2.5;
                    this.user.balanceCTK -= ctkSpent;
                }
                
                // Recompensar con CTK (1 CTK por cada $5 invertido)
                const ctkEarned = this.investment.amount / 5;
                this.user.balanceCTK += ctkEarned;
                
                // Actualizar inversión total para el leaderboard
                this.user.totalInvested += this.investment.amount;
                this.updateLeaderboardPosition();
                
                // Añadir a la lista de inversiones
                this.user.investments.push({
                    id: Date.now(),
                    name: show.name,
                    tokens: tokensBought,
                    totalValue: this.investment.amount,
                    date: new Date().toISOString(),
                    showId: show.id,
                    roi: show.roi,
                    status: 'active' // Nuevo: estado de la inversión
                });
                
                // Actualizar porcentaje financiado del show
                const previousFunded = show.funded;
                show.funded = Math.min(100, show.funded + (this.investment.amount / (show.tokens * show.pricePerToken)) * 100);
                
                // Si alcanzó el 100%, notificar
                if (previousFunded < 100 && show.funded >= 100) {
                    this.showToast(`¡El show ${show.name} ha alcanzado su meta de financiación!`);
                }
                
                // Guardar cambios
                localStorage.setItem('culturatoken_user', JSON.stringify(this.user));
                
                // Mostrar resumen de la inversión
                this.showToast(
                    `Inversión exitosa! ${tokensBought} tokens de ${show.name} ` +
                    `(ROI estimado: ${show.roi}%). Ganaste ${ctkEarned.toFixed(2)} CTK.`
                );
                
                this.closeInvestmentModal();
                
                // Actualizar recomendaciones AI
                this.getAIRecommendations();
            } catch (error) {
                console.error('Error en inversión:', error);
                this.error = 'Error al procesar la inversión. Por favor, intenta nuevamente.';
            } finally {
                this.loading = false;
            }
        },
        
        // Nuevo: Actualizar posición en leaderboard
        updateLeaderboardPosition() {
            // Simular cálculo de posición basado en inversión total
            const minPosition = 5;
            const maxPosition = 20;
            const positionRange = maxPosition - minPosition;
            
            // Posición inversamente proporcional a la inversión total
            const normalizedInvestment = Math.min(this.user.totalInvested, 100000) / 100000;
            this.user.position = Math.floor(
                maxPosition - (normalizedInvestment * positionRange)
            );
        },
        
        // ===== ASISTENTE AI MEJORADO ===== //
        async getAIRecommendations() {
            try {
                this.aiLoading = true;
                
                // Simular llamada a API con delay
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Filtrar basado en preferencias del usuario
                this.aiRecommendations = this.shows.filter(show => {
                    // Coincidencia con géneros favoritos
                    const genreMatch = this.user.preferences.favoriteGenres.includes(show.genre);
                    
                    // Coincidencia con tolerancia al riesgo
                    let riskMatch = true;
                    if (this.user.preferences.riskTolerance === 'low') {
                        riskMatch = show.riskLevel === 'low';
                    } else if (this.user.preferences.riskTolerance === 'medium') {
                        riskMatch = show.riskLevel !== 'high';
                    }
                    
                    // Coincidencia con objetivo de inversión
                    let goalMatch = true;
                    if (this.user.preferences.investmentGoal === 'income') {
                        goalMatch = show.roi >= 12; // ROI alto para ingresos
                    } else if (this.user.preferences.investmentGoal === 'growth') {
                        goalMatch = show.roi >= 8; // ROI moderado para crecimiento
                    }
                    
                    return genreMatch && riskMatch && goalMatch && show.funded < 100;
                });
                
                // Ordenar por mejor coincidencia
                this.aiRecommendations.sort((a, b) => {
                    // Priorizar ROI más alto
                    if (this.user.preferences.investmentGoal === 'income') {
                        return b.roi - a.roi;
                    }
                    // Priorizar menor riesgo para objetivos conservadores
                    if (this.user.preferences.riskTolerance === 'low') {
                        return a.riskLevel === 'low' ? -1 : 1;
                    }
                    // Default: ordenar por porcentaje financiado (oportunidades que se agotan)
                    return b.funded - a.funded;
                });
            } catch (error) {
                console.error('Error obteniendo recomendaciones:', error);
                this.error = 'Error al obtener recomendaciones.';
            } finally {
                this.aiLoading = false;
            }
        },
        
        // ===== DAO VOTING MEJORADO ===== //
        async voteForProposal(proposalId, vote) {
            try {
                if (!this.loggedIn) {
                    this.error = 'Por favor, inicia sesión para votar.';
                    return;
                }
                
                // Verificar si ya votó
                const proposal = this.daoProposals.find(p => p.id === proposalId);
                if (proposal.userVoted !== null) {
                    this.error = 'Ya has votado en esta propuesta.';
                    return;
                }
                
                this.loading = true;
                
                // Simular delay de transacción en blockchain
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Actualizar votos
                if (vote === 'for') {
                    proposal.votesFor += this.user.balanceCTK; // 1 CTK = 1 voto
                    proposal.userVoted = 'for';
                } else {
                    proposal.votesAgainst += this.user.balanceCTK;
                    proposal.userVoted = 'against';
                }
                
                this.showToast(`Voto registrado: ${vote === 'for' ? 'A favor' : 'En contra'} de la propuesta #${proposalId}`);
            } catch (error) {
                console.error('Error al votar:', error);
                this.error = 'Error al registrar tu voto.';
            } finally {
                this.loading = false;
            }
        },
        
        // Nuevo: Ver estado de la propuesta
        getProposalStatus(proposal) {
            const totalVotes = proposal.votesFor + proposal.votesAgainst;
            if (totalVotes === 0) return 'Sin votos';
            
            const forPercentage = (proposal.votesFor / totalVotes) * 100;
            if (forPercentage >= 60) return 'Aprobada';
            if (forPercentage <= 40) return 'Rechazada';
            return 'En disputa';
        },

        // ===== USDC PURCHASE MEJORADO ===== //
        async buyUsdc() {
            try {
                this.loading = true;
                this.error = null;
                
                if (this.fiat.amount < 100) {
                    this.error = 'El monto mínimo de compra es $100.';
                    return;
                }
                
                if (this.fiat.amount > 10000) {
                    this.error = 'El monto máximo por transacción es $10,000.';
                    return;
                }
                
                // Simular delay de procesamiento
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Simular comisión variable (1-3%)
                const feePercentage = 1 + Math.random() * 2;
                const receivedUsdc = this.fiat.amount * (1 - feePercentage/100);
                
                this.user.balanceUSDC += receivedUsdc;
                
                localStorage.setItem('culturatoken_user', JSON.stringify(this.user));
                
                this.showToast(
                    `Compra exitosa! Has añadido ${receivedUsdc.toFixed(2)} USDT/USDC ` +
                    `(comisión del ${feePercentage.toFixed(2)}%).`
                );
                
                this.showUsdcModal = false;
                this.fiat.amount = 100;
            } catch (error) {
                console.error('Error en compra de USDC:', error);
                this.error = 'Error al procesar la compra. Por favor, intenta nuevamente.';
            } finally {
                this.loading = false;
            }
        },
        
        // ===== ROYALTIES MEJORADO ===== //
        openRoyaltiesModal() {
            if (this.user.royalties <= 0) {
                this.error = 'No tienes regalías disponibles para reclamar.';
                return;
            }
            this.showRoyaltiesModal = true;
        },
        
        async claimRoyalties(tokenType) {
            try {
                this.loading = true;
                this.error = null;
                
                if (this.user.royalties <= 0) {
                    this.error = 'No tienes regalías para reclamar.';
                    return;
                }

                const amount = this.user.royalties;
                
                // Simular delay de transacción
                await new Promise(resolve => setTimeout(resolve, 800));
                
                if (tokenType === 'USDC') {
                    this.user.balanceUSDC += amount;
                    this.showToast(`Has reclamado $${amount.toFixed(2)} en USDT/USDC.`);
                } else {
                    // CTK tiene un bonus del 10%
                    const ctkReceived = (amount / 2.5) * 1.1;
                    this.user.balanceCTK += ctkReceived;
                    this.showToast(
                        `Has reclamado ${ctkReceived.toFixed(2)} CTK ` +
                        `(equivalente a $${(amount * 1.1).toFixed(2)} con el bonus del 10%).`
                    );
                }
                
                this.user.royalties = 0;
                localStorage.setItem('culturatoken_user', JSON.stringify(this.user));
                this.showRoyaltiesModal = false;
            } catch (error) {
                console.error('Error reclamando regalías:', error);
                this.error = 'Error al reclamar regalías. Por favor, intenta nuevamente.';
            } finally {
                this.loading = false;
            }
        },

        // ===== DISTRIBUCIÓN DE ROYALTIES (Admin) MEJORADO ===== //
        async distributeRoyalties(showId, amount) {
            try {
                this.loading = true;
                this.error = null;
                
                if (amount <= 0) {
                    this.error = 'El monto debe ser positivo.';
                    return;
                }
                
                // Simular delay de procesamiento
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Encontrar inversores del show
                const investors = this.user.investments.filter(inv => inv.showId === showId);
                if (investors.length === 0) {
                    this.error = 'No hay inversores para este show.';
                    return;
                }
                
                const totalInvested = investors.reduce((sum, inv) => sum + inv.totalValue, 0);
                const show = this.shows.find(s => s.id === showId);

                // Distribuir royalties (98% inversores, 2% plataforma)
                investors.forEach(inv => {
                    const share = (inv.totalValue / totalInvested) * (amount * 0.98);
                    // En un caso real, se transferiría a sus wallets
                    this.user.royalties += share;
                });

                // Registrar distribución
                if (show) {
                    if (!show.royaltyDistributions) {
                        show.royaltyDistributions = [];
                    }
                    show.royaltyDistributions.push({
                        date: new Date().toISOString(),
                        amount: amount,
                        investorsCount: investors.length
                    });
                }
                
                this.showToast(
                    `Royalties distribuidos: $${amount.toFixed(2)} USDC ` +
                    `(${investors.length} inversores beneficiados).`
                );
            } catch (error) {
                console.error('Error distribuyendo royalties:', error);
                this.error = 'Error al distribuir royalties.';
            } finally {
                this.loading = false;
            }
        },
        
        // ===== FUNCIONES DE UTILIDAD ===== //
        // Nuevo: Formatear números como moneda
        formatCurrency(amount, currency = 'USD') {
            return new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        },
        
        // Nuevo: Formatear porcentaje
        formatPercentage(value) {
            return `${parseFloat(value).toFixed(1)}%`;
        },
        
        // Nuevo: Obtener shows del usuario
        getUserShows() {
            const investedShowIds = [...new Set(this.user.investments.map(inv => inv.showId))];
            return this.shows.filter(show => investedShowIds.includes(show.id));
        },
        
        // Nuevo: Paginación para leaderboard
        getPaginatedLeaderboard() {
            const start = (this.currentLeaderboardPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.leaderboard.slice(start, end);
        },
        
        // Nuevo: Cambiar página del leaderboard
        changeLeaderboardPage(page) {
            this.currentLeaderboardPage = page;
        }
    };
}