document.addEventListener("DOMContentLoaded", () => {

    const slides = document.querySelector(".slides");
    const images = document.querySelectorAll(".slides img");
    const prevBtn = document.querySelector(".btn.left");
    const nextBtn = document.querySelector(".btn.right");
    const carrusel = document.querySelector(".carrusel");

    let index = 0;
    const total = images.length;
    const intervalTime = 4000;
    let autoSlide;
    let isCarouselVisible = true;


    function updateSlide() {
        slides.style.transform = `translateX(-${index * 100}%)`;
    }

    function nextSlide() {
        index++;
        if (index >= total) {
            index = 0;
        }
        updateSlide();
    }

    function prevSlide() {
        index--;
        if (index < 0) {
            index = total - 1;
        }
        updateSlide();
    }

    function startAutoSlide() {
        clearInterval(autoSlide);
        if (isCarouselVisible) {
            autoSlide = setInterval(nextSlide, intervalTime);
        }
    }

    function reset() {
        clearInterval(autoSlide);
        startAutoSlide();
    }

    nextBtn.addEventListener("click", () => {
        nextSlide();
        reset();
    });

    prevBtn.addEventListener("click", () => {
        prevSlide();
        reset();
    });

    carrusel.addEventListener("mouseenter", () => {
        clearInterval(autoSlide);
    });

    carrusel.addEventListener("mouseleave", () => {
        startAutoSlide();
    });

    const observerCarrusel = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                isCarouselVisible = true;
                startAutoSlide();
            } else {
                isCarouselVisible = false;
                clearInterval(autoSlide);
            }
        });
    }, { threshold: 0.1 });

    observerCarrusel.observe(carrusel);
    startAutoSlide();
});
