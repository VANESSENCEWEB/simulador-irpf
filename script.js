/* ─── TABELA IRPF JANEIRO 2025 ─── */
var FAIXAS = [
    { label: '1ª Faixa', limite: 2259.20, pill: 'p0', texto: 'Isento 0%' },
    { label: '2ª Faixa', limite: 2826.65, pill: 'p7', texto: '7,5%' },
    { label: '3ª Faixa', limite: 3751.05, pill: 'p15', texto: '15%' },
    { label: '4ª Faixa', limite: 4664.68, pill: 'p22', texto: '22,5%' },
    { label: '5ª Faixa', limite: Infinity, pill: 'p27', texto: '27,5%' },
];

/* ─── FUNÇÃO 1: calcularAliquotaEfetiva ───
   Parâmetros: salario (number), ir (number)
   Retorno: porcentagem efetiva (number)        */
function calcularAliquotaEfetiva(salario, ir) {
    if (salario === 0) return 0;
    return (ir / salario) * 100;
}

/* ─── FUNÇÕES POR FAIXA ─── */
function calcularFaixa1(s) { return 0; }
function calcularFaixa2(s) {
    if (s <= 2259.20) return 0;
    return (Math.min(s, 2826.65) - 2259.20) * 0.075;
}
function calcularFaixa3(s) {
    if (s <= 2826.65) return 0;
    return (Math.min(s, 3751.05) - 2826.65) * 0.15;
}
function calcularFaixa4(s) {
    if (s <= 3751.05) return 0;
    return (Math.min(s, 4664.68) - 3751.05) * 0.225;
}
function calcularFaixa5(s) {
    if (s <= 4664.68) return 0;
    return (s - 4664.68) * 0.275;
}

/* ─── FUNÇÃO 2: calcularImpostoDue ───
   Parâmetro: salario (number)
   Retorno: total do imposto (number)
   Chama uma função para cada faixa      */
function calcularImpostoDue(s) {
    return calcularFaixa1(s) + calcularFaixa2(s)
        + calcularFaixa3(s) + calcularFaixa4(s)
        + calcularFaixa5(s);
}

/* ─── UTILITÁRIOS ─── */
function fmtMoeda(v) {
    return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtPct(v) {
    return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
}
function parseSal(txt) {
    return parseFloat(txt.trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.'));
}

/* ─── CALCULAR ─── */
function calcular() {
    var inp = document.getElementById('salario');
    var err = document.getElementById('erroInput');
    var btn = document.getElementById('btnCalc');
    btn.classList.add('loading');

    setTimeout(function () {
        btn.classList.remove('loading');
        var s = parseSal(inp.value);
        if (isNaN(s) || s <= 0) {
            err.classList.add('vis');
            inp.style.borderColor = '#d32f2f';
            return;
        }
        err.classList.remove('vis');
        inp.style.borderColor = '';

        var ir = calcularImpostoDue(s);
        var alq = calcularAliquotaEfetiva(s, ir);

        document.getElementById('valorImposto').textContent = 'R$ ' + fmtMoeda(ir);
        document.getElementById('valorAliquota').textContent = fmtPct(alq);

        preencherTabela(s);

        var pct = Math.min((alq / 27.5) * 100, 100);
        document.getElementById('progFill').style.width = pct + '%';
        document.getElementById('progPct').textContent = fmtPct(alq);

        var res = document.getElementById('resultado');
        res.classList.add('vis');

        dispararConfete();
        if (ir === 0) setTimeout(mostrarCarimbo, 450);

        setTimeout(function () { res.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
    }, 350);
}

/* ─── PREENCHER TABELA ─── */
function preencherTabela(s) {
    var tbody = document.getElementById('tbodyRes');
    tbody.innerHTML = '';
    var vals = [calcularFaixa1(s), calcularFaixa2(s), calcularFaixa3(s), calcularFaixa4(s), calcularFaixa5(s)];
    var fAtiva = 0;
    for (var i = 0; i < FAIXAS.length; i++) {
        if (s > (i > 0 ? FAIXAS[i - 1].limite : 0)) fAtiva = i;
    }
    var lims = ['Até R$ 2.259,20', 'Até R$ 2.826,65', 'Até R$ 3.751,05', 'Até R$ 4.664,68', 'Acima de R$ 4.664,68'];

    FAIXAS.forEach(function (f, i) {
        var tr = document.createElement('tr');
        if (i === fAtiva) tr.classList.add('ativa');
        var marc = (i === fAtiva) ? '<span class="marcador">◀ sua faixa</span>' : '';
        tr.innerHTML =
            '<td><span class="pill ' + f.pill + '">' + f.texto + '</span>' + marc + '</td>' +
            '<td class="mono col-h">' + lims[i] + '</td>' +
            '<td class="dir" style="color:' + (vals[i] > 0 ? 'var(--azul)' : 'var(--texto-3)') + ';">' + (vals[i] > 0 ? 'R$ ' + fmtMoeda(vals[i]) : '—') + '</td>';
        tbody.appendChild(tr);
    });

    var tot = vals.reduce(function (a, b) { return a + b; }, 0);
    var tt = document.createElement('tr');
    tt.style.fontWeight = '700';
    tt.style.borderTop = '2px solid var(--borda)';
    tt.innerHTML = '<td colspan="2">Total do Imposto</td><td class="dir" style="color:var(--verde);">R$ ' + fmtMoeda(tot) + '</td>';
    tbody.appendChild(tt);
}

/* ─── LIMPAR ─── */
function limpar() {
    pararConfete();
    document.getElementById('salario').value = '';
    document.getElementById('salario').style.borderColor = '';
    document.getElementById('erroInput').classList.remove('vis');
    document.getElementById('resultado').classList.remove('vis');
    document.getElementById('progFill').style.width = '0%';
    document.getElementById('salario').focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─── GERAR PDF ─── */
function gerarPDF() {
    var s = parseSal(document.getElementById('salario').value);
    var ir = calcularImpostoDue(s);
    var irT = document.getElementById('valorImposto').textContent;
    var alT = document.getElementById('valorAliquota').textContent;

    var doc = new jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    var W = doc.internal.pageSize.getWidth(), M = 20;

    doc.setFillColor(0, 48, 130); doc.rect(0, 0, W, 34, 'F');
    doc.setFillColor(0, 156, 59); doc.rect(0, 34, W / 3, 3, 'F');
    doc.setFillColor(255, 180, 0); doc.rect(W / 3, 34, W / 3, 3, 'F');
    doc.setFillColor(0, 48, 130); doc.rect(2 * W / 3, 34, W / 3, 3, 'F');

    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(15);
    doc.text('SIMULADOR IRPF 2025', M, 14);
    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
    doc.text('Receita Federal do Brasil · Cálculo Mensal · Janeiro/2025', M, 22);
    doc.text('UNICAP · Programação para Web · Vanessa Rafaella', M, 29);
    doc.text('Emitido em: ' + new Date().toLocaleDateString('pt-BR'), W - M, 29, { align: 'right' });

    var y = 46;
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 102, 51);
    doc.text('DADOS DE ENTRADA', M, y);
    doc.setDrawColor(0, 102, 51); doc.setLineWidth(.3); doc.line(M, y + 2, W - M, y + 2); y += 10;
    doc.setTextColor(18, 33, 58); doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.text('Salário Mensal Bruto:', M, y); doc.setFont('helvetica', 'bold');
    doc.text('R$ ' + fmtMoeda(s), 90, y); y += 14;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(0, 102, 51);
    doc.text('RESULTADO DO CÁLCULO', M, y); doc.line(M, y + 2, W - M, y + 2); y += 10;

    doc.setFillColor(216, 245, 229); doc.roundedRect(M, y, 80, 22, 3, 3, 'F');
    doc.setTextColor(90, 106, 126); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    doc.text('IMPOSTO A RECOLHER', M + 4, y + 8);
    doc.setTextColor(0, 102, 51); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text(irT, M + 4, y + 18);

    doc.setFillColor(216, 229, 245); doc.roundedRect(112, y, 80, 22, 3, 3, 'F');
    doc.setTextColor(90, 106, 126); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    doc.text('ALÍQUOTA EFETIVA', 116, y + 8);
    doc.setTextColor(0, 48, 130); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text(alT, 116, y + 18); y += 30;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(0, 102, 51);
    doc.text('DETALHAMENTO POR FAIXA', M, y); doc.line(M, y + 2, W - M, y + 2); y += 10;

    doc.setFillColor(0, 48, 130); doc.rect(M, y, W - 2 * M, 8, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
    doc.text('Faixa', M + 3, y + 5.5); doc.text('Alíquota', 68, y + 5.5);
    doc.text('Limite', 96, y + 5.5); doc.text('Imposto na Faixa', 190, y + 5.5, { align: 'right' }); y += 8;

    var vals = [calcularFaixa1(s), calcularFaixa2(s), calcularFaixa3(s), calcularFaixa4(s), calcularFaixa5(s)];
    var aqT = ['Isenta (0%)', '7,5%', '15%', '22,5%', '27,5%'];
    var limT = ['Até R$ 2.259,20', 'Até R$ 2.826,65', 'Até R$ 3.751,05', 'Até R$ 4.664,68', 'Acima de R$ 4.664,68'];

    FAIXAS.forEach(function (f, i) {
        doc.setFillColor(i % 2 === 0 ? 248 : 241, i % 2 === 0 ? 250 : 245, i % 2 === 0 ? 252 : 250);
        doc.rect(M, y, W - 2 * M, 8, 'F');
        doc.setTextColor(18, 33, 58); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
        doc.text(f.label, M + 3, y + 5.5); doc.text(aqT[i], 68, y + 5.5); doc.text(limT[i], 96, y + 5.5);
        doc.setFont('helvetica', 'bold');
        doc.text(vals[i] > 0 ? 'R$ ' + fmtMoeda(vals[i]) : '—', 190, y + 5.5, { align: 'right' }); y += 8;
    });

    doc.setFillColor(0, 102, 51); doc.rect(M, y, W - 2 * M, 8, 'F');
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.text('TOTAL DO IMPOSTO', M + 3, y + 5.5); doc.text(irT, 190, y + 5.5, { align: 'right' }); y += 16;

    doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(140, 155, 170);
    doc.text('Documento para fins educacionais · UNICAP · Programação para Web · Vanessa Rafaella · Jan/2025', M, y);
    doc.text('Fonte: Receita Federal do Brasil — www.gov.br/receitafederal', M, y + 5);

    doc.save('IRPF_2025_R$' + fmtMoeda(s) + '.pdf');
}

/* ─── CONFETE ─── */
var CORES = ['#009c3b', '#FFB400', '#003082', '#fff', '#ff4444', '#ff9900', '#00ccff'];
var FORMAS = ['rect', 'circle', 'tri'];
var parts = [], rafId = null, cvs, ctx2;

function dispararConfete() {
    cvs = document.getElementById('confete');
    ctx2 = cvs.getContext('2d');
    cvs.width = window.innerWidth; cvs.height = window.innerHeight;
    cvs.style.display = 'block'; parts = [];
    for (var i = 0; i < 130; i++) {
        parts.push({
            x: Math.random() * cvs.width, y: Math.random() * -cvs.height,
            sz: Math.random() * 10 + 5, cor: CORES[Math.floor(Math.random() * CORES.length)],
            sh: FORMAS[Math.floor(Math.random() * FORMAS.length)],
            vy: Math.random() * 3 + 2, vx: Math.random() * 2 - 1,
            rot: Math.random() * 360, vr: Math.random() * 6 - 3
        });
    }
    if (rafId) cancelAnimationFrame(rafId);
    loopConfete();
    setTimeout(pararConfete, 3600);
}

function loopConfete() {
    ctx2.clearRect(0, 0, cvs.width, cvs.height);
    var fora = true;
    parts.forEach(function (p) {
        p.y += p.vy; p.x += p.vx; p.rot += p.vr;
        if (p.y < cvs.height + 20) fora = false;
        ctx2.save(); ctx2.translate(p.x, p.y);
        ctx2.rotate(p.rot * Math.PI / 180);
        ctx2.fillStyle = p.cor; ctx2.globalAlpha = .9;
        if (p.sh === 'rect') { ctx2.fillRect(-p.sz / 2, -p.sz / 4, p.sz, p.sz / 2); }
        else if (p.sh === 'circle') { ctx2.beginPath(); ctx2.arc(0, 0, p.sz / 2, 0, Math.PI * 2); ctx2.fill(); }
        else { ctx2.beginPath(); ctx2.moveTo(0, -p.sz / 2); ctx2.lineTo(p.sz / 2, p.sz / 2); ctx2.lineTo(-p.sz / 2, p.sz / 2); ctx2.closePath(); ctx2.fill(); }
        ctx2.restore();
    });
    if (!fora) rafId = requestAnimationFrame(loopConfete); else pararConfete();
}

function pararConfete() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (cvs) { cvs.style.display = 'none'; ctx2.clearRect(0, 0, cvs.width, cvs.height); }
}

/* ─── CARIMBO ─── */
function mostrarCarimbo() {
    var el = document.getElementById('carimbo');
    el.classList.add('ativo');
    setTimeout(function () {
        el.style.transition = 'opacity .5s ease'; el.style.opacity = '0';
        setTimeout(function () { el.classList.remove('ativo'); el.style.opacity = ''; el.style.transition = ''; }, 500);
    }, 2000);
}

/* ─── ACORDEÃO ─── */
function toggleAcord(header) {
    var body = header.nextElementSibling;
    var aberto = header.classList.contains('aberto');

    // Fecha todos os outros
    document.querySelectorAll('.acord-header.aberto').forEach(function (h) {
        h.classList.remove('aberto');
        h.setAttribute('aria-expanded', 'false');
        h.nextElementSibling.classList.remove('aberto');
    });

    // Se estava fechado, abre este
    if (!aberto) {
        header.classList.add('aberto');
        header.setAttribute('aria-expanded', 'true');
        body.classList.add('aberto');
    }
}

/* ─── EVENTOS ─── */
document.getElementById('salario').addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/[^\d,\.]/g, '');
});
document.getElementById('salario').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') calcular();
});
