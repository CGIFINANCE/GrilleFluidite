import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

interface VRChartProps {
  selectedEnergy: string;
  referenceMileage: number;
  referenceDuration: number;
  referenceValue: string;
  calculateEuroValue: (duration: number, mileage: number) => number;
  interpolatePercentage: (duration: number, mileage: number, energy: string) => number;
}

const VRChart: React.FC<VRChartProps> = ({
  selectedEnergy,
  referenceMileage,
  referenceDuration,
  referenceValue,
  calculateEuroValue,
  interpolatePercentage
}) => {
  // Générer les données pour la courbe (de 12 à 72 mois par pas de 3 mois pour plus de fluidité)
  const chartData = [];
  for (let duration = 12; duration <= 72; duration += 3) {
    const euroValue = calculateEuroValue(duration, referenceMileage);
    const percentage = interpolatePercentage(duration, referenceMileage, selectedEnergy);
    
    chartData.push({
      duration,
      value: euroValue,
      percentage: percentage.toFixed(1),
      isReference: duration === referenceDuration
    });
  }

  const referencePoint = chartData.find(point => point.duration === referenceDuration);
  const refValue = parseFloat(referenceValue) || 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-300 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-800">{`Durée: ${label} mois`}</p>
          <p className="text-blue-600">{`VR: ${payload[0].value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`}</p>
          <p className="text-slate-600">{`Pourcentage: ${data.percentage}%`}</p>
          <p className="text-slate-500 text-sm">{`Kilométrage: ${referenceMileage.toLocaleString()} km`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Évolution de la VR selon la durée
        </h3>
        <p className="text-slate-600">
          Kilométrage fixe : {referenceMileage.toLocaleString()} km - Énergie : {selectedEnergy}
        </p>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="duration" 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => `${value}m`}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Ligne principale */}
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#3b82f6' }}
            />
            
            {/* Point de référence */}
            {referencePoint && refValue > 0 && (
              <ReferenceDot 
                x={referenceDuration} 
                y={refValue}
                r={8} 
                fill="#ef4444" 
                stroke="#ffffff"
                strokeWidth={3}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Légende */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-500 rounded"></div>
          <span className="text-slate-700">Courbe VR</span>
        </div>
        {refValue > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
            <span className="text-slate-700">Point de référence ({referenceDuration} mois)</span>
          </div>
        )}
        <div className="text-slate-500">
          Survolez la courbe pour voir les détails
        </div>
      </div>
    </div>
  );
};

export default VRChart;