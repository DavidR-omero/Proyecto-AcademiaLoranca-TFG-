class WhatsappComponent extends HTMLElement {
    constructor(){
        super();
        this._shadow = this.attachShadow ({mode: 'open'});
    }

    connectedCallback(){
        this._shadow.innerHTML = `<style>
        
        .whatsapp-container {
            position: fixed;
            bottom: 15px;
            right: 20px;
            z-index: 1000;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }

        .boton-whatsapp {
            background-color: #25d366;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            transition: transform 0.3s;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:30px;
        }

        .boton-whatsapp:hover {
            transform: scale(1.1);
        }

        .div-whatsapp {
            display: none;
            width: 360px;
            max-width: 90vw;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.18);
            margin-bottom: 15px;
            overflow: hidden;
            animation: fadeIn 0.3s ease;
            max-height: 80vh;
            display: none;
            flex-direction: column;
        }
        .div-whatsapp.open { display: flex; }

        .header {
            background: #075e54;
            color: white;
            padding: 16px 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            font-size: 15px;
            flex-shrink: 0;
        }

        .body {
            padding: 18px 18px 30px 18px;
            overflow-y: auto;
            flex: 1;
            scrollbar-width: thin;
        }
        .body p {
            margin: 0 0 12px 0;
            font-size: 14px;
            color: #334155;
            line-height: 1.4;
        }

        .wa-section-title {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #94a3b8;
            font-weight: 600;
            margin: 16px 0 8px 0;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
        }

        .wa-option {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            margin-bottom: 8px;
            border: 2px solid #e2e8f0;
            border-radius: 14px;
            text-decoration: none;
            color: #1e293b;
            font-weight: 600;
            font-size: 14px;
            transition: 0.25s;
            background: #f8fafc;
        }
        .wa-option:hover {
            border-color: #25d366;
            background: #f0fdf4;
            transform: translateX(4px);
        }
        .wa-option .wa-num {
            font-weight: 400;
            font-size: 12px;
            color: #64748b;
        }
        .wa-option .wa-sub {
            font-weight: 400;
            font-size: 11px;
            color: #94a3b8;
            margin-top: 1px;
        }
        .wa-icon { font-size: 22px; flex-shrink: 0; }

        .wa-course-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            margin-bottom: 6px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            text-decoration: none;
            color: #1e293b;
            font-size: 13px;
            font-weight: 500;
            transition: 0.2s;
            background: #fff;
        }
        .wa-course-item:hover {
            border-color: #25d366;
            background: #f0fdf4;
        }
        .wa-course-item .wa-course-name { flex: 1; }
        .wa-course-item .wa-course-teacher {
            font-size: 11px;
            color: #94a3b8;
        }

        .boton-cerrar {
            background: rgba(255,255,255,0.2);
            border: none;
            border-radius: 50%;
            color: white;
            cursor: pointer;
            width: 28px;
            height: 28px;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s;
            padding: 0;
        }
        .boton-cerrar:hover { background: rgba(255,255,255,0.35); }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 480px) {
            .boton-whatsapp { width: 50px; height: 50px; font-size: 24px; }
            .div-whatsapp { width: 300px; }
        }
        @media (max-width: 360px) {
            .boton-whatsapp { width: 44px; height: 44px; font-size: 20px; }
            .div-whatsapp { width: 280px; }
        }

        [data-theme="dark"] .div-whatsapp { background: #1a2332; }
        [data-theme="dark"] .body p { color: var(--text-secondary, #94a3b8); }
        [data-theme="dark"] .wa-option { background: #1e2d40; border-color: #2a3a4a; color: var(--text-primary, #e8edf5); }
        [data-theme="dark"] .wa-option:hover { border-color: #25d366; background: #1a3a2e; }
        [data-theme="dark"] .wa-option .wa-num { color: var(--text-muted, #64748b); }
        [data-theme="dark"] .wa-section-title { border-top-color: #2a3a4a; color: #64748b; }
        [data-theme="dark"] .wa-course-item { background: #1a2332; border-color: #2a3a4a; color: var(--text-primary, #e8edf5); }
        [data-theme="dark"] .wa-course-item:hover { border-color: #25d366; background: #1a3a2e; }
        </style>
        <div class="whatsapp-container">
            <div class="div-whatsapp" id="div-whatsapp">
                <div class="header">
                    <span>💬 Contactar por WhatsApp</span>
                    <button class="boton-cerrar">✕</button>
                </div>
                <div class="body" id="waBody">
                    <p>Elige una opción o un curso para consultar:</p>

                    <div class="wa-section-title">Consultar por nivel</div>

                    <a class="wa-option" href="https://wa.me/652081700?text=${encodeURIComponent('¡Hola! Me gustaría recibir información general sobre los cursos de Academia Loranca.')}" target="_blank" rel="noopener">
                        <span class="wa-icon">📋</span>
                        <div>
                            Información general
                            <div class="wa-num">652 08 17 00</div>
                        </div>
                    </a>

                    <a class="wa-option" href="https://wa.me/652081700?text=${encodeURIComponent('¡Hola! Estoy interesado en las clases de refuerzo para Primaria y 1º ESO (grupo de Isabel).')}" target="_blank" rel="noopener">
                        <span class="wa-icon">🧒</span>
                        <div>
                            Primaria y 1º ESO
                            <div class="wa-sub">Isabel · Refuerzo Integral</div>
                            <div class="wa-num">652 08 17 00</div>
                        </div>
                    </a>

                    <a class="wa-option" href="https://wa.me/665927240?text=${encodeURIComponent('¡Hola! Estoy interesado en las clases de refuerzo para 2º-4º ESO y Bachillerato (grupo de Laura).')}" target="_blank" rel="noopener">
                        <span class="wa-icon">📚</span>
                        <div>
                            Secundaria y Bachillerato
                            <div class="wa-sub">Laura · Refuerzo Integral</div>
                            <div class="wa-num">665 92 72 40</div>
                        </div>
                    </a>

                    <div class="wa-section-title">Cursos especializados</div>
                    <div id="waCourses">
                        <div style="text-align:center;padding:10px;color:#94a3b8;font-size:13px">Cargando cursos...</div>
                    </div>
                </div>
            </div>

            <button class="boton-whatsapp">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style="width:60%;height:60%">
            </button>
        </div>`;

        const btn = this._shadow.querySelector('.boton-whatsapp');
        const closeBtn = this._shadow.querySelector('.boton-cerrar');

        btn.addEventListener('click', () => this.toggleWhatsapp());
        closeBtn.addEventListener('click', () => this.toggleWhatsapp());

        /* Load courses dynamically */
        this.loadCourses();
    }

    async loadCourses() {
        try {
            const res = await fetch('/api/courses');
            const { courses } = await res.json();
            const container = this._shadow.getElementById('waCourses');
            if (!container || !courses) return;

            const featuredNames = ['isabel', 'laura'];
            const sorted = [...courses].sort((a, b) => {
                const aF = featuredNames.some(n => (a.teacher||'').toLowerCase().includes(n));
                const bF = featuredNames.some(n => (b.teacher||'').toLowerCase().includes(n));
                if (aF && !bF) return -1; if (!aF && bF) return 1;
                return a.id - b.id;
            }).filter(c => !featuredNames.some(n => (c.teacher||'').toLowerCase().includes(n)));

            container.innerHTML = sorted.map(c => {
                const isFeatured = featuredNames.some(n => (c.teacher||'').toLowerCase().includes(n));
                const icon = ['🛡️','🤖','📊','💻','📈','🎨','📚','📝'][c.id % 8];
                const msg = encodeURIComponent(`¡Hola! Me gustaría recibir información sobre el curso "${c.name}" impartido por ${c.teacher || 'el profesor'}.`);
                const phone = (c.teacher||'').toLowerCase().includes('laura') ? '665927240' : '652081700';
                return `<a class="wa-course-item" href="https://wa.me/${phone}?text=${msg}" target="_blank" rel="noopener">
                    <span>${icon}</span>
                    <div class="wa-course-name">
                        ${isFeatured ? '⭐ ' : ''}${c.name}
                        <div class="wa-course-teacher">${c.teacher || ''} · ${c.price ? c.price.toFixed(2).replace('.',',') + '€/mes' : 'Consultar'}</div>
                    </div>
                    <span style="color:#25d366;font-size:18px">›</span>
                </a>`;
            }).join('');
        } catch {
            const container = this._shadow.getElementById('waCourses');
            if (container) container.innerHTML = '<div style="text-align:center;padding:10px;color:#94a3b8;font-size:13px">No se pudieron cargar los cursos</div>';
        }
    }

    toggleWhatsapp() {
        const card = this._shadow.getElementById('div-whatsapp');
        if (card.classList.contains('open')) {
            card.classList.remove('open');
            card.style.display = 'none';
        } else {
            card.style.display = 'flex';
            /* Force reflow then add class */
            void card.offsetWidth;
            card.classList.add('open');
        }

        document.addEventListener("click", (e) => {
            const path = e.composedPath();
            if (!path.includes(this)) {
                card.classList.remove('open');
                card.style.display = 'none';
            }
        });
    }
}
export let etiquetaWhatsapp = window.customElements.define('whatsapp-componente', WhatsappComponent);
