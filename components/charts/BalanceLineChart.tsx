'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/format';

interface BalanceLineChartProps {
  data: Array<{
    month: string;
    balance: number;
  }>;
}

export function BalanceLineChart({ data }: BalanceLineChartProps) {
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
      const value = payload[0].value;
      return (
        <div className="bg-white border rounded-lg p-3 shadow-md">
          <p className="font-medium">{formatMonth(label)}</p>
          <p className={`font-semibold ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Saldo: {formatCurrency(value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="month" 
            tickFormatter={formatMonth}
            fontSize={12}
            stroke="#64748b"
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)}
            fontSize={12}
            stroke="#64748b"
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="balance" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}