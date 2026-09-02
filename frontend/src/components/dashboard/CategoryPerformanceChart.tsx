'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { CategoryPerformance } from '@/types/dashboard';
import { monthLabels } from '@/data/mockDashboard';

interface CategoryPerformanceChartProps {
  categories: CategoryPerformance[];
}

export default function CategoryPerformanceChart({ categories }: CategoryPerformanceChartProps) {
  const [timeRange, setTimeRange] = useState('12');

  // Transformar dados para o formato do Recharts
  const chartData = monthLabels.map((month, index) => {
    const dataPoint: any = { month };
    categories.forEach((category) => {
      dataPoint[category.name] = category.data[index];
    });
    return dataPoint;
  });

  return (
    <div className="bg-white rounded-card border border-border p-5 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Desempenho de categorias na região
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Evolução do potencial ao longo do tempo
            </p>
          </div>
        </div>

        {/* Seletor de período */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-white text-text-primary
                   focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                   cursor-pointer"
        >
          <option value="6">Últimos 6 meses</option>
          <option value="12">Últimos 12 meses</option>
          <option value="24">Últimos 24 meses</option>
        </select>
      </div>

      {/* Gráfico */}
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickLine={{ stroke: '#E2E8F0' }}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickLine={{ stroke: '#E2E8F0' }}
              axisLine={{ stroke: '#E2E8F0' }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '8px 12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{
                color: '#0F172A',
                fontWeight: 600,
                marginBottom: '4px',
              }}
              itemStyle={{
                color: '#64748B',
                fontSize: '12px',
                padding: '2px 0',
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-sm text-text-secondary">{value}</span>
              )}
            />
            {categories.map((category) => (
              <Line
                key={category.name}
                type="monotone"
                dataKey={category.name}
                stroke={category.color}
                strokeWidth={2}
                dot={{ fill: category.color, r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda adicional com descrições */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {categories.map((category) => {
            const currentValue = category.data[category.data.length - 1];
            const previousValue = category.data[category.data.length - 2];
            const change = currentValue - previousValue;
            const isPositive = change >= 0;

            return (
              <div key={category.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">
                    {category.name}
                  </p>
                  <p className={`text-xs ${isPositive ? 'text-success-600' : 'text-danger-600'}`}>
                    {isPositive ? '+' : ''}{change.toFixed(0)}% este mês
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
