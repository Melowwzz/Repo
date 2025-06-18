document.addEventListener('DOMContentLoaded', () => {

    // --- ANIMAÇÃO AO ROLAR ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                
                // LÓGICA NOVA: Animar as barras do gráfico quando visíveis
                if (entry.target.id === 'batalha-numeros') {
                    const barraDesejo = document.querySelector('.bar-clt-desejo'); 
                    const barraNecessidade = document.querySelector('.bar-pj-necessidade');
                    
                    if (barraDesejo) barraDesejo.style.width = '67.7%';
                    if (barraNecessidade) barraDesejo.style.width = '45%';
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

    // --- LÓGICA: ROLAR A PÁGINA AO CLICAR NA SETA DE ABERTURA ---
    const scrollArrowHeader = document.querySelector('.scroll-down-arrow');
    if (scrollArrowHeader) {
        scrollArrowHeader.addEventListener('click', () => {
            const nextSection = document.getElementById('comparativo');
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // --- LÓGICA PARA EXIBIR INFORMAÇÕES ADICIONAIS NOS CARDS (CLT/PJ) ---
    const comparativoCards = document.querySelectorAll('.card-comparativo');

    comparativoCards.forEach(card => {
        card.addEventListener('click', (event) => {
            // Verifica se o clique foi em um link dentro do card, para não ativar/desativar
            if (event.target.tagName === 'A') {
                return; // Se clicou em um link, não faz nada com o card
            }

            const infoAdicional = card.querySelector('.info-adicional');
            if (infoAdicional) {
                // Usa a verificação de toque ou largura de tela
                if (window.innerWidth < 768 || ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
                    // Se o card já estiver ativo, ele fecha. Se não, ele abre.
                    if (card.classList.contains('is-active')) {
                        card.classList.remove('is-active');
                    } else {
                        // Fecha outros cards abertos (opcional, para não ter vários abertos ao mesmo tempo)
                        comparativoCards.forEach(otherCard => {
                            if (otherCard !== card) { // Garante que não fecha o card atual
                                otherCard.classList.remove('is-active');
                            }
                        });
                        card.classList.add('is-active');
                    }
                }
            }
        });
    });

    // --- LÓGICA PARA FAZER A SETA DA TABELA APARECER E DESAPARECER (Otimizada) ---
    const tabelaScrollWrapper = document.querySelector('.tabela-scroll-wrapper');
    const scrollIndicatorArrow = document.querySelector('.scroll-indicator-arrow');

    if (tabelaScrollWrapper && scrollIndicatorArrow) {
        let scrollTimeout; // Para debounce

        const checkScrollPosition = () => {
            clearTimeout(scrollTimeout); // Limpa o timeout anterior
            scrollTimeout = setTimeout(() => { // Define um novo timeout
                const hasHorizontalScroll = tabelaScrollWrapper.scrollWidth > tabelaScrollWrapper.clientWidth;
                const isScrolledToStart = tabelaScrollWrapper.scrollLeft < 20; // Pequena margem para o início

                if (hasHorizontalScroll && isScrolledToStart) {
                    scrollIndicatorArrow.classList.add('is-visible');
                } else {
                    scrollIndicatorArrow.classList.remove('is-visible');
                }
            }, 100); // Debounce de 100ms: espera 100ms para ver se o scroll parou
        };

        tabelaScrollWrapper.addEventListener('scroll', checkScrollPosition);
        window.addEventListener('resize', checkScrollPosition); // Recheca no redimensionamento
        checkScrollPosition(); // Chama uma vez para o estado inicial
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
