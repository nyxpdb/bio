// ═══════════════════════════════════════════
// PARTICLES SYSTEM - Sangue e Neve
// ═══════════════════════════════════════════

const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];
let mouseX = 0;
let mouseY = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let mouseSpeed = 0;
let mouseRadius = 150;

// Ajusta o canvas para tela cheia
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Rastreia movimento do mouse
window.addEventListener('mousemove', function (event) {
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    mouseX = event.x;
    mouseY = event.y;
    mouseSpeed = Math.sqrt(Math.pow(mouseX - lastMouseX, 2) + Math.pow(mouseY - lastMouseY, 2));
});

// Classe de partículas
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10 - Math.random() * 40;
        this.size = Math.random() * 4 + 2;
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.type = Math.random() > 0.3 ? 'blood' : 'snow'; // 70% sangue, 30% neve
        this.opacity = Math.random() * 0.6 + 0.4;
        this.gravity = this.type === 'blood' ? 0.15 : 0.07;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;

        // Cores
        if (this.type === 'blood') {
            const shade = Math.floor(Math.random() * 60);
            this.color = `rgba(${170 + shade}, ${20 + shade}, ${20 + shade}, ${this.opacity})`;
        } else {
            const shade = Math.floor(Math.random() * 30);
            this.color = `rgba(${220 + shade}, ${220 + shade}, ${230 + shade}, ${this.opacity})`;
        }

        // Características específicas
        if (this.type === 'blood') {
            this.width = this.size * (0.8 + Math.random() * 0.4);
            this.height = this.size * (1.2 + Math.random() * 0.8);
            this.stretched = Math.random() > 0.5;
        } else {
            this.points = [4, 6, 8][Math.floor(Math.random() * 3)];
        }
    }

    draw() {
        ctx.save();

        if (this.type === 'blood') {
            ctx.fillStyle = this.color;
            ctx.beginPath();

            if (this.stretched) {
                // Gota esticada
                ctx.moveTo(this.x, this.y - this.height / 2);
                ctx.quadraticCurveTo(
                    this.x - this.width / 2,
                    this.y,
                    this.x,
                    this.y + this.height / 2
                );
                ctx.quadraticCurveTo(
                    this.x + this.width / 2,
                    this.y,
                    this.x,
                    this.y - this.height / 2
                );
            } else {
                // Gota circular
                ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
                ctx.shadowBlur = 2;
                ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            }

            ctx.closePath();
            ctx.fill();

        } else {
            // Floco de neve
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.strokeStyle = this.color;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
            ctx.shadowBlur = 3;
            ctx.lineWidth = this.size / 10;

            for (let i = 0; i < this.points; i++) {
                const angle = (i * 360 / this.points) * Math.PI / 180;
                const length = this.size;

                // Linha principal
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(
                    Math.cos(angle) * length,
                    Math.sin(angle) * length
                );
                ctx.stroke();

                // Ramificações
                const branchLength = length / 3;
                const branchStart = length / 2.5;

                ctx.beginPath();
                ctx.moveTo(
                    Math.cos(angle) * branchStart,
                    Math.sin(angle) * branchStart
                );
                ctx.lineTo(
                    Math.cos(angle) * branchStart + Math.cos(angle + Math.PI / 3) * branchLength,
                    Math.sin(angle) * branchStart + Math.sin(angle + Math.PI / 3) * branchLength
                );
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(
                    Math.cos(angle) * branchStart,
                    Math.sin(angle) * branchStart
                );
                ctx.lineTo(
                    Math.cos(angle) * branchStart + Math.cos(angle - Math.PI / 3) * branchLength,
                    Math.sin(angle) * branchStart + Math.sin(angle - Math.PI / 3) * branchLength
                );
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.speedY += this.gravity;

        if (this.type === 'snow') {
            this.rotation += this.rotationSpeed;
        }

        // Interação com mouse
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseRadius) {
            const force = (mouseSpeed / 20) * (1 - distance / mouseRadius) + 0.1;
            const angle = Math.atan2(dy, dx);

            this.x += Math.cos(angle) * force * 2;
            this.y += Math.sin(angle) * force * 2;
            this.speedX += Math.cos(angle) * force * 0.5;
            this.speedY += Math.sin(angle) * force * 0.5;

            // Limita velocidade
            const maxSpeed = 6;
            const currentSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
            if (currentSpeed > maxSpeed) {
                this.speedX = (this.speedX / currentSpeed) * maxSpeed;
                this.speedY = (this.speedY / currentSpeed) * maxSpeed;
            }
        }

        // Reinicia quando sai da tela
        if (this.y > canvas.height + 10) {
            this.reset();
        }

        if (this.x < -50 || this.x > canvas.width + 50) {
            this.reset();
        }
    }
}

// Inicializa partículas
function initParticles() {
    particlesArray = [];
    const numberOfParticles = Math.min(120, Math.floor(window.innerWidth / 8));

    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
        particlesArray[i].y = Math.random() * canvas.height;
    }
}

// Anima partículas
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }

    requestAnimationFrame(animateParticles);
}

// Inicia efeito
function startParticlesEffect() {
    initParticles();
    animateParticles();
}
