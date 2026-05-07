class WhatsappComponent extends HTMLElement {
    constructor(){
        super();
        this._shadow = this.attachShadow ({mode: 'open'});
    }

    connectedCallback(){
        this._shadow.innerHTML = `<style>
        
        /* -----------------------------------------Contenedor----------------------------------------- */
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

        /* -----------------------------------------Botón flotante----------------------------------------- */
        .boton-whatsapp {
            background-color: #25d366;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            transition: transform 0.3s;
        }

        .boton-whatsapp img {
            width: 35px;
            margin-top: 5px;
        }

        .boton-whatsapp:hover {
            transform: scale(1.1);
        }

        /* -----------------------------------------Tarjeta desplegable----------------------------------------- */
        .div-whatsapp {
            display: none; /* Oculta hasta pulsarse */
            width: 400px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            margin-bottom: 15px;
            overflow: hidden;
            animation: fadeIn 0.3s ease;
        }

        .header {
            background: #075e54;
            color: white;
            padding: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .body {
            padding: 15px;
            text-align: center;
        }
        
        .boton-enviar {
            display: block;
            background: #25d366;
            color: white;
            text-decoration: none;
            padding: 8px;
            border-radius: 5px;
            margin-top: 10px;
        }

        /* Boton X para salir */
        .boton-cerrar {
            background-color: rgba(0, 0, 0, 0.2);
            border: none;
            border-radius: 50%;
            color: white;
            cursor: pointer;
            width: 28px;
            height: 28px;
            font-size: 18px;
            line-height: 1;
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s ease;
            padding: 0;
        }

        /* Efecto al pasar el ratón */
        .boton-cerrar:hover {
            background-color: rgba(0, 0, 0, 0.4);
        }

        /* Animación al aparecer la tarjeta */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 360px) {
            .boton-whatsapp{
                width: 30px;
                height: 30px;
            }
            
            .boton-whatsapp img {
                width: 15px;
                margin-top: 5px;
            }

            .div-whatsapp {
                width: 280px;
                max-height: 600px;
            }
        }

        @media (min-width: 361px) and (max-width: 480px) {
            .boton-whatsapp{
                width: 35px;
                height: 35px;
            }
            
            .boton-whatsapp img {
                width: 20px;
                margin-top: 5px;
            }

            .div-whatsapp {
                width: 300px;
                max-height: 600px;
            }
        }

        @media (min-width: 481px) and (max-width: 768px) {
            .boton-whatsapp{
                width: 40px;
                height: 40px;
            }
            
            .boton-whatsapp img {
                width: 25px;
                margin-top: 5px;
            }
        }
        
        @media (min-width: 768px) and (max-width: 1024px) {
            .boton-whatsapp{
                width: 46px;
                height: 46px;
            }
            
            .boton-whatsapp img {
                width: 30px;
                margin-top: 5px;
            }
        }

        @media (min-width: 1024px) and (max-width: 1440px) {
            .boton-whatsapp{
                width: 52px;
                height: 52px;
            }
            
            .boton-whatsapp img {
                width: 35px;
                margin-top: 5px;
            }
        }

        @media (min-width: 1440px) and (max-width: 2560px) {
            .boton-whatsapp{
                width: 58px;
                height: 58px;
            }
            
            .boton-whatsapp img {
                width: 40px;
                margin-top: 5px;
            }
        }

        @media (min-width: 2560px) {
            .boton-whatsapp{
                width: 70px;
                height: 70px;
            }
            
            .boton-whatsapp img {
                width: 45px;
                margin-top: 5px;
            }
        }
        </style>
        `+ this.template;

        const btn = this._shadow.querySelector('.boton-whatsapp');
        const closeBtn = this._shadow.querySelector('.boton-cerrar');

        // Asignamos el evento
        btn.addEventListener('click', () => this.toggleWhatsapp());
        closeBtn.addEventListener('click', () => this.toggleWhatsapp());
    }

    toggleWhatsapp() {
        const card = this._shadow.getElementById('div-whatsapp');

        // Hacer aparecer la tarjeta si no esta abierta o cerrarla si lo está.
        if (card.style.display === 'block') {
            card.style.display = 'none';
        } else {
            card.style.display = 'block';
        }

        document.addEventListener("click", (e) => {
            const path = e.composedPath();
            if (!path.includes(this)) {
                card.style.display = 'none';
            }
        });
    }

    get template(){
        return `
        <div class="whatsapp-container">
            <div class="div-whatsapp" id="div-whatsapp">
                <div class="header">
                    <span>¿Necesitas ayuda?</span>
                    <button class="boton-cerrar" onclick="toggleWhatsapp()">x</button>
                </div>
                <div class="body">
                    <p><strong>¡Hola!👋</strong></p>
                    <p>¿Buscas apoyo escolar o información sobre nuestros servicios?</p>
                    <p>En nuestra academia ayudamos a alumnos de Primaria, ESO y Bachillerato a mejorar sus notas y lograr
                        sus objetivos.</p>
                    <p>Cuéntanos qué asignatura se le resiste y te informamos sin compromiso. 📚✨</p>
                   <a class="boton-enviar" href="https://wa.me/652081700" target="_blank">
                        Información Primaria y 1ºESO (Isabel)
                    </a>

                    <a class="boton-enviar" href="https://wa.me/665927240" target="_blank">
                         Información 2ºESO - 4ºESO - Bachillerato  (Laura)
                    </a>
                </div>
            </div>

            <button class="boton-whatsapp" onclick="toggleWhatsapp()">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp">
            </button>
        </div>
        `;
    }
}
export let etiquetaWhatsapp = window.customElements.define('whatsapp-componente', WhatsappComponent);