function createPetal() {
    const maxPetals = 22;
    if (document.querySelectorAll('.petal').length >= maxPetals) return;

    const petal = document.createElement('div');
    petal.classList.add('petal');
    if (Math.random() > 0.6) petal.classList.add('alt');

    const size = Math.random() * 7 + 8;
    petal.style.width = `${size}px`;
    petal.style.height = `${size * 1.2}px`;
    petal.style.left = `${Math.random() * 100}vw`;

    const duration = Math.random() * 4 + 5;
    petal.style.animationDuration = `${duration}s`;
    petal.style.opacity = Math.random() * 0.5 + 0.4;

    document.body.appendChild(petal);

    setTimeout(() => {
        petal.remove();
    }, duration * 1000);
}

let petalInterval = null;

function startPetals() {
    if (petalInterval) return;
    petalInterval = setInterval(createPetal, 450);
}