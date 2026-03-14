/* ════════════════════════════════════════════════════════
       DADOS — TABELA IRPF JANEIRO 2025
════════════════════════════════════════════════════════ */


    var FAIXAS = [
      { label: '1ª Faixa', limite: 2259.20,  pill: 'p0',  texto: 'Isento 0%' },
      { label: '2ª Faixa', limite: 2826.65,  pill: 'p7',  texto: '7,5%'      },
      { label: '3ª Faixa', limite: 3751.05,  pill: 'p15', texto: '15%'       },
      { label: '4ª Faixa', limite: 4664.68,  pill: 'p22', texto: '22,5%'     },
      { label: '5ª Faixa', limite: Infinity, pill: 'p27', texto: '27,5%'     },
      /* Infinity = sem limite superior — valor especial do JavaScript */
    ];

    /* ════════════════════════════════════════════════════════
       FUNÇÕES DE CÁLCULO — UMA POR FAIXA 
       ════════════════════════════════════════════════════════

       Lógica de cada faixa:
       1. Se salário não chegou nessa faixa → retorna 0
       2. Math.min(s, limite): garante que não ultrapassa o teto
       3. Subtrai o início da faixa e multiplica pela alíquota

       EXEMPLO s = R$ 3.000:
       Faixa2: min(3000, 2826.65) = 2826.65
               2826.65 - 2259.20 = 567.45 × 7.5% = R$ 42,56
       Faixa3: min(3000, 3751.05) = 3000
               3000 - 2826.65    = 173.35 × 15%  = R$ 26,00
       Total: R$ 68,56
       ════════════════════════════════════════════════════════ */

    /* Faixa 1 — isenta, sempre zero */
    function calcularFaixa1(s) {
      return 0;
    }

    /* Faixa 2 — 7,5% sobre excedente até R$ 2.826,65 */
    function calcularFaixa2(s) {
      if (s <= 2259.20) return 0;
      return (Math.min(s, 2826.65) - 2259.20) * 0.075;
    }

    /* Faixa 3 — 15% sobre excedente até R$ 3.751,05 */
    function calcularFaixa3(s) {
      if (s <= 2826.65) return 0;
      return (Math.min(s, 3751.05) - 2826.65) * 0.15;
    }

    /* Faixa 4 — 22,5% sobre excedente até R$ 4.664,68 */
    function calcularFaixa4(s) {
      if (s <= 3751.05) return 0;
      return (Math.min(s, 4664.68) - 3751.05) * 0.225;
    }

    /* Faixa 5 — 27,5% sobre tudo acima de R$ 4.664,68 (sem limite) */
    function calcularFaixa5(s) {
      if (s <= 4664.68) return 0;
      return (s - 4664.68) * 0.275;
      /* Sem Math.min: faixa 5 não tem teto superior */
    }

    /* Soma todas as faixas — cada uma retorna 0 se não atingida */
    function calcularImpostoDue(s) {
      return calcularFaixa1(s)
           + calcularFaixa2(s)
           + calcularFaixa3(s)
           + calcularFaixa4(s)
           + calcularFaixa5(s);
    }

    /* Alíquota efetiva: imposto ÷ salário × 100
       Proteção contra divisão por zero (retornaria Infinity) */
    function calcularAliquotaEfetiva(salario, ir) {
      if (salario === 0) return 0;
      return (ir / salario) * 100;
    }


    /* ════════════════════════════════════════════════════════
       UTILITÁRIOS DE FORMATAÇÃO
       ════════════════════════════════════════════════════════ */

    /* toLocaleString('pt-BR'): formata para padrão brasileiro.
       1234.5 → "1.234,50" (ponto milhar, vírgula decimal) */
    function fmtMoeda(v) {
      return v.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    function fmtPct(v) {
      return v.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + '%';
    }

    /* Converte texto do input para número.
       "3.000,50" → 3000.50
       Passos:
       1. trim()           → remove espaços nas bordas
       2. replace(/\./g,'')→ remove pontos de milhar  "3.000" → "3000"
       3. replace(',','.')  → vírgula → ponto         "3000,50" → "3000.50"
       4. parseFloat()     → string → number          "3000.50" → 3000.50 */
    function parseSal(txt) {
      return parseFloat(
        txt.trim()
           .replace(/\./g, '')
           .replace(',', '.')
      );
    }


    /* ════════════════════════════════════════════════════════
       FUNÇÃO PRINCIPAL — calcular()
       ════════════════════════════════════════════════════════ */
    function calcular() {
      var btn = document.getElementById('btnCalc');
      var inp = document.getElementById('salario');
      var err = document.getElementById('erroInput');

      /* Mostra spinner, desativa botão (evita clique duplo) */
      btn.classList.add('loading');
      btn.setAttribute('aria-busy', 'true');

      /*
        setTimeout(fn, ms): executa a função após o delay.
        350ms = spinner visível por um tempo antes do resultado.
        Dá sensação de "processando" (melhora UX percebida).
      */
      setTimeout(function() {
        btn.classList.remove('loading');
        btn.setAttribute('aria-busy', 'false');

        /* 1. Lê e converte o valor do input */
        var s = parseSal(inp.value);

        /* 2. Valida: isNaN() = "Is Not a Number?"
              Retorna true se o valor não é um número válido. */
        if (isNaN(s) || s <= 0) {
          err.classList.add('vis');
          inp.style.borderColor = '#d32f2f';
          inp.setAttribute('aria-invalid', 'true');
          inp.focus();   /* devolve foco ao campo com erro */
          return;        /* sai da função — não continua */
        }

        /* 3. Remove estado de erro */
        err.classList.remove('vis');
        inp.style.borderColor = '';
        inp.setAttribute('aria-invalid', 'false');

        /* 4. Calcula */
        var ir  = calcularImpostoDue(s);
        var alq = calcularAliquotaEfetiva(s, ir);

        /* 5. Atualiza a interface (DOM = Document Object Model)
              textContent: altera o texto de um elemento */
        document.getElementById('valorImposto').textContent  = 'R$ ' + fmtMoeda(ir);
        document.getElementById('valorAliquota').textContent = fmtPct(alq);

        /* 6. Preenche tabela de faixas */
        preencherTabela(s);

        /* 7. Barra de progresso (escala 0% a 27.5%) */
        var pct = Math.min((alq / 27.5) * 100, 100);
        document.getElementById('progFill').style.width = pct + '%';
        document.getElementById('progPct').textContent  = fmtPct(alq);
        document.querySelector('[role="progressbar"]').setAttribute('aria-valuenow', alq.toFixed(2));

        /* 8. Mostra seção de resultado */
        var res = document.getElementById('resultado');
        res.classList.add('vis');

        /* 9. Efeitos visuais */
        dispararConfete();
        if (ir === 0) setTimeout(mostrarCarimbo, 450);

        /* 10. Rola suavemente até o resultado */
        setTimeout(function() {
          res.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

      }, 350);
    }


    /* ════════════════════════════════════════════════════════
       PREENCHER TABELA DE RESULTADO
       ════════════════════════════════════════════════════════
       As linhas da tabela sāo criadas via JavaScript (DOM dinâmico)
       porque os valores só existem depois do cálculo.

       document.createElement('tr') = cria uma nova linha <tr>
       tbody.appendChild(tr)        = adiciona ao final da tabela
       ════════════════════════════════════════════════════════ */
    function preencherTabela(s) {
      var tbody = document.getElementById('tbodyRes');
      tbody.innerHTML = '';   /* limpa conteúdo anterior */

      /* Calcula imposto de cada faixa individualmente */
      var vals = [
        calcularFaixa1(s), calcularFaixa2(s), calcularFaixa3(s),
        calcularFaixa4(s), calcularFaixa5(s)
      ];

      /* Descobre qual faixa o salário atingiu (para destacar) */
      var fAtiva = 0;
      for (var i = 0; i < FAIXAS.length; i++) {
        if (s > (i > 0 ? FAIXAS[i-1].limite : 0)) fAtiva = i;
      }

      var lims = [
        'Até R$ 2.259,20', 'Até R$ 2.826,65', 'Até R$ 3.751,05',
        'Até R$ 4.664,68', 'Acima de R$ 4.664,68'
      ];

      /* forEach: percorre cada item do array e executa uma função.
         i = índice (posição), f = o item atual (objeto FAIXAS[i]) */
      FAIXAS.forEach(function(f, i) {
        var tr = document.createElement('tr');
        if (i === fAtiva) tr.classList.add('ativa');   /* destaca faixa atual */

        var marc = (i === fAtiva)
          ? '<span class="marcador">◀ sua faixa</span>'
          : '';

        /* innerHTML: define o HTML interno da linha */
        tr.innerHTML =
          '<td><span class="pill ' + f.pill + '">' + f.texto + '</span>' + marc + '</td>' +
          '<td class="mono col-h">' + lims[i] + '</td>' +
          '<td class="dir" style="color:' + (vals[i] > 0 ? 'var(--color-brand-blue-dark)' : 'var(--color-text-muted)') + ';">' +
            (vals[i] > 0 ? 'R$ ' + fmtMoeda(vals[i]) : '—') +
          '</td>';

        tbody.appendChild(tr);
      });

      /* Linha de total */
      var tot = vals.reduce(function(acc, v) { return acc + v; }, 0);
      /*
        reduce(fn, valorInicial):
        Percorre o array acumulando um valor.
        acc = acumulador (começa em 0)
        v   = valor atual
        Resultado: soma de todos os valores.
      */
      var tt = document.createElement('tr');
      tt.style.fontWeight = '700';
      tt.style.borderTop  = '2px solid var(--borda)';
      tt.innerHTML =
        '<td colspan="2">Total do Imposto</td>' +
        '<td class="dir" style="color:var(--color-brand-green-dark);">R$ ' + fmtMoeda(tot) + '</td>';
      tbody.appendChild(tt);
    }


    /* ════════════════════════════════════════════════════════
       LIMPAR
       ════════════════════════════════════════════════════════ */
    function limpar() {
      pararConfete();
      document.getElementById('salario').value = '';
      document.getElementById('salario').style.borderColor = '';
      document.getElementById('salario').setAttribute('aria-invalid', 'false');
      document.getElementById('erroInput').classList.remove('vis');
      document.getElementById('resultado').classList.remove('vis');
      document.getElementById('progFill').style.width = '0%';
      document.getElementById('salario').focus();
      /* focus() devolve o foco ao campo — boa prática de acessibilidade */
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }


    /* ════════════════════════════════════════════════════════
       GERAR PDF — biblioteca jsPDF
       ════════════════════════════════════════════════════════ */
    function gerarPDF() {
      var s   = parseSal(document.getElementById('salario').value);
      var ir  = calcularImpostoDue(s);
      var irT = document.getElementById('valorImposto').textContent;
      var alT = document.getElementById('valorAliquota').textContent;

      var doc = new jspdf.jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
      var W = doc.internal.pageSize.getWidth(), M = 20;

      doc.setFillColor(0,48,130);  doc.rect(0,0,W,34,'F');
      doc.setFillColor(0,156,59);  doc.rect(0,34,W/3,3,'F');
      doc.setFillColor(255,180,0); doc.rect(W/3,34,W/3,3,'F');
      doc.setFillColor(0,48,130);  doc.rect(2*W/3,34,W/3,3,'F');

      doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(15);
      doc.text('SIMULADOR IRPF 2025', M, 14);
      doc.setFontSize(8.5); doc.setFont('helvetica','normal');
      doc.text('Receita Federal do Brasil · Cálculo Mensal · Janeiro/2025', M, 22);
      doc.text('UNICAP · Programação para Web · Vanessa Rafaella', M, 29);
      doc.text('Emitido em: ' + new Date().toLocaleDateString('pt-BR'), W-M, 29, {align:'right'});

      var y = 46;
      doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(0,102,51);
      doc.text('DADOS DE ENTRADA', M, y);
      doc.setDrawColor(0,102,51); doc.setLineWidth(.3); doc.line(M,y+2,W-M,y+2); y+=10;
      doc.setTextColor(18,33,58); doc.setFont('helvetica','normal'); doc.setFontSize(10);
      doc.text('Salário Mensal Bruto:', M, y); doc.setFont('helvetica','bold');
      doc.text('R$ '+fmtMoeda(s), 90, y); y+=14;

      doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(0,102,51);
      doc.text('RESULTADO DO CÁLCULO', M, y); doc.line(M,y+2,W-M,y+2); y+=10;
      doc.setFillColor(216,245,229); doc.roundedRect(M,y,80,22,3,3,'F');
      doc.setTextColor(90,106,126); doc.setFontSize(7.5); doc.setFont('helvetica','normal');
      doc.text('IMPOSTO A RECOLHER', M+4, y+8);
      doc.setTextColor(0,102,51); doc.setFontSize(14); doc.setFont('helvetica','bold');
      doc.text(irT, M+4, y+18);
      doc.setFillColor(216,229,245); doc.roundedRect(112,y,80,22,3,3,'F');
      doc.setTextColor(90,106,126); doc.setFontSize(7.5); doc.setFont('helvetica','normal');
      doc.text('ALÍQUOTA EFETIVA', 116, y+8);
      doc.setTextColor(0,48,130); doc.setFontSize(14); doc.setFont('helvetica','bold');
      doc.text(alT, 116, y+18); y+=30;

      doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(0,102,51);
      doc.text('DETALHAMENTO POR FAIXA', M, y); doc.line(M,y+2,W-M,y+2); y+=10;
      doc.setFillColor(0,48,130); doc.rect(M,y,W-2*M,8,'F');
      doc.setTextColor(255,255,255); doc.setFontSize(7.5); doc.setFont('helvetica','bold');
      doc.text('Faixa',M+3,y+5.5); doc.text('Alíquota',68,y+5.5);
      doc.text('Limite',96,y+5.5); doc.text('Imposto na Faixa',190,y+5.5,{align:'right'}); y+=8;

      var vals=[calcularFaixa1(s),calcularFaixa2(s),calcularFaixa3(s),calcularFaixa4(s),calcularFaixa5(s)];
      var aqT=['Isenta (0%)','7,5%','15%','22,5%','27,5%'];
      var limT=['Até R$ 2.259,20','Até R$ 2.826,65','Até R$ 3.751,05','Até R$ 4.664,68','Acima de R$ 4.664,68'];

      FAIXAS.forEach(function(f,i){
        doc.setFillColor(i%2===0?248:241,i%2===0?250:245,i%2===0?252:250);
        doc.rect(M,y,W-2*M,8,'F');
        doc.setTextColor(18,33,58); doc.setFont('helvetica','normal'); doc.setFontSize(7.5);
        doc.text(f.label,M+3,y+5.5); doc.text(aqT[i],68,y+5.5); doc.text(limT[i],96,y+5.5);
        doc.setFont('helvetica','bold');
        doc.text(vals[i]>0?'R$ '+fmtMoeda(vals[i]):'—',190,y+5.5,{align:'right'}); y+=8;
      });

      doc.setFillColor(26,115,64); doc.rect(M,y,W-2*M,8,'F');
      doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(8);
      doc.text('TOTAL DO IMPOSTO',M+3,y+5.5); doc.text(irT,190,y+5.5,{align:'right'}); y+=16;

      doc.setFont('helvetica','italic'); doc.setFontSize(7); doc.setTextColor(140,155,170);
      doc.text('Documento para fins educacionais · UNICAP · Programação para Web · Vanessa Rafaella · Jan/2025', M, y);
      doc.text('Fonte: Receita Federal do Brasil — www.gov.br/receitafederal', M, y+5);

      doc.save('IRPF_2025_R$' + fmtMoeda(s) + '.pdf');
    }


    /* ════════════════════════════════════════════════════════
       CANVAS API — CONFETE ANIMADO
       ════════════════════════════════════════════════════════
       Canvas = "tela em branco" onde desenhamos via JavaScript.
       Loop de animação:
       1. Apaga frame anterior (clearRect)
       2. Atualiza física (posição, rotação)
       3. Desenha cada partícula
       4. requestAnimationFrame agenda o próximo frame (~60fps)

       rAF (requestAnimationFrame) vs setInterval:
       ✓ Sincronizado com o refresh da tela (60fps real)
       ✓ Pausa quando a aba fica invisível (economiza CPU)
       ✓ Mais suave, menos uso de bateria no mobile
       ════════════════════════════════════════════════════════ */
    var CORES  = ['#2ecc71','#f5a623','#003082','#fff','#ff4444','#ff9900','#00ccff'];
    var FORMAS = ['rect','circle','tri'];
    var parts  = [], rafId = null, cvs, ctx2;

    function dispararConfete() {
      cvs  = document.getElementById('confete');
      ctx2 = cvs.getContext('2d');   /* pega o "pincel" bidimensional */

      cvs.width  = window.innerWidth;
      cvs.height = window.innerHeight;
      cvs.style.display = 'block';
      parts = [];

      for (var i = 0; i < 130; i++) {
        parts.push({
          x:   Math.random() * cvs.width,   /* X aleatório dentro da tela    */
          y:   Math.random() * -cvs.height, /* Y negativo = começa acima dela */
          sz:  Math.random() * 10 + 5,      /* tamanho: 5 a 15px              */
          cor: CORES[Math.floor(Math.random() * CORES.length)],
          sh:  FORMAS[Math.floor(Math.random() * FORMAS.length)],
          vy:  Math.random() * 3 + 2,       /* velocidade vertical: 2 a 5     */
          vx:  Math.random() * 2 - 1,       /* deriva: -1 a 1 (esq ou dir)    */
          rot: Math.random() * 360,
          vr:  Math.random() * 6 - 3,
        });
      }
      if (rafId) cancelAnimationFrame(rafId);
      loopConfete();
      setTimeout(pararConfete, 3600);
    }

    function loopConfete() {
      ctx2.clearRect(0, 0, cvs.width, cvs.height); /* apaga frame anterior */
      var fora = true;

      parts.forEach(function(p) {
        /* Física: atualiza posição e rotação */
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.vr;
        if (p.y < cvs.height + 20) fora = false;

        /* save/restore: isolam o estado de cada partícula
           (rotação de uma não afeta as outras) */
        ctx2.save();
        ctx2.translate(p.x, p.y);              /* move origem para a partícula */
        ctx2.rotate(p.rot * Math.PI / 180);    /* graus → radianos (×π/180)    */
        ctx2.fillStyle = p.cor;
        ctx2.globalAlpha = .9;

        if      (p.sh === 'rect')   { ctx2.fillRect(-p.sz/2, -p.sz/4, p.sz, p.sz/2); }
        else if (p.sh === 'circle') { ctx2.beginPath(); ctx2.arc(0,0,p.sz/2,0,Math.PI*2); ctx2.fill(); }
        else {
          ctx2.beginPath();
          ctx2.moveTo(0, -p.sz/2);       /* topo */
          ctx2.lineTo(p.sz/2, p.sz/2);   /* baixo direita */
          ctx2.lineTo(-p.sz/2, p.sz/2);  /* baixo esquerda */
          ctx2.closePath();
          ctx2.fill();
        }
        ctx2.restore();
      });

      if (!fora) rafId = requestAnimationFrame(loopConfete);
      else       pararConfete();
    }

    function pararConfete() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      if (cvs)   { cvs.style.display = 'none'; ctx2.clearRect(0,0,cvs.width,cvs.height); }
    }


    /* ════════════════════════════════════════════════════════
       CARIMBO ISENTO
       ════════════════════════════════════════════════════════ */
    function mostrarCarimbo() {
      var el = document.getElementById('carimbo');
      el.classList.add('ativo');
      setTimeout(function() {
        el.style.transition = 'opacity .5s ease';
        el.style.opacity = '0';
        setTimeout(function() {
          el.classList.remove('ativo');
          el.style.opacity = '';
          el.style.transition = '';
        }, 500);
      }, 2000);
    }


    /* ════════════════════════════════════════════════════════
       ACORDEÃO — toggleAcord(header)
       ════════════════════════════════════════════════════════
       Lógica:
       1. Guarda se estava aberto (antes de fechar tudo)
       2. Fecha TODOS os acordeões
       3. Se estava fechado → abre o clicado

       nextElementSibling = próximo elemento irmão no HTML.
       Como .acord-body vem sempre logo após .acord-header,
       isso sempre pega o corpo correto.
       ════════════════════════════════════════════════════════ */
    function toggleAcord(header) {
      var body   = header.nextElementSibling;
      var aberto = header.classList.contains('aberto');
      /* classList.contains: verifica se a classe existe → true/false */

      /* Fecha todos os que estiverem abertos */
      document.querySelectorAll('.acord-header.aberto')
        .forEach(function(h) {
          h.classList.remove('aberto');
          h.setAttribute('aria-expanded', 'false');
          h.nextElementSibling.classList.remove('aberto');
        });

      /* ! = NOT: inverte boolean.
         Se aberto=true → !aberto=false → não entra (já fechou acima)
         Se aberto=false → !aberto=true → entra e abre */
      if (!aberto) {
        header.classList.add('aberto');
        header.setAttribute('aria-expanded', 'true');
        body.classList.add('aberto');
      }
    }


    /* ════════════════════════════════════════════════════════
       EVENTOS — Reagindo às ações do usuário
       ════════════════════════════════════════════════════════
       addEventListener(evento, função):
       "Escuta" por um tipo de evento e executa a função ao ocorrer.
       ════════════════════════════════════════════════════════ */

    /* Filtra caracteres inválidos enquanto o usuário digita */
    document.getElementById('salario').addEventListener('input', function(e) {
      /* /[^\d,\.]/g = regex: remove tudo que NÃO for dígito, vírgula ou ponto
         \d = dígito | , = vírgula | \. = ponto literal | g = global (todos)  */
      e.target.value = e.target.value.replace(/[^\d,\.]/g, '');
    });

    /* Enter no campo de salário aciona o cálculo */
    document.getElementById('salario').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') calcular();
    });

    /* Suporte a teclado nos acordeões (Enter e Espaço) */
    document.querySelectorAll('.acord-header').forEach(function(h) {
      h.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();   /* impede espaço de rolar a página */
          toggleAcord(h);
        }
      });
    });
