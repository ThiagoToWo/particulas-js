/*=====================================Variáveis Globais====================================*/
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const form = document.querySelector("form");
const resp1 = document.querySelector("#f");
const resp2 = document.querySelector("#T");
const resp3 = document.querySelector("#l");
let elementos;
let acao;

/*=====================================Classe Partícula====================================*/
class Particula {
    constructor(x, y, r, vx, vy, cor) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = vx;
        this.vy = vy;
        this.cor = cor;
        this.ativo = true;
        this.ativoAtualizar = true;
        this.ativoDesenhar = true;
        this.ativoColidir = true;
        this.rastro = false;
    }

    atualizar() {
        if (!this.ativoAtualizar) return;
        if (!this.ativo) return;

        this.x += this.vx;
        this.y += this.vy;

        if (this.x > 300 - this.r) {
            this.vx *= -1;
            this.x = 300 - this.r;
        }

        if (this.x < this.r) {
            this.vx *= -1;
            this.x = this.r;
        }

        if (this.y > 300 - this.r) {
            this.vy *= -1;
            this.y = 300 - this.r;
        }

        if (this.y < this.r) {
            this.vy *= -1;
            this.y = this.r;
        }
    }

    desenhar() {
        if (!this.ativoDesenhar) return;
        if (!this.ativo) return;

        ctx.fillStyle = this.cor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
    }

    colidiuCom(outro) {
        if (!this.ativoColidir) return;
        if (!this.ativo) return;

        return (this.x + this.r >= outro.x - outro.r) &&
            (this.x - this.r <= outro.x + outro.r) &&
            (this.y + this.r >= outro.y - outro.r) &&
            (this.y - this.r <= outro.y + outro.r);
    }
}

/*=====================================Funções de Formulário====================================*/
form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearInterval(acao);

    const N = Number(form.N.value);
    const a = Number(form.a.value);
    const d = Number(form.d.value);
    const v = Number(form.v.value);
    const refletiu = form.refletir.checked;
    const fundiu = form.fundir.checked;

    canvas.style.width = a + "px";
    canvas.style.height = a + "px";

    const n = N / (a * a);
    const f = Math.SQRT2 * n * Math.PI * d * d * v;
    const T = 1 / f;
    const l = v * T;

    resp1.innerText = `Frequência Média de Colisões (f) = ${f.toPrecision(5)} /s`;
    resp2.innerText = `Período Médio entre Colisões (T) = ${T.toPrecision(5)} s`;
    resp3.innerText = `Livre Percurso Médio (l) = ${l.toPrecision(5)} cm`;

    let x = d / 2 + Math.random() * (300 - d);
    let y = d / 2 + Math.random() * (300 - d);
    let vx = Math.pow(-1, Math.floor(Math.random() * 10)) * Math.random() * v;
    let vy = Math.pow(-1, Math.floor(Math.random() * 10)) * Math.sqrt(v * v - vx * vx);
    const raio = (d / 2) * (300 / a);
    let p = new Particula(x, y, raio, vx, vy, "red");
    elementos = [p];

    for (let i = 0; i < N - 1; i++) {
        x = d / 2 + Math.random() * (300 - d);
        y = d / 2 + Math.random() * (300 - d);
        vx = Math.pow(-1, Math.floor(Math.random() * 10)) * Math.random() * v;
        vy = Math.pow(-1, Math.floor(Math.random() * 10)) * Math.sqrt(v * v - vx * vx);
        p = new Particula(x, y, raio, vx, vy, "black");
        elementos.push(p);
    }

    if (refletiu) { // processamento com reflexão
        acao = setInterval(() => { processarTudo(refletir) }, 100);
    } else if (fundiu) { // processamento com fusão
        acao = setInterval(() => { processarTudo(fundir) }, 100);
    } else { // processamento do movimento browniano
        elementos[0].rastro = true;

        for (let i = 1; i < elementos.length; i++) {
            elementos[i].ativoDesenhar = false;
        }

        ctx.clearRect(0, 0, 300, 300);
        acao = setInterval(() => { processarTudo(refletir) }, 100)
    }
});

form.addEventListener("reset", () => {
    clearInterval(acao);
    ctx.clearRect(0, 0, 300, 300);
    canvas.style.width = "300px";
    canvas.style.height = "300px";
    resp1.innerText = "";
    resp2.innerText = "";
    resp3.innerText = "";
});

/*=====================================Funções de Processamento====================================*/
function processarTudo(callback) {
    if (!elementos[0].rastro) ctx.clearRect(0, 0, 300, 300);

    for (let i = 0; i < elementos.length; i++) {
        elementos[i].atualizar();
        elementos[i].desenhar();

        for (let j = 0; j < elementos.length; j++) {
            if (i == j) continue;

            if (elementos[i].colidiuCom(elementos[j])) {
                callback(elementos[i], elementos[j]);
            }
        }
    }
}

function refletir(a, b) {
    let v = a.vx;
    a.vx = b.vx;
    b.vx = v;
    v = a.vy;
    a.vy = b.vy;
    b.vy = v;
}

function fundir(a, b) {
    let vx = (a.vx + b.vx) / 2;
    let vy = (a.vy + b.vy) / 2;
    a.vx = vx;
    a.vy = vy;
    a.r = Math.sqrt(a.r * a.r + b.r * b.r);
    b.ativo = false;
    b.x = 1500;
}