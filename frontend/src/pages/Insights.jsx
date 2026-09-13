import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { LineChart } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const chartOptions = (isDark = false) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: isDark ? '#341422' : '#fff',
      titleColor: isDark ? '#F4A4B0' : '#8B2D40',
      bodyColor:  isDark ? '#E8C4CC' : '#B8A0AA',
      borderColor: 'rgba(201,79,104,0.20)',
      borderWidth: 1,
      cornerRadius: 12,
      padding: 10,
    },
  },
  scales: {
    x: {
      grid:  { color: 'rgba(201,79,104,0.06)', drawBorder: false },
      ticks: { color: '#B8A0AA', font: { size: 11 } },
    },
    y: {
      grid:  { color: 'rgba(201,79,104,0.06)', drawBorder: false },
      ticks: { color: '#B8A0AA', font: { size: 11 } },
    },
  },
});

const Insights = () => {
  const [data, setData]       = useState({ cycles: [], symptoms: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      let cycles = [];
      let symptomsFreq = [];

      // 1. Try local storage first or merge
      try {
        const localCycles = JSON.parse(localStorage.getItem('femcare_cycles')) || [];
        if (localCycles.length > 0) {
          cycles = localCycles;
        }
      } catch (e) {
        console.warn('Failed to parse local cycles:', e);
      }

      try {
        const localReports = JSON.parse(localStorage.getItem('femcare_reports')) || [];
        // Calculate symptom frequency from local reports or symptoms
        const freqMap = {};
        let totalCount = 0;

        localReports.forEach(rep => {
          const ph = rep.answers?.physical || [];
          const m = rep.answers?.mood || [];
          [...ph, ...m].forEach(symp => {
            const formatted = symp.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            freqMap[formatted] = (freqMap[formatted] || 0) + 1;
            totalCount++;
          });
        });

        if (totalCount > 0) {
          symptomsFreq = Object.entries(freqMap)
            .map(([label, count]) => ({ label, value: count }))
            .sort((a, b) => b.value - a.value);
        }
      } catch (e) {
        console.warn('Failed to parse local reports:', e);
      }

      // 2. Try API fallback / fetch if local is empty
      if (cycles.length === 0 || symptomsFreq.length === 0) {
        try {
          const [cycleRes, sympRes] = await Promise.all([
            api.get('/cycle').catch(() => ({ data: {} })),
            api.get('/symptoms').catch(() => ({ data: {} })),
          ]);

          if (cycles.length === 0 && cycleRes.data?.cycles?.length > 0) {
            cycles = cycleRes.data.cycles;
          }
          if (symptomsFreq.length === 0 && sympRes.data?.frequency?.length > 0) {
            symptomsFreq = sympRes.data.frequency;
          }
        } catch (err) {
          console.log('Backend API fetch skipped/failed, using local storage data.');
        }
      }

      setData({ cycles, symptoms: symptomsFreq });
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-9 h-9 border-[3px] border-t-transparent rounded-full animate-spin"
        style={{ borderColor: '#C94F68', borderTopColor: 'transparent' }} />
    </div>
  );

  // Filter cycles with dates for chart
  const sortedCyclesForChart = [...data.cycles]
    .filter(c => c.startDate)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(-7);

  const cycleData = {
    labels: sortedCyclesForChart.map(c => new Date(c.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Cycle / Period Length',
      data: sortedCyclesForChart.map(c => c.cycleLength || 28),
      borderColor: '#C94F68',
      backgroundColor: 'rgba(201,79,104,0.10)',
      borderWidth: 2.5,
      tension: 0.45,
      fill: true,
      pointBackgroundColor: '#C94F68',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
    }],
  };

  const symptomData = {
    labels: data.symptoms.slice(0, 7).map(s => s.label),
    datasets: [{
      data: data.symptoms.slice(0, 7).map(s => s.value),
      backgroundColor: ['#C94F68','#E87A90','#F4A4B0','#B8A0AA','#D4B8C0','#8B2D40','#A03650'],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const hasData = (arr) => arr && arr.length > 0;

  const EmptyChart = ({ label }) => (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="text-4xl opacity-30">📊</div>
      <p className="text-sm text-center" style={{ color: 'var(--text-subtle)' }}>
        No {label} data yet. Keep logging to see your trends!
      </p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg,#C94F68,#E87A90)' }}>
          <LineChart size={16} strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
            Cycle Insights
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your health trends at a glance</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="panel flex flex-col" style={{ height: '320px' }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
            📈 Cycle / Period Length Trend
          </h3>
          <div className="flex-1 min-h-0">
            {hasData(sortedCyclesForChart)
              ? <Line data={cycleData} options={chartOptions()} />
              : <EmptyChart label="cycle" />
            }
          </div>
        </div>

        <div className="panel flex flex-col" style={{ height: '320px' }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
            🌡️ Top Symptoms Frequency
          </h3>
          <div className="flex-1 min-h-0">
            {hasData(data.symptoms)
              ? <Bar data={symptomData} options={chartOptions()} />
              : <EmptyChart label="symptom" />
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
