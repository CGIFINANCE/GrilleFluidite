import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

interface VRChartProps {
  selectedEnergy: string;
  referenceMileage: number;
  referenceDuration: number;
  referenceValue: string;
  calculateEuroValue: (duration: number, mileage: number) => number;
  interpolatePercentage: (duration: number, mileage: number, energy: string) => number;
  financedPrice: number;
  interestRate: number;
}

const VRChart: React.FC<VRChartProps> = ({
  selectedEnergy,
  referenceMileage,
  referenceDuration,
  referenceValue,
  calculateEuroValue,
  interpolatePercentage,
  financedPrice,
  interestRate
}) => {
  // Calcul du CRD (Capital Restant Dû) avec amortissement linéaire du capital
  const calculateCRD = (duration: number): number => {
    if (financedPrice <= 0 || referenceDuration <= 0) return 0;
    
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = referenceDuration;
    
    if (monthlyRate === 0) {
      // Cas sans intérêt : amortissement linéaire simple
      return financedPrice * (1 - duration / totalMonths);
    }
    
    // Calcul de la mensualité constante
    const monthlyPayment = financedPrice * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                          (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    // Capital restant dû après 'duration' mois
    if (duration >= totalMonths) return 0;
    
    const remainingCapital = financedPrice * Math.pow(1 + monthlyRate, duration) - 
                           monthlyPayment * (Math.pow(1 + monthlyRate, duration) - 1) / monthlyRate;
    
    return Math.max(0, remainingCapital);
  };

  // Générer les données pour la courbe (de 12 à 72 mois par pas de 3 mois pour plus de fluidité)
  const chartData = [];
  for (let duration = 12; duration <= 72; duration += 3) {
    const euroValue = calculateEuroValue(duration, referenceMileage);
    const percentage = interpolatePercentage(duration, referenceMileage, selectedEnergy);
    const crdValue = calculateCRD(duration);
    
    chartData.push({
      duration,
      value: euroValue,
      crd: crdValue,
      percentage: percentage.toFixed(1),
      isReference: duration === referenceDuration
    });
  }

  const referencePoint = chartData.find(point => point.duration === referenceDuration);
  const refValue = parseFloat(referenceValue) || 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const vrData = payload.find(p => p.dataKey === 'value');
      const crdData = payload.find(p => p.dataKey === 'crd');
      
      return (
        <div className="bg-white p-3 border border-slate-300 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-800">{`Durée: ${label} mois`}</p>
          {vrData && (
            <p className="text-blue-600">{`VR: ${vrData.value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`}</p>
          )}
          {crdData && financedPrice > 0 && (
            <p className="text-red-600">{`CRD: ${crdData.value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`}</p>
          )}
          <p className="text-slate-600">{`Pourcentage: ${data.percentage}%`}</p>
          <p className="text-slate-500 text-sm">{`Kilométrage: ${referenceMileage.toLocaleString()} km`}</p>
          {financedPrice > 0 && crdData && vrData && (
            <p className="text-purple-600 text-sm font-medium">
              {`Écart: ${(vrData.value - crdData.value).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Évolution VR vs CRD selon la durée
        </h3>
        <p className="text-slate-600">
          Kilométrage : {referenceMileage.toLocaleString()} km - Énergie : {selectedEnergy}
          {financedPrice > 0 && (
            <span className="ml-4">
              Prix financé : {financedPrice.toLocaleString('fr-FR')} € - Taux : {interestRate}%
            </span>
          )}
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
              name="VR"
            />
            
            {/* Ligne CRD */}
            {financedPrice > 0 && (
              <Line 
                type="monotone" 
                dataKey="crd" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#ef4444' }}
                strokeDasharray="5 5"
                name="CRD"
              />
            )}
            
            {/* Point de référence */}
            {referencePoint && refValue > 0 && (
              <ReferenceDot 
                x={referenceDuration} 
                y={refValue}
                r={8} 
                fill="#8b5cf6" 
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
        {financedPrice > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-red-500 rounded border-dashed border border-red-500"></div>
            <span className="text-slate-700">Courbe CRD</span>
          </div>
        )}
        {refValue > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full border-2 border-white"></div>
            <span className="text-slate-700">Point de référence ({referenceDuration} mois)</span>
          </div>
        )}
        <div className="text-slate-500">
          Survolez les courbes pour voir les détails et l'écart VR-CRD
        </div>
      </div>
    </div>
  );
};

export default VRChart;