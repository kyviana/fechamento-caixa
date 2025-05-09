import React, { useState } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

export default function FechamentoCaixa() {
  const [dados, setDados] = useState({
    vendas: [],
    totalVendas: 0,
  });

  // Função para carregar a planilha e extrair os dados
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const binaryString = evt.target.result;
      const workbook = XLSX.read(binaryString, { type: "binary" });

      // Pegando a primeira planilha da pasta de trabalho
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      // Convertendo os dados da planilha para JSON
      const data = XLSX.utils.sheet_to_json(sheet);

      // Processando os dados para estruturar as vendas
      const vendas = data.map((item) => ({
        codigo: item["Código"], // Supondo que a coluna se chame "Código"
        dataVenda: item["Data"], // Supondo que a coluna se chame "Data"
        valor: item["Valor"], // Supondo que a coluna se chame "Valor"
        cliente: item["Cliente"], // Supondo que a coluna se chame "Cliente"
        vendedor: item["Vendedor"], // Supondo que a coluna se chame "Vendedor"
        notaFiscal: item["Nota Fiscal"], // Supondo que a coluna se chame "Nota Fiscal"
        status: item["Status"], // Supondo que a coluna se chame "Status"
      }));

      const totalVendas = vendas.reduce((acc, curr) => acc + curr.valor, 0);

      setDados({ vendas, totalVendas });
    };

    reader.readAsBinaryString(file);
  };

  // Função para gerar o relatório
  const gerarRelatorio = () => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("Fechamento de Caixa - Relatório de Vendas", 20, 20);

    doc.setFontSize(12);
    let yPosition = 30;

    dados.vendas.forEach((venda, index) => {
      doc.text(`Venda ${index + 1}:`, 20, yPosition);
      doc.text(`Código: ${venda.codigo}`, 20, yPosition + 10);
      doc.text(`Data: ${venda.dataVenda}`, 20, yPosition + 20);
      doc.text(`Valor: R$ ${venda.valor.toFixed(2)}`, 20, yPosition + 30);
      doc.text(`Cliente: ${venda.cliente}`, 20, yPosition + 40);
      doc.text(`Vendedor: ${venda.vendedor}`, 20, yPosition + 50);
      doc.text(`Nota Fiscal: ${venda.notaFiscal}`, 20, yPosition + 60);
      doc.text(`Status: ${venda.status}`, 20, yPosition + 70);

      yPosition += 80; // Espaço entre vendas
    });

    doc.text(`Total de Vendas: R$ ${dados.totalVendas.toFixed(2)}`, 20, yPosition + 10);
    doc.save("relatorio_fechamento_caixa.pdf");
  };

  return (
    <div className="card">
      <h1>Fechamento de Caixa</h1>

      {/* Carregar arquivo Excel */}
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        style={{ marginBottom: "20px" }}
      />

      <h2>Vendas Carregadas:</h2>
      <ul>
        {dados.vendas.map((venda, index) => (
          <li key={index}>
            <strong>Venda {index + 1}: </strong>
            Código: {venda.codigo}, Data: {venda.dataVenda}, Valor: R$ {venda.valor.toFixed(2)}, Cliente: {venda.cliente}, Vendedor: {venda.vendedor}, Nota Fiscal: {venda.notaFiscal}, Status: {venda.status}
          </li>
        ))}
      </ul>

      <button onClick={gerarRelatorio} style={{ marginTop: "20px" }}>
        Gerar Relatório em PDF
      </button>
    </div>
  );
}

const handleFileUpload = (e) => {
  e.preventDefault(); // Prevê recarregamento da página
  const file = e.target.files[0];

  if (!file) {
    alert("Selecione um arquivo válido.");
    return;
  }

  const reader = new FileReader();

  reader.onload = (evt) => {
    try {
      const binaryString = evt.target.result;
      const workbook = XLSX.read(binaryString, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      const vendas = data.map((item) => ({
        codigo: item["Código"],
        dataVenda: item["Data"],
        valor: Number(item["Valor"]), // Certifique-se de que é um número
        cliente: item["Cliente"],
        vendedor: item["Vendedor"],
        notaFiscal: item["Nota Fiscal"],
        status: item["Status"],
      }));

      const totalVendas = vendas.reduce((acc, curr) => acc + curr.valor, 0);

      setDados({ vendas, totalVendas });
    } catch (error) {
      console.error("Erro ao processar o arquivo:", error);
      alert("Erro ao processar a planilha. Verifique o formato.");
    }
  };

  reader.readAsBinaryString(file);
};