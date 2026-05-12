class FooterComponent extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.loadData();
    }

    async loadData() {
        try {
            const res = await fetch('/api/courses');
            const { courses } = await res.json();
            this.render(courses);
        } catch {
            this.render();
        }
    }

    render(courses) {
        const featuredNames = ['isabel', 'laura'];

        const grouped = {};
        const featuredCourses = [];
        const otherCourses = [];

        if (courses) {
            courses.forEach(c => {
                const t = (c.teacher || '').trim();
                if (!t) return;
                const isFeatured = featuredNames.some(n => t.toLowerCase().includes(n));
                if (isFeatured) {
                    featuredCourses.push(c);
                } else {
                    otherCourses.push(c);
                }
                if (!grouped[t]) grouped[t] = [];
                grouped[t].push(c);
            });
        }

        const allTeachers = Object.keys(grouped);
        const featuredTeachers = featuredCourses.map(c => (c.teacher || '').trim()).filter((v,i,a) => a.indexOf(v) === i);
        const otherTeachers = allTeachers.filter(t => !featuredNames.some(n => t.toLowerCase().includes(n)));

        this._shadow.innerHTML = `<style>
            .footer {
                background: linear-gradient(135deg, #0f1d42, #1e3a8a);
                color: #ffffff;
                padding: 70px 0 0 0;
                font-family: 'Poppins', sans-serif;
                position: relative;
                overflow: hidden;
            }
            .footer::before {
                content: '';
                position: absolute;
                top: -50%; right: -20%;
                width: 600px; height: 600px;
                border-radius: 50%;
                background: rgba(255,255,255,0.02);
                pointer-events: none;
            }

            .contenedor-footer {
                max-width: 1200px;
                margin: auto;
                padding: 0 20px 80px 20px;
                display: grid;
                grid-template-columns: 1.3fr 1fr 1fr 1fr;
                gap: 30px;
                position: relative;
                z-index: 1;
            }

            .columnas-footer ul {
                list-style: none;
                padding: 0;
            }
            .columnas-footer ul li {
                transition: transform 0.25s ease;
            }
            .columnas-footer ul li:hover {
                transform: translateX(6px);
            }

            .ft-teachers-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }
            @media (max-width: 600px) {
                .ft-teachers-grid { grid-template-columns: 1fr; }
            }
            .ft-teacher-card {
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
                padding: 10px 12px;
                border: 1px solid rgba(255,255,255,0.06);
                transition: 0.25s;
            }
            .ft-teacher-card:hover {
                background: rgba(255,255,255,0.09);
                transform: translateY(-2px);
            }
            .ft-teacher-card.featured-card {
                background: rgba(251,191,36,0.08);
                border-color: rgba(251,191,36,0.2);
            }
            .ft-teacher-card.featured-card:hover {
                background: rgba(251,191,36,0.14);
            }
            .ft-teacher-card .ft-name {
                font-weight: 600;
                font-size: 0.85rem;
                color: #fbbf24;
            }
            .ft-teacher-card .ft-course {
                font-size: 0.75rem;
                color: rgba(255,255,255,0.6);
                display: block;
                margin-top: 2px;
            }
            .ft-teacher-card .ft-course a {
                color: rgba(255,255,255,0.6);
                text-decoration: none;
            }
            .ft-teacher-card .ft-course a:hover {
                color: #97dff1;
            }
            .ft-other-name {
                font-weight: 500;
                font-size: 0.85rem;
                color: rgba(255,255,255,0.85);
            }
            .ft-other-course {
                font-size: 0.75rem;
                color: rgba(255,255,255,0.5);
            }

            #columna-academia p {
                margin:  0;
                line-height: 1.6;
                color: rgba(255,255,255,0.85);
                font-size: 0.95rem;
            }

            .logo-footer {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .logo-footer img {
                height: 55px;
            }
            .logo-footer h3 {
                font-size: 1.3rem;
                font-weight: 700;
            }

            .footer-contactos p {
                margin-bottom: 8px;
                font-size: 0.9rem;
            }
            .footer-contactos a {
                color: #ffffff;
                text-decoration: none;
            }
            .footer-contactos a:hover {
                text-decoration: underline;
            }

            .columnas-footer { margin: 0; }
            .columnas-footer h4 {
                margin-bottom: 20px;
                font-size: 1rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #97dff1;
            }
            .columnas-footer ul {
                list-style: none;
                padding: 0;
            }
            .columnas-footer ul li {
                margin-bottom: 10px;
                font-size: 0.9rem;
            }
            .columnas-footer ul li a {
                color: rgba(255,255,255,0.85);
                text-decoration: none;
                transition: 0.3s;
            }
            .columnas-footer ul li a:hover {
                color: #97dff1;
                padding-left: 5px;
                text-decoration: underline;
            }

            .ft-teacher-item {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;
            }
            .ft-teacher-item .ft-dot {
                width: 8px; height: 8px;
                border-radius: 50%;
                flex-shrink: 0;
            }
            .ft-teacher-item .ft-name {
                font-weight: 600;
                color: #fbbf24;
            }
            .ft-teacher-item .ft-course {
                color: rgba(255,255,255,0.75);
                font-size: 0.85rem;
            }
            .ft-teacher-featured {
                background: rgba(251,191,36,0.1);
                border: 1px solid rgba(251,191,36,0.2);
                border-radius: 10px;
                padding: 12px;
                margin-bottom: 10px;
            }

            .ft-other-teacher {
                padding: 6px 0;
                border-bottom: 1px solid rgba(255,255,255,0.05);
            }
            .ft-other-teacher:last-child { border-bottom: none; }

            .ft-section-title {
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: rgba(255,255,255,0.4);
                margin: 14px 0 8px 0;
                font-weight: 600;
            }

            #columna-info p {
                font-size: 0.9rem;
                margin-bottom: 20px;
                color: rgba(255,255,255,0.9);
            }
            .boton-footer {
                display: inline-block;
                background: linear-gradient(135deg, #f59e0b, #fbbf24);
                color: #0f1d42;
                padding: 12px 25px;
                border-radius: 40px;
                text-decoration: none;
                font-weight: 700;
                transition: 0.3s ease;
            }
            .boton-footer:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(245,158,11,0.35);
            }

            .zona-privacidad {
                border-top: 1px solid rgba(255,255,255,0.1);
                padding: 24px 20px;
                text-align: center;
                font-size: 0.85rem;
                background: rgba(0,0,0,0.15);
            }
            .zona-privacidad p { margin-bottom: 10px; }
            .footer-legal a {
                color: #ffffff;
                text-decoration: none;
                font-size: 0.85rem;
                display: inline-block;
                margin:7px;
            }
            .footer-legal a:hover { text-decoration: underline; }

            @media (max-width: 992px) {
                .contenedor-footer { grid-template-columns: 1fr 1fr; gap: 40px; }
            }
            @media (max-width: 600px) {
                .contenedor-footer { grid-template-columns: 1fr; text-align: center; }
                .logo-footer { justify-content: center; }
                .ft-teacher-item { justify-content: center; }
            }
            @media (max-width: 480px) {
                .zona-privacidad {
                    display: flex; flex-direction: column; align-items: center;
                    text-align: center; gap: 15px; padding: 20px 15px;
                }
                .footer-legal { display: flex; flex-direction: column; align-items: center; gap: 5px; width: 100%; }
                .footer-legal a { font-size: 0.9rem; padding: 3px 0; }
            }
        </style>
        <footer class="footer">
            <div class="contenedor-footer">
                <div class="columnas-footer" id="columna-academia">
                    <div class="logo-footer">
                        <img src="./imagenes/logo.png" alt="Academia Loranca">
                        <h3>Academia Loranca</h3>
                    </div>
                    <p>Academia especializada en refuerzo escolar, preparación de exámenes y acompañamiento educativo personalizado en Fuenlabrada - Loranca.</p>
                    <div class="footer-contactos"><br>
                        <p>📍 <a href="https://maps.app.goo.gl/qMmnxELKV5qWs9Aj9" target="_blank" rel="noopener">C/ Alegría, 4, local 37, 28942 Fuenlabrada, Madrid</a></p>
                        <p style="font-size:0.8rem;opacity:0.7;margin:4px 0 2px 0">📞 Isabel Rodríguez (Primaria y 1º ESO)</p>
                        <p style="margin:0 0 0 20px">📞 <a href="tel:+34652081700">+34 652 08 17 00</a></p>
                        <p style="font-size:0.8rem;opacity:0.7;margin:12px 0 2px 0">📞 Laura Barroso (2º-4º ESO y Bachillerato)</p>
                        <p style="margin:0 0 0 20px">📞 <a href="tel:+34665927240">+34 665 92 72 40</a></p>
                        <p>✉️ <a href="mailto:academialoranca22@gmail.com">academialoranca22@gmail.com</a></p>
                    </div>
                </div>

                <div class="columnas-footer">
                    <h4>Nuestros profesores</h4>
                    <div class="ft-teachers-grid">
                        ${featuredTeachers.length > 0 ? featuredTeachers.map(t => {
                            const tc = featuredCourses.filter(c => (c.teacher || '').trim() === t);
                            const first = tc[0];
                            return `
                            <a href="./grupos.html#curso-${first?.id}" class="ft-teacher-card featured-card" style="text-decoration:none;color:inherit;display:block">
                                <div class="ft-name">⭐ ${t}</div>
                                ${tc.map(c => `<span class="ft-course">${c.name}</span>`).join('')}
                            </a>`;
                        }).join('') : `
                        <a href="./grupos.html#grupo1" class="ft-teacher-card featured-card" style="text-decoration:none;color:inherit;display:block">
                            <div class="ft-name">⭐ Isabel Rodríguez</div>
                            <span class="ft-course">Refuerzo Integral - Grupo 1</span>
                        </a>
                        <a href="./grupos.html#grupo2" class="ft-teacher-card featured-card" style="text-decoration:none;color:inherit;display:block">
                            <div class="ft-name">⭐ Laura Barroso</div>
                            <span class="ft-course">Refuerzo Integral - Grupo 2</span>
                        </a>
                        `}
                        ${otherTeachers.slice(0, 2).map(t => {
                            const tc = otherCourses.filter(c => (c.teacher || '').trim() === t);
                            const first = tc[0];
                            return `
                            <a href="./grupos.html#curso-${first?.id}" class="ft-teacher-card" style="text-decoration:none;color:inherit;display:block">
                                <div class="ft-other-name">${t}</div>
                                <span class="ft-other-course">${first?.name || ''}</span>
                            </a>`;
                        }).join('')}
                        ${!courses ? '<div style="color:rgba(255,255,255,0.5);grid-column:1/-1;text-align:center;padding:10px">Cargando...</div>' : ''}
                        ${courses && allTeachers.length === 0 ? '<div style="color:rgba(255,255,255,0.5);grid-column:1/-1;text-align:center;padding:10px">Próximamente</div>' : ''}
                    </div>
                    <a href="./grupos.html#div-grupos" style="display:inline-block;margin-top:8px;font-size:0.8rem;color:#97dff1;font-weight:600;text-decoration:none;transition:0.25s">👩‍🏫 Ver todos los profesores →</a>
                </div>

                <div class="columnas-footer">
                    <h4>Cursos disponibles</h4>
                    <ul>
                        ${courses ? courses.map(c => {
                            const isFav = featuredNames.some(n => (c.teacher || '').toLowerCase().includes(n));
                            return `<li>${isFav ? '⭐ ' : ''}<a href="./grupos.html#curso-${c.id}">${c.name}</a></li>`;
                        }).join('') : '<li style="color:rgba(255,255,255,0.5)">Cargando...</li>'}
                        <li style="margin-top:12px"><a href="./grupos.html#div-grupos" style="color:#97dff1;font-weight:600">Ver todos →</a></li>
                    </ul>
                </div>

                <div class="columnas-footer" id="columna-info">
                    <h4>¿Te interesa?</h4>
                    <p>Reserva una clase de prueba gratuita y descubre nuestra metodología.</p>
                    <a href="./contactos.html" class="boton-footer">Solicitar información</a>
                    <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08)">
                        <p style="font-size:0.85rem;opacity:0.7">📅 Próximo evento:</p>
                        <div id="ftNextEvent" style="font-size:0.85rem;color:#fbbf24">Cargando...</div>
                    </div>
                </div>
            </div>
            <div class="zona-privacidad">
                <p>© 2026 Academia Loranca | Todos los derechos reservados</p>
                <div class="footer-legal">
                    <a href="./privacidad.html">Política de Privacidad</a>
                    <a href="./aviso-legal.html">Aviso Legal</a>
                    <a href="./cookies.html">Política de Cookies</a>
                </div>
            </div>
        </footer>`;

        (async () => {
            try {
                const r = await fetch('/api/events/upcoming');
                const { events } = await r.json();
                const el = this._shadow.getElementById('ftNextEvent');
                if (el && events && events.length > 0) {
                    const e = events[0];
                    const d = new Date(e.event_date + 'T12:00:00');
                    el.innerHTML = `${e.title} — ${d.toLocaleDateString('es-ES', { day:'numeric', month:'long' })}`;
                } else if (el) {
                    el.textContent = 'No hay eventos próximos';
                }
            } catch {
                const el = this._shadow.getElementById('ftNextEvent');
                if (el) el.textContent = 'No hay eventos próximos';
            }
        })();
    }
}
export let etiquetaFooter = window.customElements.define('footer-componente', FooterComponent);
