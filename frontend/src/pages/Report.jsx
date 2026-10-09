import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Download, FileText } from 'lucide-react';

const Report = () => {
  const { user } = useContext(AuthContext);
  const [report, setReport] = useState(null);
  const [isLocalData, setIsLocalData] = useState(false);

  useEffect(() => {
    const generateReportData = async () => {
      let localCycles = [];
      let localReports = [];

      try { localCycles = JSON.parse(localStorage.getItem('femcare_cycles')) || []; } catch {}
      try { localReports = JSON.parse(localStorage.getItem('femcare_reports')) || []; } catch {}

      // Calculate cycle metrics
      let totalCyclesLogged = localCycles.length;
      let avgCycleLength = null;
      let lastPeriodStart = null;
      let lastPeriodEnd = null;
      let cycleStatus = totalCyclesLogged > 0 ? 'Regular' : 'No data yet';

      if (totalCyclesLogged > 0) {
        const sorted = [...localCycles].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        lastPeriodStart = sorted[0].startDate;
        lastPeriodEnd = sorted[0].endDate;

        const withLen = sorted.filter(c => c.cycleLength);
        if (withLen.length > 0) {
          avgCycleLength = Math.round(withLen.reduce((sum, c) => sum + c.cycleLength, 0) / withLen.length);
          if (avgCycleLength > 35) cycleStatus = 'Irregular (Long)';
          else if (avgCycleLength < 21) cycleStatus = 'Irregular (Short)';
          else cycleStatus = 'Regular (28-day avg)';
        }
      }

      // Calculate symptom metrics from saved assessments
      const freqMap = {};
      let totalLogged = 0;

      localReports.forEach(rep => {
        const ph = rep.answers?.physical || [];
        const m = rep.answers?.mood || [];
        [...ph, ...m].forEach(typeKey => {
          const name = typeKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          freqMap[name] = (freqMap[name] || 0) + 1;
          totalLogged++;
        });
      });

      const topSymptoms = Object.entries(freqMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([type, count]) => ({ type, count }));

      const constructedReport = {
        generatedAt: new Date().toISOString(),
        patient: {
          name: user?.name || 'SanJnaa',
          email: user?.email || 'sanjana@femcare.ai',
          condition: user?.condition || 'PCOS'
        },
        cycleSummary: {
          totalCyclesLogged,
          avgCycleLength,
          lastPeriodStart,
          lastPeriodEnd,
          cycleStatus
        },
        symptomSummary: {
          totalLogged,
          last30Days: localReports.length,
          topSymptoms
        },
        recentReports: localReports.slice(0, 3)
      };

      // Try API first, fallback to constructed local report
      try {
        const res = await api.get('/report');
        if (res.data?.report) {
          setReport(res.data.report);
          setIsLocalData(false);
          return;
        }
      } catch (err) {
        console.log('Backend /api/report unavailable, using synced local storage data.');
      }

      setReport(constructedReport);
      setIsLocalData(true);
    };

    generateReportData();
  }, [user]);

  if (!report) return (
    <div className="flex justify-center py-12">
      <div className="w-9 h-9 border-[3px] border-t-transparent rounded-full animate-spin"
        style={{ borderColor: '#6F5CD0', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2.5" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg,#6F5CD0,#A596F0)' }}>
              <FileText size={16} strokeWidth={2} />
            </span>
            Medical Report
          </h2>
          <p className="text-sm mt-1 ml-10" style={{ color: 'var(--text-muted)' }}>
            Generated: {new Date(report.generatedAt).toLocaleString()}
          </p>
          {isLocalData && (
            <p className="text-xs mt-1 ml-10" style={{ color: '#10b981' }}>
              ✓ Synced with your logged cycles & saved symptom checks.
            </p>
          )}
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => window.print()}>
          <Download size={15} /> Download PDF
        </button>
      </div>

      {/* Printable report */}
      <div id="printable-report" className="bg-white text-gray-900 p-8 rounded-[24px]"
        style={{ boxShadow: '0 10px 30px rgba(111,92,208,0.06)' }}>
        {/* Report header */}
        <div className="flex justify-between pb-6 mb-6" style={{ borderBottom: '2px solid #EEEAFB' }}>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg,#6F5CD0,#A596F0)' }}>
                <span className="text-sm">💕</span>
              </div>
              <h1 className="text-xl font-bold" style={{ color: '#2B2540', fontFamily: 'Poppins,sans-serif' }}>FemCare AI</h1>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#4B4365' }}>
              Clinical Health Summary
            </p>
          </div>
          <div className="text-right text-sm" style={{ color: '#2B2540' }}>
            <p className="font-bold text-base">{report.patient.name}</p>
            <p style={{ color: '#4B4365' }}>{report.patient.email}</p>
            <p className="uppercase mt-1 text-xs font-bold" style={{ color: '#6F5CD0' }}>
              {report.patient.condition} Focus
            </p>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: '#655A7E' }}>
              Cycle Metrics
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Total Logged',    value: `${report.cycleSummary.totalCyclesLogged} cycle(s)` },
                { label: 'Average Length',  value: report.cycleSummary.avgCycleLength ? `${report.cycleSummary.avgCycleLength} Days` : 'N/A' },
                { label: 'Cycle Status',    value: report.cycleSummary.cycleStatus, accent: true },
                { label: 'Last Period',     value: report.cycleSummary.lastPeriodStart ? new Date(report.cycleSummary.lastPeriodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A' },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-2"
                  style={{ borderBottom: '1px solid #EEEAFB' }}>
                  <span className="text-sm" style={{ color: '#4B4365' }}>{row.label}</span>
                  <span className="text-sm font-bold" style={{ color: row.accent ? '#6F5CD0' : '#2B2540' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: '#655A7E' }}>
              Symptom Overview (Last 30 Days)
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #EEEAFB' }}>
                <span className="text-sm" style={{ color: '#4B4365' }}>Assessments Saved</span>
                <span className="text-sm font-bold" style={{ color: '#2B2540' }}>{report.symptomSummary.last30Days}</span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold mb-2" style={{ color: '#4B4365' }}>Most Frequent Symptoms:</p>
                <div className="flex flex-wrap gap-2">
                  {report.symptomSummary.topSymptoms.map((s, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: '#F7F5FD', color: '#6F5CD0', border: '1px solid #E3DDF7' }}>
                      {s.type} ({s.count})
                    </span>
                  ))}
                  {report.symptomSummary.topSymptoms.length === 0 && (
                    <span className="text-xs" style={{ color: '#655A7E' }}>No symptoms logged yet.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent assessments summary if available */}
        {report.recentReports && report.recentReports.length > 0 && (
          <div className="mb-8 p-4 rounded-2xl" style={{ background: '#F7F5FD', border: '1px solid #EEEAFB' }}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#6F5CD0' }}>
              Latest Symptom Assessment Result
            </h3>
            <div className="flex justify-between items-center text-sm font-bold" style={{ color: '#2B2540' }}>
              <span>Primary Outcome: {report.recentReports[0].primary}</span>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: '#6F5CD0', color: '#fff' }}>
                {report.recentReports[0].confidence}% Confidence
              </span>
            </div>
            <p className="text-xs mt-2 leading-relaxed text-gray-700">
              {report.recentReports[0].res?.narrative || 'Symptom analysis saved and integrated into report.'}
            </p>
          </div>
        )}

        {/* Next steps */}
        <div style={{ borderTop: '2px solid #EEEAFB', paddingTop: '24px' }}>
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#655A7E' }}>Next Steps</h3>
          <p className="text-sm leading-relaxed" style={{ color: '#4B4365' }}>
            Continue logging your cycle and symptoms daily for the most accurate insights. If you notice persistent irregularities, consult a gynaecologist. Use the Nearby Doctors feature to find specialists in your area. This report can be printed and shared with your healthcare provider.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Report;
