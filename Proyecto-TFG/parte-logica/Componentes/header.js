class HeaderComponent extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const token = localStorage.getItem('token');
        let user = null;
        try { user = JSON.parse(localStorage.getItem('user')); } catch {}

        this._shadow.innerHTML = `
        <style>

        :host{
            display:block;
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        header{
            width:100%;
            background: linear-gradient(440deg, #2a17cf, #00d5ff);
            box-shadow: 0 2px 14px rgba(0,0,0,.18);
        }

        header > div{
            max-width:1200px;
            margin:auto;
            padding:12px 16px;
            display:flex;
            justify-content:space-between;
            align-items:center;
            position:relative;
        }

        #div-logo{
            display:flex;
            align-items:center;
            gap:12px;
        }

        #logo{
            height:78px;
            transition:.25s ease;
        }

        #logo:hover{
            transform: scale(1.05);
        }

        #nombre_academia{
            font-family: Georgia, serif;
            font-size:18px;
            font-weight:700;
            font-style:italic;
            color:white;
            line-height:1.1;
        }

        a{
            text-decoration:none;
        }

        #menu-header{
            display:flex;
            gap:22px;
            align-items:center;
            position:relative;
        }

        .link-encabezado{
            color:white;
            font-weight:600;
            position:relative;
            transition:.2s ease;
            white-space:nowrap;
        }

        .link-encabezado:hover{
            opacity:.85;
        }

        .link-encabezado::after{
            content:"";
            position:absolute;
            bottom:-4px;
            left:0;
            width:0%;
            height:2px;
            background:white;
            transition:.25s ease;
        }

        .link-encabezado:hover::after{
            width:100%;
        }

        .auth-name{
            background: rgba(255,255,255,0.15);
            padding:4px 14px;
            border-radius:20px;
            font-size:14px;
            position: relative;
        }

        .auth-name:hover::after{
            width:0%;
        }

        .theme-toggle{
            background: rgba(255,255,255,0.12);
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            transition: 0.3s ease;
            line-height: 1;
        }

        .theme-toggle:hover{
            background: rgba(255,255,255,0.25);
            transform: rotate(15deg);
        }

        .cart-btn{
            background: rgba(255,255,255,0.12);
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 17px;
            transition: 0.3s ease;
            position: relative;
            text-decoration: none;
        }

        .cart-btn:hover{
            background: rgba(255,255,255,0.25);
        }

        .cart-badge{
            position: absolute;
            top: -4px;
            right: -4px;
            min-width: 16px;
            height: 16px;
            background: #ef4444;
            color: white;
            font-size: 10px;
            font-weight: 700;
            border-radius: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
            box-shadow: 0 2px 6px rgba(239,68,68,0.4);
            pointer-events: none;
        }

        .cart-panel{
            position: fixed;
            top: 0;
            right: -380px;
            width: 360px;
            height: 100vh;
            background: white;
            box-shadow: -10px 0 40px rgba(0,0,0,0.15);
            z-index: 9999;
            transition: right 0.35s ease;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .cart-panel.open{ right: 0; }

        .cart-panel-inner{
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 24px 24px 0 24px;
            overflow: hidden;
        }

        .cart-overlay{
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 9998;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.35s ease;
        }

        .cart-overlay.open{ opacity: 1; pointer-events: auto; }

        .cart-panel h2{
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 20px;
            color: #1e293b;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .cart-panel .close-cart{
            font-size: 24px;
            cursor: pointer;
            color: #94a3b8;
            background: none;
            border: none;
            line-height: 1;
        }

        .cart-panel .cart-items{
            flex: 1;
            overflow-y: auto;
            display: block;
            padding-right: 4px;
            min-height: 0;
        }

        .cart-panel .cart-items::-webkit-scrollbar { width: 4px; }
        .cart-panel .cart-items::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

        .cart-panel .cart-item{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 14px;
            background: #f8fafc;
            border-radius: 12px;
        }

        .cart-panel .cart-item .ci-name{
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
        }

        .cart-panel .cart-item .ci-price{
            font-size: 14px;
            font-weight: 700;
            color: #2a17cf;
        }

        .cart-panel .cart-item .ci-remove{
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            font-size: 18px;
            padding: 0 4px;
            line-height: 1;
        }

        .cart-panel .cart-footer{
            padding: 16px 24px 24px 24px;
            border-top: 1px solid #e2e8f0;
            background: white;
        }

        .cart-panel .cart-total{
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
        }

        .cart-panel .btn-checkout{
            display: block;
            text-align: center;
            padding: 14px;
            background: linear-gradient(135deg, #2a17cf, #1a0d8a);
            color: white;
            border: none;
            border-radius: 50px;
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            text-decoration: none;
            transition: 0.3s;
            box-shadow: 0 4px 15px rgba(42,23,207,0.25);
        }

        .cart-panel .btn-checkout:hover{ transform: translateY(-2px); }

        .cart-panel .cart-empty{
            text-align: center;
            padding: 40px 0;
            color: #94a3b8;
            font-size: 14px;
        }

        [data-theme="dark"] .cart-panel{ background: #1a2332; }
        [data-theme="dark"] .cart-panel-inner h2{ color: #f1f5f9; }
        [data-theme="dark"] .cart-panel .cart-item{ background: #0f172a; }
        [data-theme="dark"] .cart-panel .cart-item .ci-name{ color: #f1f5f9; }
        [data-theme="dark"] .cart-panel .cart-total{ color: #f1f5f9; }
        [data-theme="dark"] .cart-panel .cart-footer{ background: #1a2332; border-top-color: #334155; }
        [data-theme="dark"] .cart-panel .close-cart{ color: #64748b; }
        [data-theme="dark"] .cart-panel .cart-items::-webkit-scrollbar-thumb { background: #334155; }

        .notif-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            min-width: 18px;
            height: 18px;
            background: #ef4444;
            color: white;
            font-size: 11px;
            font-weight: 700;
            border-radius: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 5px;
            box-shadow: 0 2px 6px rgba(239,68,68,0.4);
            pointer-events: none;
        }

        .btn-login{
            background: white;
            color: #2a17cf !important;
            padding: 8px 22px !important;
            border-radius: 50px !important;
            font-weight: 700 !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
            transition: 0.3s ease !important;
        }

        .btn-login:hover{
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(0,0,0,0.25) !important;
            opacity: 1 !important;
        }

        .btn-login::after{ display:none !important; }

        .boton-menu-movil{
            display:none;
            font-size:30px;
            color:white;
            cursor:pointer;
            user-select:none;
            padding:6px 10px;
            line-height:1;
        }

        .boton-menu-movil:hover{
            background: rgba(255,255,255,.12);
            border-radius:8px;
        }

        @media (max-width: 900px){

            .boton-menu-movil{
                display:block;
            }

            #menu-header{
                position:absolute;
                top:100%;
                right:0;
                width:240px;
                background:linear-gradient(440deg, #1f00cf, #4207b1);
                backdrop-filter: blur(16px);
                flex-direction:column;
                align-items:center;
                gap:10px;
                padding:10px 0;
                border-radius: 0 0 14px 14px;
                box-shadow: 0 16px 32px rgba(0,0,0,.25);
                border: 1px solid rgba(255,255,255,.18);
                opacity:0;
                transform: translateY(-10px);
                pointer-events:none;
                margin:0;
            }

            #menu-header.active{
                opacity:1;
                transform: translateY(0);
                pointer-events:auto;
            }

            .link-encabezado{
                width:100%;
                text-align:center;
                padding:10px 0;
                border-radius:8px;
            }

            .link-encabezado:hover{
                background: rgba(255, 255, 255, 0.14);
            }

            .btn-login{
                width:auto !important;
                padding:10px 28px !important;
                margin:6px auto !important;
                display:inline-block !important;
            }

            .btn-login:hover{
                background: white !important;
            }

            #logo{
                height:64px;
            }

            #nombre_academia{
                font-size:15px;
            }
        }

        @media (max-width: 480px){
            #menu-header{
                width:50vw;
            }

            #logo{
                height:52px;
            }

            #nombre_academia{
                font-size:13px;
            }
        }

        </style>

        <header>
            <div>

                <div id="div-logo">
                    <a href="./Index.html">
                        <img id="logo" src="./imagenes/logo.png" alt="Logo">
                    </a>
                    <a href="./Index.html">
                        <div id="nombre_academia">
                            ACADEMIA <br> LORANCA
                        </div>
                    </a>
                </div>

                <div class="boton-menu-movil" id="menuToggle">☰</div>

                <menu id="menu-header">
                    <button class="theme-toggle" id="themeToggle" title="Cambiar tema">🌙</button>
                    <a class="link-encabezado" href="./Index.html">Inicio</a>
                    <a class="link-encabezado" href="./grupos.html">Cursos</a>
                    <a class="link-encabezado" href="./Index.html#servicios">Servicios</a>
                    <a class="link-encabezado" href="#horarios">Horarios</a>
                    <a class="link-encabezado" href="./contactos.html">Contacto</a>
                    <a class="cart-btn" id="cartToggle" title="Carrito">
                        🛒<span class="cart-badge" id="cartBadge" style="display:none">0</span>
                    </a>
                    ${token ? `
                        <a class="link-encabezado auth-name" href="${user?.role === 'admin' ? './admin/dashboard.html' : './panel.html'}">
                            👤 ${user?.username || 'Usuario'}
                            <span class="notif-badge" id="notifBadge" style="display:none">0</span>
                        </a>
                        <a class="link-encabezado" href="#" id="logoutBtnHeader">Cerrar Sesión</a>
                    ` : `
                        <a class="link-encabezado btn-login" href="./login.html">Iniciar Sesión</a>
                    `}
                </menu>

            </div>
        </header>

        <div class="cart-overlay" id="cartOverlay"></div>
        <div class="cart-panel" id="cartPanel">
            <div class="cart-panel-inner">
                <h2>🛒 Carrito <button class="close-cart" id="closeCart">✕</button></h2>
                <div class="cart-items" id="cartItems"></div>
            </div>
            <div class="cart-footer">
                <div class="cart-total" id="cartTotal">Total: 0,00 €</div>
                <a class="btn-checkout" id="checkoutBtn" href="./checkout.html">Finalizar pedido</a>
            </div>
        </div>
        `;

        const shadow = this._shadow;
        const btn = shadow.getElementById("menuToggle");
        const menu = shadow.getElementById("menu-header");

        function setTheme(dark) {
            document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
            localStorage.setItem('theme', dark ? 'dark' : 'light');
            const tbtn = shadow.getElementById('themeToggle');
            if (tbtn) tbtn.textContent = dark ? '☀️' : '🌙';
        }

        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = saved ? saved === 'dark' : prefersDark;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        const themeBtn = shadow.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.textContent = isDark ? '☀️' : '🌙';
            themeBtn.addEventListener('click', () => {
                const dark = document.documentElement.getAttribute('data-theme') !== 'dark';
                setTheme(dark);
            });
        }

        /* Cart */
        const isAdminUser = user?.role === 'admin';

        function renderCart() {
            if (isAdminUser) return;
            const cart = (function(){ try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; } })();
            const badge = shadow.getElementById('cartBadge');
            const itemsEl = shadow.getElementById('cartItems');
            const totalEl = shadow.getElementById('cartTotal');
            if (badge) {
                badge.textContent = cart.length || '';
                badge.style.display = cart.length ? 'flex' : 'none';
            }
            if (!itemsEl) return;
            if (!cart.length) {
                itemsEl.innerHTML = '<div class="cart-empty">Tu carrito está vacío</div>';
                if (totalEl) totalEl.textContent = 'Total: 0,00 €';
                return;
            }
            itemsEl.innerHTML = cart.map((item, i) => `
                <div class="cart-item">
                    <div>
                        <div class="ci-name">${item.course_name}</div>
                        <div style="font-size:12px;color:#94a3b8">${item.teacher || ''}</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px">
                        <span class="ci-price">${(item.price || 0).toFixed(2).replace('.', ',')} €</span>
                        <button class="ci-remove" data-index="${i}">✕</button>
                    </div>
                </div>
            `).join('');
            if (totalEl) totalEl.textContent = `Total: ${cart.reduce((s,i) => s + (i.price||0), 0).toFixed(2).replace('.', ',')} €`;
            itemsEl.querySelectorAll('.ci-remove').forEach(btn => {
                btn.onclick = () => {
                    const idx = parseInt(btn.dataset.index);
                    const c = (function(){ try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; } })();
                    c.splice(idx, 1);
                    localStorage.setItem('cart', JSON.stringify(c));
                    renderCart();
                    window.dispatchEvent(new CustomEvent('cart-changed', { detail: c }));
                };
            });
        }

        function openCart() {
            if (isAdminUser) return;
            shadow.getElementById('cartPanel')?.classList.add('open');
            shadow.getElementById('cartOverlay')?.classList.add('open');
            renderCart();
        }

        function closeCart() {
            shadow.getElementById('cartPanel')?.classList.remove('open');
            shadow.getElementById('cartOverlay')?.classList.remove('open');
        }

        /* Remove cart elements entirely if user is admin */
        if (isAdminUser) {
            const ct = shadow.getElementById('cartToggle');
            if (ct) ct.remove();
            const cp = shadow.getElementById('cartPanel');
            if (cp) cp.remove();
            const co = shadow.getElementById('cartOverlay');
            if (co) co.remove();
        } else {
            shadow.getElementById('cartToggle')?.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
            shadow.getElementById('closeCart')?.addEventListener('click', closeCart);
            shadow.getElementById('cartOverlay')?.addEventListener('click', closeCart);
            window.addEventListener('cart-changed', () => renderCart());
            renderCart();
        }

        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            menu.classList.toggle("active");
        });

        menu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                menu.classList.remove("active");
            });
        });

        document.addEventListener("click", (e) => {
            if (!e.composedPath().includes(this)) {
                menu.classList.remove("active");
            }
        });

        const logoutBtn = this._shadow.getElementById("logoutBtnHeader");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = './Index.html';
            });
        }

        const badge = this._shadow.getElementById("notifBadge");
        if (badge && token) {
          (async () => {
            try {
              const res = await fetch('/api/notifications', {
                headers: { 'Authorization': 'Bearer ' + token }
              });
              if (!res.ok) throw new Error();
              const data = await res.json();
              if (data.total > 0) {
                badge.textContent = data.total > 99 ? '99+' : data.total;
                badge.style.display = 'flex';
              }
            } catch {}
          })();
        }

        const horariosLink = this._shadow.querySelector('.link-encabezado[href="#horarios"]');
        horariosLink?.addEventListener("click", (e) => {
            e.preventDefault();
            const footer = document.querySelector("footer-componente");
            if (footer) {
                const target = footer.shadowRoot?.querySelector("#horarios");
                target?.scrollIntoView({ behavior: "smooth" });
            }
        });
    }
}

customElements.define("header-componente", HeaderComponent);
