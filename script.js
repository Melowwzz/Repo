// IMPORTANTE: ESTE SCRIPT É MINIMALISTA PARA TESTE, APENAS PARA VER SE A PÁGINA CARREGA!
// Se a página carregar com ele, vamos reintroduzir as funcionalidades passo a passo.

document.addEventListener('DOMContentLoaded', () => {
    // Apenas a lógica da calculadora básica, sem animações complexas ou observers
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

        // Apenas para mostrar o valor direto, sem animação de contagem
        resultadoCltEl.textContent = formatCurrency(salarioLiquidoClt);
        resultadoPjEl.textContent = formatCurrency(salarioLiquidoPj);
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

    // Inicia o cálculo com o valor padrão ao carregar a página
    calcularSalarios();
});
