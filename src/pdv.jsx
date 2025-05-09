import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

const PDV = () => {
  const [codigo, setCodigo] = useState('');
  const [vendas, setVendas] = useState(() => {
    const vendasSalvas = localStorage.getItem('vendas');
    return vendasSalvas ? JSON.parse(vendasSalvas) : [];
  });
  const [mensagem, setMensagem] = useState('');

  const categorias = ['Informática', 'Papelaria', 'Serviços'];
  const formasPagamento = [
    'Débito Infinite',
    'Crédito Infinite',
    'Pix Infinite',
    'Pix Caixa',
    'Cheque',
    'Transferência',
    'Dinheiro',
  ];

  const estadoInicial = categorias.reduce((acc, cat) => {
    acc[cat] = { forma: '', valor: '' };
    return acc;
  }, {});

  const [campos, setCampos] = useState(estadoInicial);

  const formatarValor = (valor) => {
    const num = valor.replace(/[^\d]/g, '');
    const centavos = (parseInt(num, 10) / 100).toFixed(2);
    return centavos.replace('.', ',');
  };

  const handleValorChange = (categoria) => (e) => {
    const input = e.target.value;
    const formatado = formatarValor(input);
    setCampos({
      ...campos,
      [categoria]: { ...campos[categoria], valor: formatado },
    });
  };

  const handleFormaPagamentoChange = (categoria) => (e) => {
    const forma = e.target.value;
    setCampos({
      ...campos,
      [categoria]: { ...campos[categoria], forma },
    });
  };

  const armazenarVenda = () => {
    const dataHora = new Date().toLocaleString('pt-BR');
    const novasVendas = [];

    categorias.forEach((cat) => {
      const valor = campos[cat].valor;
      const forma = campos[cat].forma;
      if (valor && forma) {
        novasVendas.push({
          codigo,
          formaPagamento: forma,
          valor: parseFloat(valor.replace(',', '.')),
          categoria: cat,
          dataHora,
        });
      }
    });

    if (novasVendas.length === 0) {
      alert('Preencha ao menos uma categoria com forma de pagamento e valor.');
      return;
    }

    const atualizadas = [...vendas, ...novasVendas];
    setVendas(atualizadas);
    localStorage.setItem('vendas', JSON.stringify(atualizadas));

    setCodigo('');
    setCampos(estadoInicial);
    setMensagem('Venda(s) armazenada(s) com sucesso!');
    setTimeout(() => setMensagem(''), 2000);
  };

  const gerarRelatorio = (categoriaFiltrada = null) => {
    const doc = new jsPDF();
    const dataAtual = new Date().toLocaleDateString('pt-BR').replaceAll('/', '-');
    let y = 10;

    const categoriasParaRelatorio = categoriaFiltrada ? [categoriaFiltrada] : categorias;

    categoriasParaRelatorio.forEach((categoria) => {
      const vendasCategoria = vendas.filter((v) => v.categoria === categoria);
      let total = 0;
      const totaisPorPagamento = {};

      if (vendasCategoria.length === 0) return;

      doc.setFontSize(14);
      doc.text(`Relatório de Vendas - ${categoria}`, 10, y);
      y += 10;

      doc.setFontSize(11);
      doc.text('Data/Hora', 10, y);
      doc.text('Código', 55, y);
      doc.text('Forma Pgto', 95, y);
      doc.text('Valor (R$)', 150, y);
      y += 8;

      vendasCategoria.forEach((venda) => {
        doc.text(venda.dataHora, 10, y);
        doc.text(venda.codigo, 55, y);
        doc.text(venda.formaPagamento, 95, y);
        doc.text(venda.valor.toFixed(2).replace('.', ','), 150, y);
        total += venda.valor;
        totaisPorPagamento[venda.formaPagamento] =
          (totaisPorPagamento[venda.formaPagamento] || 0) + venda.valor;
        y += 7;
        if (y > 270) {
          doc.addPage();
          y = 10;
        }
      });

      y += 5;
      doc.setFontSize(12);
      doc.text(`Total de ${categoria}: R$ ${total.toFixed(2).replace('.', ',')}`, 10, y);
      y += 10;

      doc.setFontSize(11);
      doc.text('Totais por Forma de Pagamento:', 10, y);
      y += 8;
      Object.entries(totaisPorPagamento).forEach(([forma, valor]) => {
        doc.text(`${forma}: R$ ${valor.toFixed(2).replace('.', ',')}`, 10, y);
        y += 7;
      });

      y += 10;
    });

    doc.save(`relatorio-vendas-${categoriaFiltrada || 'geral'}-${dataAtual}.pdf`);
  };

  const limparDados = () => {
    localStorage.removeItem('vendas');
    setVendas([]);
    setMensagem('Dados apagados com sucesso.');
    setTimeout(() => setMensagem(''), 2000);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-center">PDV - Registro de Vendas</h1>

      <input
        type="text"
        placeholder="Código da venda"
        className="border rounded-lg w-full p-3 text-lg"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />

      <div className="grid md:grid-cols-3 gap-6">
        {categorias.map((cat) => (
          <div key={cat} className="border rounded-xl p-4 bg-gray-50">
            <h2 className="text-lg font-semibold mb-2 text-center">{cat}</h2>
            <select
              className="border rounded w-full p-2 mb-2"
              value={campos[cat].forma}
              onChange={handleFormaPagamentoChange(cat)}
            >
              <option value="">Forma de pagamento</option>
              {formasPagamento.map((forma, idx) => (
                <option key={idx} value={forma}>{forma}</option>
              ))}
            </select>
            <input
              type="text"
              inputMode="numeric"
              placeholder={`Valor em R$ - ${cat}`}
              className="border rounded w-full p-2"
              value={campos[cat].valor}
              onChange={handleValorChange(cat)}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
        <button
          onClick={armazenarVenda}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded text-lg"
        >
          Armazenar Venda
        </button>
        {mensagem && <p className="text-green-600 font-semibold">{mensagem}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={() => gerarRelatorio()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Gerar Relatório Geral
        </button>

        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => gerarRelatorio(cat)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
          >
            Gerar Relatório: {cat}
          </button>
        ))}

        <button
          onClick={limparDados}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Limpar Todos os Dados
        </button>
      </div>
    </div>
  );
};

export default PDV;
