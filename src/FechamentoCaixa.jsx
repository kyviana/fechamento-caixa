import { useState } from "react";

export default function FechamentoCaixa() {
  const [dados, setDados] = useState({
    data: "",
    responsavel: "",
    saldoInicial: "",
    entradas: {
      dinheiro: "",
      credito: "",
      debito: "",
      pix: "",
      transferencia: "",
      outros: ""
    },
    saidas: {
      dinheiro: "",
      outros: "",
      sangrias: ""
    },
    conferencia: "",
    observacoes: ""
  });

  const calcularTotais = () => {
    const e = dados.entradas;
    const s = dados.saidas;
    const totalEntradas =
      (+e.dinheiro || 0) +
      (+e.credito || 0) +
      (+e.debito || 0) +
      (+e.pix || 0) +
      (+e.transferencia || 0) +
      (+e.outros || 0);
    const totalSaidas = (+s.dinheiro || 0) + (+s.outros || 0) + (+s.sangrias || 0);
    const totalDinheiro = (+dados.saldoInicial || 0) + (+e.dinheiro || 0) - (+s.dinheiro || 0) - (+s.sangrias || 0);
    const diferenca = totalDinheiro - (+dados.conferencia || 0);

    return { totalEntradas, totalSaidas, totalDinheiro, diferenca };
  };

  const totais = calcularTotais();

  const handleChange = (e, section, field) => {
    const value = e.target.value;
    if (section) {
      setDados({
        ...dados,
        [section]: { ...dados[section], [field]: value }
      });
    } else {
      setDados({ ...dados, [field]: value });
    }
  };

  return (
    <div className="card">
      <h1>Fechamento de Caixa</h1>
      <input placeholder="Data" value={dados.data} onChange={(e) => handleChange(e, null, "data")} />
      <input placeholder="Responsável" value={dados.responsavel} onChange={(e) => handleChange(e, null, "responsavel")} />
      <input placeholder="Saldo Inicial (Dinheiro)" value={dados.saldoInicial} onChange={(e) => handleChange(e, null, "saldoInicial")} />

      <h2>Entradas</h2>
      {Object.keys(dados.entradas).map((key) => (
        <input key={key} placeholder={`Entrada - ${key}`} value={dados.entradas[key]} onChange={(e) => handleChange(e, "entradas", key)} />
      ))}

      <h2>Saídas</h2>
      {Object.keys(dados.saidas).map((key) => (
        <input key={key} placeholder={`Saída - ${key}`} value={dados.saidas[key]} onChange={(e) => handleChange(e, "saidas", key)} />
      ))}

      <input placeholder="Conferência com Sistema (Dinheiro contado)" value={dados.conferencia} onChange={(e) => handleChange(e, null, "conferencia")} />
      <input placeholder="Observações" value={dados.observacoes} onChange={(e) => handleChange(e, null, "observacoes")} />

      <div style={{ marginTop: "2rem", background: "#f0f0f0", padding: "1rem", borderRadius: "8px" }}>
        <p><strong>Total de Entradas:</strong> R$ {totais.totalEntradas.toFixed(2)}</p>
        <p><strong>Total de Saídas:</strong> R$ {totais.totalSaidas.toFixed(2)}</p>
        <p><strong>Total em Dinheiro:</strong> R$ {totais.totalDinheiro.toFixed(2)}</p>
        <p><strong>Diferença:</strong> R$ {totais.diferenca.toFixed(2)}</p>
      </div>
    </div>
  );
}
