function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func.apply(this, args);
        }
    };
}

const beneficios = document.querySelectorAll(".beneficios-lista li");

const animarBeneficios = throttle(() => {
    beneficios.forEach((item, index) => {
        if (!item.classList.contains("active")) {
            const elementTop = item.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (elementTop < windowHeight - 100) {
                item.classList.add("active");
                item.style.setProperty('--item-delay', `${index * 0.22}s`);
            }
        }
    });
}, 100);
window.addEventListener("scroll", animarBeneficios, { passive: true });
