import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export const DashboardPage = () => {
  const stats = [
    { title: 'Consumo de Hoy', value: '18.2', unit: 'kWh', change: '-12%', trend: 'down' },
    { title: 'Consumo Mensual', value: '342', unit: 'kWh', change: '-8%', trend: 'down' },
    { title: 'Dispositivos Activos', value: '12', unit: 'dispositivos', change: '+2', trend: 'up' },
    { title: 'Costo Estimado', value: 'COP51.30', unit: 'este mes', change: '- COP4.20', trend: 'down' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="rounded-2xl border border-gray-100/80 dark:border-gray-800/60 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{stat.title}</p>
                <Badge variant={stat.trend === 'down' ? 'success' : 'info'} className="rounded-lg font-bold px-2 py-0.5 text-xs">
                  {stat.trend === 'down' ? '↓' : '↑'} {stat.change}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-[#1a1a1a] dark:text-white mb-1 tracking-tight">{stat.value}</p>
              <p className="text-xs font-medium text-[#666666] dark:text-[#a3a3a3]">{stat.unit}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
