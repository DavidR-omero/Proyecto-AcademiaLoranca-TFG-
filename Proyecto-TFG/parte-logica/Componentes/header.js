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
        }

        .auth-name:hover::after{
            width:0%;
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
                    <a class="link-encabezado" href="./Index.html">Inicio</a>
                    <a class="link-encabezado" href="./grupos.html">Cursos</a>
                    <a class="link-encabezado" href="./Index.html#servicios">Servicios</a>
                    <a class="link-encabezado" href="#horarios">Horarios</a>
                    <a class="link-encabezado" href="./contactos.html">Contacto</a>
                    ${token ? `
                        <a class="link-encabezado auth-name" href="${user?.role === 'admin' ? './admin/dashboard.html' : './panel.html'}">
                            👤 ${user?.username || 'Usuario'}
                        </a>
                        <a class="link-encabezado" href="#" id="logoutBtnHeader">Cerrar Sesión</a>
                    ` : `
                        <a class="link-encabezado btn-login" href="./login.html">Iniciar Sesión</a>
                    `}
                </menu>

            </div>
        </header>
        `;

        const btn = this._shadow.getElementById("menuToggle");
        const menu = this._shadow.getElementById("menu-header");

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
