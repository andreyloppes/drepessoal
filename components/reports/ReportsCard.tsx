'use client';

import { useState } from 'react';
import { useFinance } from '@/lib/context/FinanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Download, FileText, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function ReportsCard() {
  const { transactions, getFinancialSummary } = useFinance();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState<'all' | 'income' | 'expense'>('all');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'salary': 'Salário',
      'freelance': 'Freelance',
      'investment': 'Investimento',
      'other-income': 'Outros (Receita)',
      'food': 'Alimentação',
      'transport': 'Transporte',
      'housing': 'Moradia',
      'utilities': 'Contas',
      'entertainment': 'Entretenimento',
      'health': 'Saúde',
      'education': 'Educação',
      'shopping': 'Compras',
      'other-expense': 'Outros (Despesa)',
    };
    return labels[category] || category;
  };

  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    if (reportType !== 'all') {
      filtered = filtered.filter((t) => t.type === reportType);
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((t) => new Date(t.date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((t) => new Date(t.date) <= end);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const exportToCSV = () => {
    const filtered = getFilteredTransactions();

    if (filtered.length === 0) {
      alert('Nenhuma transação para exportar');
      return;
    }

    // CSV headers
    const headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor', 'Cartão de Crédito', 'Recorrente'];

    // CSV rows
    const rows = filtered.map((t) => [
      format(new Date(t.date), 'dd/MM/yyyy', { locale: ptBR }),
      t.description,
      t.type === 'income' ? 'Receita' : 'Despesa',
      getCategoryLabel(t.category),
      formatCurrency(t.amount),
      t.isCreditCard ? 'Sim' : 'Não',
      t.recurring ? 'Sim' : 'Não',
    ]);

    // Add summary
    const totalIncome = filtered.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    rows.push([]);
    rows.push(['RESUMO', '', '', '', '', '', '']);
    rows.push(['Total de Receitas', '', '', '', formatCurrency(totalIncome), '', '']);
    rows.push(['Total de Despesas', '', '', '', formatCurrency(totalExpense), '', '']);
    rows.push(['Saldo', '', '', '', formatCurrency(balance), '', '']);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const filtered = getFilteredTransactions();

    if (filtered.length === 0) {
      alert('Nenhuma transação para exportar');
      return;
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('DRE Pessoal - Relatório Financeiro', 14, 22);

    // Period
    doc.setFontSize(11);
    const periodText = startDate && endDate
      ? `Período: ${format(new Date(startDate), 'dd/MM/yyyy')} a ${format(new Date(endDate), 'dd/MM/yyyy')}`
      : 'Período: Todas as transações';
    doc.text(periodText, 14, 30);

    // Transactions table
    const tableData = filtered.map((t) => [
      format(new Date(t.date), 'dd/MM/yy'),
      t.description.substring(0, 30),
      t.type === 'income' ? 'R' : 'D',
      getCategoryLabel(t.category).substring(0, 15),
      formatCurrency(t.amount),
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] },
    });

    // Summary
    const totalIncome = filtered.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    const finalY = (doc as any).lastAutoTable.finalY || 35;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo:', 14, finalY + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total de Receitas: ${formatCurrency(totalIncome)}`, 14, finalY + 18);
    doc.text(`Total de Despesas: ${formatCurrency(totalExpense)}`, 14, finalY + 24);
    doc.setFont('helvetica', 'bold');
    doc.text(`Saldo: ${formatCurrency(balance)}`, 14, finalY + 30);

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
      14,
      doc.internal.pageSize.height - 10
    );

    // Save PDF
    doc.save(`relatorio-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const filtered = getFilteredTransactions();
  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exportação de Relatórios</CardTitle>
        <CardDescription>
          Exporte suas transações em CSV ou PDF com filtros personalizados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-lg">
          <Select
            label="Tipo de Transação"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'all' | 'income' | 'expense')}
            options={[
              { value: 'all', label: 'Todas' },
              { value: 'income', label: 'Apenas Receitas' },
              { value: 'expense', label: 'Apenas Despesas' },
            ]}
          />

          <Input
            label="Data Inicial"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            label="Data Final"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Transações</p>
            <p className="text-2xl font-bold text-foreground">{filtered.length}</p>
          </div>

          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Receitas</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalIncome)}</p>
          </div>

          <div className="p-4 bg-danger/10 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Despesas</p>
            <p className="text-2xl font-bold text-danger">{formatCurrency(totalExpense)}</p>
          </div>

          <div className={`p-4 rounded-lg ${balance >= 0 ? 'bg-primary/10' : 'bg-danger/10'}`}>
            <p className="text-sm text-muted-foreground mb-1">Saldo</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-primary' : 'text-danger'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={exportToCSV}
            className="flex items-center gap-2"
            disabled={filtered.length === 0}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar CSV
          </Button>

          <Button
            onClick={exportToPDF}
            variant="secondary"
            className="flex items-center gap-2"
            disabled={filtered.length === 0}
          >
            <FileText className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma transação encontrada com os filtros selecionados</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
