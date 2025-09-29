'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/format';

interface CategoryPieChartProps {
  data: Array<{
    category: string;
    amount: number;
  }>;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border rounded-lg p-3 shadow-md">
          <p className="font-medium">{data.category}</p>
          <p className="text-primary">
            {formatCurrency(data.amount)}
          </p>
          <p className="text-sm text-muted-foreground">
            {((data.amount / data.total) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  const dataWithPercentage = data.map(item => ({
    ...item,
    total: totalAmount,
    percentage: ((item.amount / totalAmount) * 100).toFixed(1)
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ category, percentage }) => `${category} (${percentage}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="amount"
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}