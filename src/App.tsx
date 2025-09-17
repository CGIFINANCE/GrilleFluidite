import React, { useState, useCallback } from 'react';
import { Calculator, Percent, Euro, RotateCcw, Save, Fuel, Zap, Droplets } from 'lucide-react';
import VRChart from './components/VRChart';

interface GridData {
  [key: string]: number; // key format: "duration_mileage"
}

interface EnergyGrids {
  [energy: string]: GridData;
}

const DURATIONS = [12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72];
const MILEAGES = [5000, 10000, 15000, 20000, 25000, 30000];
const ENERGIES = ['essence', 'diesel', 'electrique', 'hybride'];
const PIVOT_DURATION = 48;
const PIVOT_MILEAGE = 15000;

// Valeurs par défaut des grilles par énergie (en pourcentage)
const DEFAULT_GRIDS: EnergyGrids = {
  essence: {
    '12_5000': 130, '12_10000': 125, '12_15000': 120, '12_20000': 115, '12_25000': 110, '12_30000': 105,
    '18_5000': 125, '18_10000': 122, '18_15000': 118, '18_20000': 114, '18_25000': 110, '18_30000': 106,
    '24_5000': 120, '24_10000': 118, '24_15000': 115, '24_20000': 112, '24_25000': 109, '24_30000': 106,
    '30_5000': 115, '30_10000': 113, '30_15000': 110, '30_20000': 107, '30_25000': 104, '30_30000': 101,
    '36_5000': 110, '36_10000': 108, '36_15000': 105, '36_20000': 102, '36_25000': 99, '36_30000': 96,
    '42_5000': 105, '42_10000': 103, '42_15000': 102, '42_20000': 101, '42_25000': 100, '42_30000': 98,
    '48_5000': 102, '48_10000': 101, '48_15000': 100, '48_20000': 98, '48_25000': 96, '48_30000': 94,
    '54_5000': 98, '54_10000': 96, '54_15000': 94, '54_20000': 92, '54_25000': 90, '54_30000': 88,
    '60_5000': 94, '60_10000': 92, '60_15000': 90, '60_20000': 88, '60_25000': 86, '60_30000': 84,
    '66_5000': 90, '66_10000': 88, '66_15000': 86, '66_20000': 84, '66_25000': 82, '66_30000': 80,
    '72_5000': 86, '72_10000': 84, '72_15000': 82, '72_20000': 80, '72_25000': 78, '72_30000': 76,
  },
  diesel: {
    '12_5000': 135, '12_10000': 130, '12_15000': 125, '12_20000': 120, '12_25000': 115, '12_30000': 110,
    '18_5000': 130, '18_10000': 127, '18_15000': 123, '18_20000': 119, '18_25000': 115, '18_30000': 111,
    '24_5000': 125, '24_10000': 123, '24_15000': 120, '24_20000': 117, '24_25000': 114, '24_30000': 111,
    '30_5000': 120, '30_10000': 118, '30_15000': 115, '30_20000': 112, '30_25000': 109, '30_30000': 106,
    '36_5000': 115, '36_10000': 113, '36_15000': 110, '36_20000': 107, '36_25000': 104, '36_30000': 101,
    '42_5000': 110, '42_10000': 108, '42_15000': 107, '42_20000': 106, '42_25000': 105, '42_30000': 103,
    '48_5000': 107, '48_10000': 106, '48_15000': 100, '48_20000': 103, '48_25000': 101, '48_30000': 99,
    '54_5000': 103, '54_10000': 101, '54_15000': 99, '54_20000': 97, '54_25000': 95, '54_30000': 93,
    '60_5000': 99, '60_10000': 97, '60_15000': 95, '60_20000': 93, '60_25000': 91, '60_30000': 89,
    '66_5000': 95, '66_10000': 93, '66_15000': 91, '66_20000': 89, '66_25000': 87, '66_30000': 85,
    '72_5000': 91, '72_10000': 89, '72_15000': 87, '72_20000': 85, '72_25000': 83, '72_30000': 81,
  },
  electrique: {
    '12_5000': 140, '12_10000': 138, '12_15000': 135, '12_20000': 132, '12_25000': 129, '12_30000': 126,
    '18_5000': 135, '18_10000': 133, '18_15000': 130, '18_20000': 127, '18_25000': 124, '18_30000': 121,
    '24_5000': 130, '24_10000': 128, '24_15000': 125, '24_20000': 122, '24_25000': 119, '24_30000': 116,
    '30_5000': 125, '30_10000': 123, '30_15000': 120, '30_20000': 117, '30_25000': 114, '30_30000': 111,
    '36_5000': 120, '36_10000': 118, '36_15000': 115, '36_20000': 112, '36_25000': 109, '36_30000': 106,
    '42_5000': 115, '42_10000': 113, '42_15000': 112, '42_20000': 111, '42_25000': 110, '42_30000': 108,
    '48_5000': 112, '48_10000': 111, '48_15000': 100, '48_20000': 108, '48_25000': 106, '48_30000': 104,
    '54_5000': 108, '54_10000': 106, '54_15000': 104, '54_20000': 102, '54_25000': 100, '54_30000': 98,
    '60_5000': 104, '60_10000': 102, '60_15000': 100, '60_20000': 98, '60_25000': 96, '60_30000': 94,
    '66_5000': 100, '66_10000': 98, '66_15000': 96, '66_20000': 94, '66_25000': 92, '66_30000': 90,
    '72_5000': 96, '72_10000': 94, '72_15000': 92, '72_20000': 90, '72_25000': 88, '72_30000': 86,
  },
  hybride: {
    '12_5000': 132, '12_10000': 127, '12_15000': 122, '12_20000': 117, '12_25000': 112, '12_30000': 107,
    '18_5000': 127, '18_10000': 124, '18_15000': 120, '18_20000': 116, '18_25000': 112, '18_30000': 108,
    '24_5000': 122, '24_10000': 120, '24_15000': 117, '24_20000': 114, '24_25000': 111, '24_30000': 108,
    '30_5000': 117, '30_10000': 115, '30_15000': 112, '30_20000': 109, '30_25000': 106, '30_30000': 103,
    '36_5000': 112, '36_10000': 110, '36_15000': 107, '36_20000': 104, '36_25000': 101, '36_30000': 98,
    '42_5000': 107, '42_10000': 105, '42_15000': 104, '42_20000': 103, '42_25000': 102, '42_30000': 100,
    '48_5000': 104, '48_10000': 103, '48_15000': 100, '48_20000': 100, '48_25000': 98, '48_30000': 96,
    '54_5000': 100, '54_10000': 98, '54_15000': 96, '54_20000': 94, '54_25000': 92, '54_30000': 90,
    '60_5000': 96, '60_10000': 94, '60_15000': 92, '60_20000': 90, '60_25000': 88, '60_30000': 86,
    '66_5000': 92, '66_10000': 90, '66_15000': 88, '66_20000': 86, '66_25000': 84, '66_30000': 82,
    '72_5000': 88, '72_10000': 86, '72_15000': 84, '72_20000': 82, '72_25000': 80, '72_30000': 78,
  }
};

const ENERGY_ICONS = {
  essence: Fuel,
  diesel: Droplets,
  electrique: Zap,
  hybride: Calculator
};

const ENERGY_LABELS = {
  essence: 'Essence',
  diesel: 'Diesel',
  electrique: 'Électrique',
  hybride: 'Hybride'
};

function App() {
  const [energyGrids, setEnergyGrids] = useState<EnergyGrids>(DEFAULT_GRIDS);
  const [selectedEnergy, setSelectedEnergy] = useState<string>('essence');
  const [referenceValue, setReferenceValue] = useState<string>('');
  const [referenceDuration, setReferenceDuration] = useState<number>(36);
  const [referenceMileage, setReferenceMileage] = useState<number>(20000);
  const [displayMode, setDisplayMode] = useState<'percentage' | 'euro'>('euro');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [showChart, setShowChart] = useState<boolean>(false);
  const [financedPrice, setFinancedPrice] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('3.5');

  const getKey = useCallback((duration: number, mileage: number): string => {
    return `${duration}_${mileage}`;
  }, []);

  // Interpolation bilinéaire pour trouver un pourcentage
  const interpolatePercentage = useCallback((duration: number, mileage: number, energy: string): number => {
    const grid = energyGrids[energy];
    
    // Si la valeur existe exactement dans la grille
    const exactKey = getKey(duration, mileage);
    if (grid[exactKey] !== undefined) {
      return grid[exactKey];
    }

    // Trouver les bornes pour la durée
    let durationLower = DURATIONS[0];
    let durationUpper = DURATIONS[DURATIONS.length - 1];
    
    for (let i = 0; i < DURATIONS.length - 1; i++) {
      if (duration >= DURATIONS[i] && duration <= DURATIONS[i + 1]) {
        durationLower = DURATIONS[i];
        durationUpper = DURATIONS[i + 1];
        break;
      }
    }

    // Trouver les bornes pour le kilométrage
    let mileageLower = MILEAGES[0];
    let mileageUpper = MILEAGES[MILEAGES.length - 1];
    
    for (let i = 0; i < MILEAGES.length - 1; i++) {
      if (mileage >= MILEAGES[i] && mileage <= MILEAGES[i + 1]) {
        mileageLower = MILEAGES[i];
        mileageUpper = MILEAGES[i + 1];
        break;
      }
    }

    // Récupérer les 4 points de la grille
    const p1 = grid[getKey(durationLower, mileageLower)] || 100;
    const p2 = grid[getKey(durationUpper, mileageLower)] || 100;
    const p3 = grid[getKey(durationLower, mileageUpper)] || 100;
    const p4 = grid[getKey(durationUpper, mileageUpper)] || 100;

    // Interpolation bilinéaire
    const durationRatio = durationLower === durationUpper ? 0 : (duration - durationLower) / (durationUpper - durationLower);
    const mileageRatio = mileageLower === mileageUpper ? 0 : (mileage - mileageLower) / (mileageUpper - mileageLower);

    const interpolated1 = p1 + (p2 - p1) * durationRatio;
    const interpolated2 = p3 + (p4 - p3) * durationRatio;
    const result = interpolated1 + (interpolated2 - interpolated1) * mileageRatio;

    return result;
  }, [energyGrids, getKey]);

  // Calcule la valeur pivot en euros à partir de la valeur de référence saisie
  const calculatePivotValue = useCallback((): number => {
    const refValue = parseFloat(referenceValue) || 0;
    if (refValue === 0) return 0;
    
    const refPercentage = interpolatePercentage(referenceDuration, referenceMileage, selectedEnergy);
    const pivotPercentage = interpolatePercentage(PIVOT_DURATION, PIVOT_MILEAGE, selectedEnergy);
    
    // La valeur pivot = valeur de référence * (pourcentage pivot / pourcentage référence)
    return refValue * (pivotPercentage / refPercentage);
  }, [referenceValue, referenceDuration, referenceMileage, selectedEnergy, interpolatePercentage]);

  // Calcule la valeur en euros pour une case donnée
  const calculateEuroValue = useCallback((duration: number, mileage: number): number => {
    const pivotValue = calculatePivotValue();
    if (pivotValue === 0) return 0;
    
    const percentage = interpolatePercentage(duration, mileage, selectedEnergy);
    const pivotPercentage = interpolatePercentage(PIVOT_DURATION, PIVOT_MILEAGE, selectedEnergy);
    
    return pivotValue * (percentage / pivotPercentage);
  }, [calculatePivotValue, selectedEnergy, interpolatePercentage]);

  const handleGridChange = useCallback((duration: number, mileage: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEnergyGrids(prev => ({
      ...prev,
      [selectedEnergy]: {
        ...prev[selectedEnergy],
        [getKey(duration, mileage)]: numValue
      }
    }));
  }, [getKey, selectedEnergy]);

  const resetGrid = useCallback(() => {
    setEnergyGrids(DEFAULT_GRIDS);
  }, []);

  const isPivot = useCallback((duration: number, mileage: number): boolean => {
    return duration === PIVOT_DURATION && mileage === PIVOT_MILEAGE;
  }, []);

  const isReference = useCallback((duration: number, mileage: number): boolean => {
    return duration === referenceDuration && mileage === referenceMileage;
  }, [referenceDuration, referenceMileage]);

  const isInGrid = useCallback((duration: number, mileage: number): boolean => {
    return DURATIONS.includes(duration) && MILEAGES.includes(mileage);
  }, []);

  const formatValue = useCallback((duration: number, mileage: number): string => {
    if (displayMode === 'percentage') {
      const percentage = interpolatePercentage(duration, mileage, selectedEnergy);
      const inGrid = isInGrid(duration, mileage);
      return `${percentage.toFixed(1)}%${!inGrid ? ' (interpolé)' : ''}`;
    } else {
      // Si c'est la case de référence et qu'on a saisi une valeur, on affiche cette valeur
      if (isReference(duration, mileage) && referenceValue) {
        const refValue = parseFloat(referenceValue) || 0;
        return `${refValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`;
      }
      
      const euroValue = calculateEuroValue(duration, mileage);
      return `${euroValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`;
    }
  }, [interpolatePercentage, selectedEnergy, displayMode, calculateEuroValue, isReference, referenceValue, isInGrid]);

  const pivotValue = calculatePivotValue();
  const referencePercentage = interpolatePercentage(referenceDuration, referenceMileage, selectedEnergy);
  const isReferenceInterpolated = !isInGrid(referenceDuration, referenceMileage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-500 rounded-xl">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Calculatrice de Grille de Fluidité</h1>
              <p className="text-slate-600 mt-1">Simulation des valeurs résiduelles selon durée, kilométrage et énergie</p>
            </div>
          </div>

          {/* Sélection de l'énergie */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-slate-700 mb-3 block">Type d'énergie</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ENERGIES.map(energy => {
                const IconComponent = ENERGY_ICONS[energy as keyof typeof ENERGY_ICONS];
                return (
                  <button
                    key={energy}
                    onClick={() => setSelectedEnergy(energy)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                      selectedEnergy === energy
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{ENERGY_LABELS[energy as keyof typeof ENERGY_LABELS]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Valeur de référence (€)</label>
              <input
                type="number"
                value={referenceValue}
                onChange={(e) => setReferenceValue(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="22000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Durée de référence (mois)</label>
              <input
                type="number"
                value={referenceDuration}
                onChange={(e) => setReferenceDuration(parseInt(e.target.value) || 36)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="36"
                min="12"
                max="72"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Kilométrage de référence</label>
              <input
                type="number"
                value={referenceMileage}
                onChange={(e) => setReferenceMileage(parseInt(e.target.value) || 20000)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="20000"
                min="5000"
                max="30000"
                step="1000"
              />
            </div>
          </div>

          {/* Configuration financement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Prix financé (€) - optionnel</label>
              <input
                type="number"
                value={financedPrice}
                onChange={(e) => setFinancedPrice(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="25000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Taux d'intérêt annuel (%)</label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="3.5"
                min="0"
                max="20"
              />
            </div>
          </div>

          {/* Informations calculées */}
          {pivotValue > 0 && (
            <div className="space-y-3 mb-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                  <span className="font-semibold text-amber-800">
                    Valeur pivot calculée (48 mois, 15 000 km) : {pivotValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                  </span>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="font-semibold text-blue-800">
                    Pourcentage de référence ({referenceDuration} mois, {referenceMileage.toLocaleString()} km) : {referencePercentage.toFixed(1)}%
                    {isReferenceInterpolated && <span className="text-blue-600 ml-1">(interpolé)</span>}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setDisplayMode(displayMode === 'percentage' ? 'euro' : 'percentage')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              {displayMode === 'percentage' ? <Euro className="w-5 h-5" /> : <Percent className="w-5 h-5" />}
              Afficher en {displayMode === 'percentage' ? '€' : '%'}
            </button>
            
            <button
              onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
            >
              <Save className="w-5 h-5" />
              {editMode ? 'Valider' : 'Modifier la grille'}
            </button>
            
            <button
              onClick={resetGrid}
              className="flex items-center gap-2 px-6 py-3 bg-slate-500 text-white rounded-xl hover:bg-slate-600 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Réinitialiser
            </button>
            
            <button
              onClick={() => setShowChart(!showChart)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
            >
              <Calculator className="w-5 h-5" />
              {showChart ? 'Masquer' : 'Afficher'} le graphique
            </button>
          </div>
        </div>

        {/* Chart */}
        {showChart && (
          <VRChart
            selectedEnergy={selectedEnergy}
            referenceMileage={referenceMileage}
            referenceDuration={referenceDuration}
            referenceValue={referenceValue}
            calculateEuroValue={calculateEuroValue}
            interpolatePercentage={interpolatePercentage}
            financedPrice={parseFloat(financedPrice) || 0}
            interestRate={parseFloat(interestRate) || 0}
          />
        )}

        {/* Grid */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Grille de Fluidité - {ENERGY_LABELS[selectedEnergy as keyof typeof ENERGY_LABELS]}
            </h2>
            <p className="text-slate-600">
              Valeur pivot : {PIVOT_DURATION} mois / {PIVOT_MILEAGE.toLocaleString()} km = 100%
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100">
                  <th className="px-4 py-4 text-left font-semibold text-slate-700 sticky left-0 bg-slate-100 z-10">
                    Durée / Kilométrage
                  </th>
                  {MILEAGES.map(mileage => (
                    <th key={mileage} className="px-4 py-4 text-center font-semibold text-slate-700 min-w-32">
                      {mileage.toLocaleString()} km
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DURATIONS.map((duration, rowIndex) => (
                  <tr key={duration} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-4 font-semibold text-slate-700 sticky left-0 bg-inherit border-r border-slate-200">
                      {duration} mois
                    </td>
                    {MILEAGES.map(mileage => (
                      <td key={mileage} className="px-2 py-2 text-center">
                        {editMode ? (
                          <input
                            type="number"
                            step="0.1"
                            value={energyGrids[selectedEnergy][getKey(duration, mileage)] || 0}
                            onChange={(e) => handleGridChange(duration, mileage, e.target.value)}
                            className={`w-full px-3 py-2 text-center border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                              isPivot(duration, mileage)
                                ? 'border-amber-400 bg-amber-50 focus:ring-amber-500'
                                : isReference(duration, mileage)
                                ? 'border-blue-400 bg-blue-50 focus:ring-blue-500'
                                : 'border-slate-300 focus:ring-blue-500'
                            }`}
                          />
                        ) : (
                          <div className={`px-3 py-2 rounded-lg font-medium transition-all ${
                            isPivot(duration, mileage)
                              ? 'bg-amber-100 text-amber-800 border-2 border-amber-400'
                              : isReference(duration, mileage)
                              ? 'bg-blue-100 text-blue-800 border-2 border-blue-400'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}>
                            {formatValue(duration, mileage)}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Légende</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-amber-100 border-2 border-amber-400 rounded"></div>
              <span className="text-slate-700">Valeur pivot (100% de référence)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded"></div>
              <span className="text-slate-700">Valeur de référence saisie</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-100 border border-green-400 rounded"></div>
              <span className="text-slate-700">Valeurs interpolées</span>
            </div>
            <div className="text-slate-600">
              Saisissez des valeurs hors grille pour l'interpolation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;