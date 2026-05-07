class FooterComponent extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this._shadow.innerHTML = `<style>


            .footer {
                background: linear-gradient(135deg, #1e3a8a, #2563eb);
                color: #ffffff;
                padding: 70px 0 0 0;
                font-family: 'Poppins', sans-serif;
            }

            .contenedor-footer {
                max-width: 1200px;
                margin: auto;
                padding: 0 20px 50px 20px;
                display: grid;
                grid-template-columns: 1.3fr 1fr 1fr 1fr;
                gap: 30px;
                
                
            }

            .columnas-footer ul li {
                transition: transform 0.25s ease;
            }

            .columnas-footer ul li:hover {
                transform: translateX(6px);
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


            .columnas-footer {
                margin: 0;
                
                
            }

            .columnas-footer h4 {
                margin-bottom: 20px;
                font-size: 1rem;
                text-transform: uppercase;
                letter-spacing: 1px;
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


            #columna-info p {
                font-size: 0.9rem;
                margin-bottom: 20px;
                color: rgba(255,255,255,0.9);
            }

            .boton-footer {
                display: inline-block;
                background: #ffffff;
                color: #1e3a8a;
                padding: 12px 25px;
                border-radius: 40px;
                text-decoration: none;
                font-weight: 600;
                transition: 0.3s ease;
            }

            .boton-footer:hover {
                background: #f1f5f9;
                transform: translateY(-3px);
            }


            .zona-privacidad {
                border-top: 1px solid rgba(91, 255, 244, 0.476);
                padding: 20px;
                text-align: center;
                font-size: 0.85rem;
                background: rgba(254, 254, 254, 0.1);
            }

            .zona-privacidad p {
                margin-bottom: 10px;
            }

            .footer-legal a {
                    color: #ffffff;
                    text-decoration: none;
                    font-size: 0.85rem;
                    display: inline-block;
                    width: fit-content;
                    margin:7px;
            }

            .footer-legal a:hover {
                text-decoration: underline;
            }


            @media (max-width: 992px) {
                .contenedor-footer {
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                }
            }

            @media (max-width: 600px) {
                .contenedor-footer {
                    grid-template-columns: 1fr;
                    text-align: center;
                }

                .logo-footer {
                    justify-content: center;
                }

                .columnas-footer ul li a:hover {
                    padding-left: 0;
                }
            }

            @media (max-width: 480px) {
                .zona-privacidad {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 15px;
                    padding: 20px 15px;
                }

                .zona-privacidad p {
                    font-size: 0.85rem;
                    line-height: 1.4;
                }

                .footer-legal {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 5px;
                        width: 100%;
                }

                .footer-legal a {
                    font-size: 0.9rem;
                    padding: 3px 0;
                    
                }
            }

        </style>
        `+ this.template;
    }

    get template() {
    return `
        <footer class="footer">

            <div class="contenedor-footer">
                
                <div class="columnas-footer" id="columna-academia">
                    <div class="logo-footer">
                        <img src="./imagenes/logo.png" alt="Academia Loranca">
                        <h3>Academia Loranca</h3>
                    </div>

                    <p>
                        Academia especializada en refuerzo escolar, preparación de exámenes y acompañamiento educativo
                        personalizado en Fuenlabrada - Loranca.

                    </p>

                <div class="footer-contactos"><br>

                <p>📍 <a href="https://maps.app.goo.gl/qMmnxELKV5qWs9Aj9" target="_blank" rel="noopener">
                    C/ Alegría, 4, local 37, 28942 Fuenlabrada, Madrid)
                </a></p>
                
                <p>📞 <a href="tel:+34652081700">+34 652 08 17 00</a> <a href="./grupos.html#grupo1">(Isabel Grupo 1)</a></p>
                <p>📞 <a href="tel:+34665927240">+34 665 92 72 40</a> <a href="./grupos.html#grupo2">(Laura Grupo 2)</a></p>
                
                <p>✉️ <a href="mailto:academialoranca22@gmail.com">academialoranca22@gmail.com</a></p>
            </div>

            </div>
                <div class="columnas-footer">
                    <h4>Navegación</h4>
                    <ul>
                        <li><a href="./index.html">Inicio</a></li>
                        <li><a href="./grupos.html">Cursos</a></li>
                        <li><a href="./index.html#servicios">Servicios</a></li>
                        <li><a href="./contactos.html">Inscripción</a></li>
                        <li><a href="./index.html#contacto">Ubicación</a></li>
                    </ul>
                </div>

                <div class="columnas-footer">
                    <h4>Niveles educativos</h4>
                    <ul>
                        <li>Educación Primaria</li>
                        <li>ESO</li>
                        <li>Bachillerato</li>
                        <li>Preparación EVAU</li>
                    </ul>
                </div>

                <div class="columnas-footer" id="columna-info">
                    <h4>¿Te interesa?</h4>
                    <p>Reserva una clase de prueba gratuita y descubre nuestra metodología.</p>
                    <a href="./contactos.html" class="boton-footer">Solicitar información</a>
                </div>

                <div class="columnas-footer" id="horarios">
                    <h4>Horarios</h4>
                    <ul>
                        <li><strong>Lunes a Jueves:</strong> 15:00 - 20:00 <a href="grupos.html#grupo1">(Grupo 1)</a></li>
                        <li><strong>Lunes a Jueves:</strong> 16:00 - 21:00 <a href="grupos.html#grupo2">(Grupo 2)</a></li>
                    </ul>   
                </div>

            </div>

            <div class="zona-privacidad">
                <p>© 2026 Academia Loranca | Todos los derechos reservados</p>
                <div class="footer-legal">
                    <a href="./privacidad.html">Política de Privacidad</a>
                    <a href="./aviso-legal.html">Aviso Legal</a>
                </div>
            </div>

        </footer>
        `;
    }
}
export let etiquetaFooter = window.customElements.define('footer-componente', FooterComponent);