class LectorPaginaComponent extends HTMLElement {

    constructor(){
        super();
        this._shadow = this.attachShadow({ mode: 'open' });

        this.parrafos = [];
        this.indiceActual = 0;
        this.reproduciendo = false;
        this.utterance = null;
        this.abierto = false;
    }

    connectedCallback(){

        this._shadow.innerHTML = `
            <style>
                :host{
                    position: fixed;
                    bottom: 5px;
                    left: 20px;
                    z-index: 9999;
                    font-family: Arial, sans-serif;

                    pointer-events: none;
                }

                :host(.abierto){
                    pointer-events: auto;
                }

                .contenedor-lector{
                    display:flex;
                    align-items:center;
                    gap: clamp(6px, 2vw, 12px);
                }

              
                .boton-audio{
                    width: clamp(30px, 5vw, 60px);
                    height: clamp(30px, 5vw, 60px);

                    border-radius: 50%;
                    border: none;

                    background: #3962e9;
                    color: white;

                    font-size: clamp(14px, 2.5vw, 24px);

                    cursor: pointer;

                    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);

                    display:flex;
                    align-items:center;
                    justify-content:center;

                    transition: transform 0.2s ease, box-shadow 0.2s ease;

                    -webkit-tap-highlight-color: transparent;

                    pointer-events: auto; /* siempre clicable */
                }

                .boton-audio:active{
                    transform: scale(0.92);
                }

                @media (hover: hover){
                    .boton-audio:hover{
                        transform: scale(1.05);
                        box-shadow: 0 8px 22px rgba(0,0,0,0.3);
                    }
                }

                .controles{
                    display:flex;
                    align-items:center;
                    gap: clamp(6px, 2vw, 12px);

                    background:#3962e9;
                    padding: clamp(6px, 2vw, 10px) clamp(8px, 2.5vw, 14px);

                    border-radius: clamp(10px, 2vw, 14px);

                    box-shadow: 0 6px 18px rgba(0,0,0,0.25);

                    opacity: 0;
                    transform: translateX(-10px) scale(0.95);

                    pointer-events: none;
                    visibility: hidden;

                    transition: all 0.25s ease;

                    max-width: 90vw;
                }

                .controles.activo{
                    opacity: 1;
                    transform: translateX(0) scale(1);
                    pointer-events: auto;
                    visibility: visible;
                }

                .controles button{
                    width: clamp(28px, 6vw, 44px);
                    height: clamp(28px, 6vw, 44px);

                    font-size: clamp(14px, 2.5vw, 18px);

                    border: none;
                    background: #3962e9;
                    color: white;

                    border-radius: 50%;
                    cursor: pointer;

                    display:flex;
                    align-items:center;
                    justify-content:center;

                    transition: transform 0.15s ease;

                    -webkit-tap-highlight-color: transparent;
                }

                .controles button:active{
                    transform: scale(0.9);
                }

                #play{
                    width: clamp(34px, 7vw, 52px);
                    height: clamp(34px, 7vw, 52px);
                    font-size: clamp(16px, 3vw, 22px);
                }

                @media (max-width: 360px){
                    .controles{
                        gap: 6px;
                        padding: 6px 8px;
                    }
                }

                @media (min-width: 2000px){
                    .boton-audio{
                        width: 70px;
                        height: 70px;
                        font-size: 26px;
                    }

                    .controles button{
                        width: 52px;
                        height: 52px;
                        font-size: 20px;
                    }

                    #play{
                        width: 62px;
                        height: 62px;
                        font-size: 24px;
                    }
                }

            </style>

            <div class="contenedor-lector">
                <button class="boton-audio" id="toggle">🔊</button>

                <div class="controles" id="controles">
                    <button id="anterior">⏮</button>
                    <button id="play">▶</button>
                    <button id="siguiente">⏭</button>
                </div>
            </div>
        `;

        this.obtenerParrafos();

        const anterior = this._shadow.getElementById("anterior");
        const play = this._shadow.getElementById("play");
        const siguiente = this._shadow.getElementById("siguiente");
        const toggle = this._shadow.getElementById("toggle");
        const controles = this._shadow.getElementById("controles");

        anterior.addEventListener("click", () => this.anterior());
        siguiente.addEventListener("click", () => this.siguiente());
        play.addEventListener("click", () => this.toggleLectura());

        toggle.addEventListener("click", () => {

            this.abierto = !this.abierto;
            controles.classList.toggle("activo", this.abierto);
            this.classList.toggle("abierto", this.abierto);
        });

        document.addEventListener("click", (e) => {
            if (!e.composedPath().includes(this)) {
                controles.classList.remove("activo");
                this.abierto = false;
                this.classList.remove("abierto");
            }
        });

        window.addEventListener("beforeunload", () => {
            window.speechSynthesis.cancel();
        });

        window.addEventListener("pagehide", () => {
            window.speechSynthesis.cancel();
        });
    }

    disconnectedCallback(){
        window.speechSynthesis.cancel();
    }

    obtenerParrafos(contenedor = null){
        const root = contenedor || document.querySelector("main");
        if(!root) return;

        const elementos = root.querySelectorAll("p, h1, h2, h3, li");
        this.parrafos = Array.from(elementos).map(el => el.innerText);
        this.indiceActual = 0;
    }

    leerActual(){
        if(this.parrafos.length === 0) return;

        window.speechSynthesis.cancel();

        this.utterance = new SpeechSynthesisUtterance(this.parrafos[this.indiceActual]);
        this.utterance.lang = "es-ES";

        this.utterance.onend = () => {
            if(this.reproduciendo && this.indiceActual < this.parrafos.length - 1){
                this.indiceActual++;
                this.leerActual();
            } else {
                const playBtn = this._shadow.getElementById("play");
                playBtn.textContent = "▶";
                this.reproduciendo = false;
            }
        };

        window.speechSynthesis.speak(this.utterance);
    }

    toggleLectura(){
        const playBtn = this._shadow.getElementById("play");
        if(!this.reproduciendo){
            this.leerActual();
            playBtn.textContent = "⏸";
            this.reproduciendo = true;
        } else {
            window.speechSynthesis.pause();
            playBtn.textContent = "▶";
            this.reproduciendo = false;
        }
    }

    siguiente(){
        if(this.indiceActual < this.parrafos.length - 1 && !this.reproduciendo){
            this.indiceActual++;
            this.leerActual();
            this.toggleLectura();
        }
        else{
            this.indiceActual++;
            this.leerActual();
        }
    }

    anterior(){
        if(this.indiceActual > 0 && !this.reproduciendo){
            this.indiceActual--;
            this.leerActual();
            this.toggleLectura();
        }
        else{
            this.indiceActual--;
            this.leerActual();
        }
    }
}

customElements.define("lector-pagina", LectorPaginaComponent);