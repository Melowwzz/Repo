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

    // Observa todas as seções, excepto a primeira que já é visível
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
                // Usamos window.innerWidth < 768 para identificar mobile
                // Ou a presença de 'ontouchstart' (para dispositivos touch que podem ser maiores)
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

    // --- LÓGICA DO NOVO GRÁFICO DE LINHA (EVOLUÇÃO DO MERCADO) ---
    const ctx = document.getElementById('lineChart');
    if (ctx) {
        console.log('Inicializando Chart.js para o gráfico de linha...');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'], // Rótulos de anos estendidos
                datasets: [
                    {
                        label: 'Trabalhadores CLT (Milhões)',
                        data: [34.2, 35.4, 36.5, 35.8, 34.0, 34.2, 33.2, 33.0, 29.8, 30.5, 36.0, 37.7], // Dados CLT estendidos
                        borderColor: '#22d3ee', // Cor ciano
                        backgroundColor: 'rgba(34, 211, 238, 0.2)', // Cor ciano com transparência
                        tension: 0.2, // Tensão para suavizar a linha
                        fill: false, // Não preenche a área abaixo da linha
                        pointBackgroundColor: '#22d3ee',
                        pointBorderColor: '#0c111d',
                        pointRadius: 5,
                        pointHoverRadius: 7
                    },
                    {
                        label: 'Trabalhadores PJ / Autônomos (Milhões)',
                        data: [20.4, 20.7, 21.2, 22.2, 22.9, 23.2, 23.7, 24.1, 24.9, 25.6, 25.5, 25.6], // Dados PJ/Autônomos estendidos
                        borderColor: '#a78bfa', // Cor roxa
                        backgroundColor: 'rgba(167, 139, 250, 0.2)', // Cor roxa com transparência
                        tension: 0.2, // Tensão para suavizar a linha
                        fill: false, // Não preenche a área abaixo da linha
                        pointBackgroundColor: '#a78bfa',
                        pointBorderColor: '#0c111d',
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(51, 65, 85, 0.5)', // Cor da grade X
                            drawBorder: false
                        },
                        ticks: {
                            color: '#cbd5e1' // Cor dos rótulos X
                        }
                    },
                    y: {
                        beginAtZero: false, // Define o início do eixo Y para não começar do zero
                        min: 20, // Começa o eixo Y em 20 milhões
                        max: 40, // Termina o eixo Y em 40 milhões
                        grid: {
                            color: 'rgba(51, 65, 85, 0.5)', // Cor da grade Y
                            drawBorder: false
                        },
                        ticks: {
                            color: '#cbd5e1' // Cor dos rótulos Y
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#cbd5e1' // Cor do texto da legenda
                        }
                    }
                }
            }
        });
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
