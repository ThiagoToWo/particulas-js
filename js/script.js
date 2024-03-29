/*=====================================Variáveis Globais====================================*/
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const form = document.querySelector("form");
const resp1 = document.querySelector("#f");
const resp2 = document.querySelector("#T");
const resp3 = document.querySelector("#l");
const resp4 = document.querySelector("#tReal");
let elementos;
let acao;
let tReal;
let contandoTempo;

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

    canvas.width = a;
    canvas.height = a;

    const n = N / (a * a);
    const f = Math.SQRT2 * n * Math.PI * d * d * v;
    const T = 1 / f;
    const l = v * T;

    resp1.innerText = `Frequência Média de Colisões (f) = ${f.toPrecision(5)} /s`;
    resp2.innerText = `Período Médio entre Colisões (T) = ${T.toPrecision(5)} s`;
    resp3.innerText = `Livre Percurso Médio (l) = ${l.toPrecision(5)} cm`;

    let x = d / 2 + Math.random() * (canvas.width - d / 2);
    let y = d / 2 + Math.random() * (canvas.height - d / 2);    //melhorar essa velocidade
    let vx = -v + Math.random() * 2 * v;
    let sinal = Math.random() >= 0.5 ? 1 : -1;
    let vy = sinal * Math.sqrt(v * v - vx * vx);
    let p = new Particula(x, y, d / 2, vx, vy, "red", ctx);
    elementos = [p];

    for (let i = 0; i < N - 1; i++) {
        x = d / 2 + Math.random() * (canvas.width - d / 2);
        y = d / 2 + Math.random() * (canvas.height - d / 2);
        vx = -v + Math.random() * 2 * v;
        sinal = Math.random() >= 0.5 ? 1 : -1;
        vy = sinal * Math.sqrt(v * v - vx * vx);
        p = new Particula(x, y, d / 2, vx, vy, "black", ctx);
        elementos.push(p);
    }

    tReal = 0;
    contandoTempo = true;

    momento();

    if (refletiu) { // processamento com reflexão
        acao = setInterval(() => { processarTudo(refletir) }, 100);
    } else if (fundiu) { // processamento com fusão
        acao = setInterval(() => { processarTudo(fundir) }, 100);
    } else { // processamento do movimento browniano
        elementos[0].rastro = true;

        for (let i = 1; i < elementos.length; i++) {
            elementos[i].ativoDesenhar = false;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        acao = setInterval(() => { processarTudo(refletir) }, 100)
    }
});

form.addEventListener("reset", () => {
    clearInterval(acao);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.width = "300px";
    canvas.style.height = "300px";
    resp1.innerText = "";
    resp2.innerText = "";
    resp3.innerText = "";
    resp4.innerText = "";
});

/*=====================================Funções de Processamento====================================*/
function processarTudo(callback) {
    if (!elementos[0].rastro) ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < elementos.length; i++) {
        elementos[i].atualizar();
        elementos[i].desenhar();

        for (let j = i + 1; j < elementos.length; j++) {
            if (elementos[i].colidiuCom(elementos[j])) {
                callback(elementos[i], elementos[j]);
            }
        }
    }

    momento();

    if (contandoTempo) {
        tReal += 0.1;
        resp4.innerText = `Tempo Real de Experiência = ${tReal.toPrecision(5)} s`;
        if (elementos.length == 1) contandoTempo = false;
    }
}

function refletir(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const angulo = Math.atan2(dx, dy);
    const sen = Math.sin(angulo);
    const cos = Math.cos(angulo);
    
    let x0 = 0;
    let y0 = 0;

    let x1 = dx * cos + dy * sen;
    let y1 = dy * cos - dx * sen;

    let vx0 = a.vx * cos + a.vy * sen;
    let vy0 = a.vy * cos - a.vy * sen;

    let vx1 = b.vx * cos + b.vy * sen;
    let vy1 = b.vy * cos - b.vy * sen;

    let vxRel = vx0 - vx1;
    vx0 = ((a.m - b.m) * vx0 + 2 * b.m * vx1) / (a.m + b.m);
    vx1 = vxRel + vx0;

    x0 += vx0;
    x1 += vx1;

    let x0Final = x0 * cos - y0 * sen;
    let y0Final = y0 * cos + x0 * sen;
    let x1Final = x1 * cos - y1 * sen;
    let y1Final = y1 * cos + x1 * sen;
    
    b.x = a.x + x1Final;
    b.y = a.y + y1Final;
    a.x = a.x + x0Final;
    a.y = a.y + y0Final;
    
    a.vx = vx0 * cos - vy0 * sen;
    a.vy = vy0 * cos + vx0 * sen;
    b.vx = vx1 * cos - vy1 * sen;
    b.vy = vy1 * cos + vx1 * sen;
}

function fundir(a, b) {
    const m = a.m + b.m;
    const x = (a.m * a.x + b.m * b.x) / m;
    const y = (a.m * a.y + b.m * b.y) / m;
    const vx = (a.m * a.vx + b.m * b.vx) / m;
    const vy = (a.m * a.vy + b.m * b.vy) / m;
    const r = Math.sqrt(a.r ** 2 + b.r ** 2);

    a.x = x;
    a.y = y;
    a.r = r;
    a.vx = vx;
    a.vy = vy;
    a.m = m;
    elementos.splice(elementos.indexOf(b), 1);
}

function momento() {
    //Cálculo do momento linear em cada componente
    let qx = 0;
    let qy = 0;
    let q;

    for (let i = 0; i < elementos.length; i++) {
        const e = elementos[i];        
        qx += e.m * e.vx;
        qy += e.m * e.vy;
        q = Math.sqrt(qx * qx + qy * qy);
    }

    console.log("qx =", qx, "qy =", qy, "q = ", q);
}