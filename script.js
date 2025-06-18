document.addEventListener('DOMContentLoaded', () => {

    // --- ANIMAÇÃO AO ROLAR ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                // LÓGICA NOVA: Animar as barras do gráfico quando visíveis
                if (entry.target.id === 'batalha-numeros') {
                    const barraDesejo = document.querySelector('.bar-clt-desejo'); // Corrigido o seletor aqui
                    const barraNecessidade = document.querySelector('.bar-pj-necessidade'); // Corrigido o seletor aqui
                    
                    if (barraDesejo) barraDesejo.style.width = '67.7%';
                    if (barraNecessidade) barraNecessidade.style.width = '45%';
                }
            }
        });
    }, {
        threshold: 0.3 // A animação começa quando 30% da seção está visível
    });

    // Observa todas as seções, exceto a primeira que já é visível
    document.querySelectorAll('.section-container:not(#abertura)').forEach(section => {
        observer.observe(section);
    });

    // --- LÓGICA NOVA: ROLAR A PÁGINA AO CLICAR NA SETA DE ABRE ---
    const scrollArrowHeader = document.querySelector('.scroll-down-arrow');
    if (scrollArrowHeader) {
        scrollArrowHeader.addEventListener('click', () => {
            // Rola para a próxima seção (neste caso, a seção 'comparativo')
            const nextSection = document.getElementById('comparativo');
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' }); // Adiciona um scroll suave
            }
        });
    }

    // --- LÓGICA PARA A SETA DE SCROLL DA TABELA ---
    const tabelaScrollWrapper = document.querySelector('.tabela-scroll-wrapper');
    const scrollIndicatorArrow = document.querySelector('.scroll-indicator-arrow'); 

    if (tabelaScrollWrapper && scrollIndicatorArrow) {
        // Função para verificar a posição do scroll e mostrar/esconder a seta
        const checkScrollPosition = () => {
            // Verifica se a tabela tem scroll horizontal (conteúdo maior que a área visível)
            const hasHorizontalScroll = tabelaScrollWrapper.scrollWidth > tabelaScrollWrapper.clientWidth;

            // Se tiver scroll horizontal E não estiver no final do scroll
            // Usei 20 para uma margem maior antes de esconder a seta, pra ela não sumir tão rápido
            // E 0 para scrollLeft > 0 significa que já começou a rolar para a direita
            if (hasHorizontalScroll && tabelaScrollWrapper.scrollLeft < (tabelaScrollWrapper.scrollWidth - tabelaScrollWrapper.clientWidth - 20) && tabelaScrollWrapper.scrollLeft === 0) { 
                // A seta deve aparecer apenas se houver scroll disponível para a direita E se a tabela estiver no início (scrollLeft 0)
                scrollIndicatorArrow.classList.add('is-visible'); // Mostra a seta
            } else {
                scrollIndicatorArrow.classList.remove('is-visible'); // Esconde a seta
            }

            // Adição: fazer a seta aparecer se o scroll estiver no começo e houver mais conteúdo
            if (tabelaScrollWrapper.scrollLeft === 0 && hasHorizontalScroll && tabelaScrollWrapper.scrollWidth > tabelaScrollWrapper.clientWidth) {
                scrollIndicatorArrow.classList.add('is-visible');
            } else if (tabelaScrollWrapper.scrollLeft > 0) {
                // Esconde a seta assim que o usuário começar a rolar para o lado
                scrollIndicatorArrow.classList.remove('is-visible');
            }
        };

        // Adiciona um listener para o evento de scroll no wrapper
        tabelaScrollWrapper.addEventListener('scroll', checkScrollPosition);

        // Chama a função uma vez ao carregar a página para definir o estado inicial da seta
        checkScrollPosition();

        // Opcional: Chama novamente em caso de redimensionamento da janela (seja do navegador ou rotação do celular)
        window.addEventListener('resize', checkScrollPosition);
    }

    // --- LÓGICA DA CALCULADORA ---
    const salarioInput = document.getElementById('salario-bruto');
    const resultadoCltEl = document.getElementById('resultado-clt');
    const resultadoPjEl = document.getElementById('resultado-pj');

    const formatCurrency = (value) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const calcularSalarios = () => {
        let salarioBruto = parseFloat(salarioInput.value.replace(/\D/g,'')) / 100;
        if (isNaN(salarioBruto)) {
             salarioBruto = 0;
        }

        let descontoInss = 0;
        if (salarioBruto <= 1412) descontoInss = salarioBruto * 0.075;
        else if (salarioBruto <= 2666.68) descontoInss = (salarioBruto - 1412) * 0.09 + 105.90;
        else if (salarioBruto <= 4000.03) descontoInss = (salarioBruto - 2666.68) * 0.12 + 218.82;
        else if (salarioBruto <= 7786.02) descontoInss = (salarioBruto - 4000.03) * 0.14 + 378.82;
        else descontoInss = 908.85;

        const baseCalculoIR = salarioBruto - descontoInss;
        let descontoIr = 0;
        if (baseCalculoIR > 2259.20 && baseCalculoIR <= 2826.65) descontoIr = (baseCalculoIR * 0.075) - 169.44;
        else if (baseCalculoIR > 2826.65 && baseCalculoIR <= 3751.05) descontoIr = (baseCalculoIR * 0.15) - 381.44;
        else if (baseCalculoIR > 3751.05 && baseCalculoIR <= 4664.68) descontoIr = (baseCalculoIR * 0.225) - 662.77;
        else if (baseCalculoIR > 4664.68) descontoIr = (baseCalculoIR * 0.275) - 896.00;
        
        const salarioLiquidoClt = salarioBruto - descontoInss - descontoIr;
        const impostoPj = salarioBruto * 0.06;
        const salarioLiquidoPj = salarioBruto - impostoPj;

        animateValue(resultadoCltEl, parseFloat(resultadoCltEl.textContent.replace(/[^\d,]/g, '').replace(',', '.')) || 0, salarioLiquidoClt, 800);
        animateValue(resultadoPjEl, parseFloat(resultadoPjEl.textContent.replace(/[^\d,]/g, '').replace(',', '.')) || 0, salarioLiquidoPj, 800);
    };

    salarioInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g,'');
        if(value === "") {
            e.target.value = "";
            calcularSalarios();
            return;
        }
        value = (parseInt(value, 10) / 100).toLocaleString('pt-BR', {minimumFractionDigits: 2});
        if (value === 'NaN') value = '';
        e.target.value = `R$ ${value}`;
        calcularSalarios();
    });
    
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = progress * (end - start) + start;
            element.textContent = formatCurrency(currentValue);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});
