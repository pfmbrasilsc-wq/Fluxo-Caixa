import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, CATEGORY_COLORS, COLOR_PALETTE } from '../utils/formatters';
import { PieChart as PieChartIcon } from 'lucide-react';

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface CategoryChartProps {
  data: CategoryData[];
  selectedMonth: string;
  selectedYear: number;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ data, selectedMonth, selectedYear }) => {
  const chartData = data.filter((item) => item.amount > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg text-xs space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: item.color }}
            />
            {item.category}
          </div>
          <div className="text-slate-700 font-semibold">{formatCurrency(item.amount)}</div>
          <div className="text-indigo-600 font-bold">{item.percentage.toFixed(1)}% do total</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Distribuição por Categoria</h3>
            <p className="text-xs text-slate-500 font-medium">Gastos e Investimentos em {selectedMonth}/{selectedYear}</p>
          </div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 space-y-2">
          <PieChartIcon className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
          <p>Nenhuma despesa registrada para {selectedMonth}/{selectedYear}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Donut Chart */}
          <div className="lg:col-span-5 h-52 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="amount"
                  nameKey="category"
                >
                  {chartData.map((entry, index) => {
                    const color =
                      entry.color ||
                      CATEGORY_COLORS[entry.category] ||
                      COLOR_PALETTE[index % COLOR_PALETTE.length];
                    return <Cell key={`cell-${index}`} fill={color} stroke="#ffffff" strokeWidth={2} />;
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Categories Legend List */}
          <div className="lg:col-span-7 space-y-2 max-h-56 overflow-y-auto pr-1">
            {chartData.map((item, idx) => {
              const color =
                item.color ||
                CATEGORY_COLORS[item.category] ||
                COLOR_PALETTE[idx % COLOR_PALETTE.length];

              return (
                <div
                  key={item.category}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors text-xs"
                >
                  <div className="flex items-center space-x-2.5 truncate mr-2">
                    <span
                      className="w-3 h-3 rounded-md shrink-0 shadow-2xs"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-slate-800 font-semibold truncate">{item.category}</span>
                  </div>

                  <div className="flex items-center space-x-3 text-right shrink-0">
                    <span className="text-slate-600 font-medium text-xs">{formatCurrency(item.amount)}</span>
                    <span className="text-indigo-600 font-bold w-12 text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
