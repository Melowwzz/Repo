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
        card.addEventListener('click', () => {
            // Verifica se o dispositivo é móvel ou tela pequena (largura < 768px)
            // Ou se é um dispositivo de toque (para tablets, etc.)
            if (window.innerWidth < 768 || ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
                card.classList.toggle('is-active'); // Adiciona/remove a classe para mostrar/esconder
            }
            // Para desktop (largura >= 768px), o hover já faz a função
        });
    });


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
