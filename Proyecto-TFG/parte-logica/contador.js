const textarea = document.getElementById("biografia-personal");
const contador = document.getElementById("contador");


if (textarea && contador) {
textarea.addEventListener('input', function(){
    const longitud = textarea.value.length;
    contador.textContent = longitud;

    if (longitud >= 200) {
    contador.style.color = 'red';
    } else if (longitud < 200){
    contador.style.color = '#718096';
    }
})
};

