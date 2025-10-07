'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/lib/format';

interface InOutBarChartProps {
  data: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
}

export function InOutBarChart({ data }: InOutBarChartProps) {
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border rounded-lg p-3 shadow-md">
          <p className="font-medium">{formatMonth(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'income' ? 'Pemasukan' : 'Pengeluaran'}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px] sm:h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            fontSize={11}
            stroke="#64748b"
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value)}
            fontSize={10}
            stroke="#64748b"
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => value === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
          />
          <Bar 
            dataKey="income" 
            fill="#10b981" 
            name="income"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="expense" 
            fill="#ef4444" 
            name="expense"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}