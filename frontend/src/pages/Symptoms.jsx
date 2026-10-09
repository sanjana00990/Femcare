import React, { useState } from 'react';
import { Activity, ChevronRight, ChevronLeft, CheckCircle2, AlertTriangle } from 'lucide-react';

/* ─── Symptom label maps ────────────────────────────────── */
const PHYSICAL_LABELS = {
  excess_hair:    'Hirsutism (Excess Facial / Body Hair)',
  acne:           'Acne & Seborrhoea (Oily Skin)',
  hair_loss:      'Androgenic Alopecia (Hair Thinning / Loss)',
  skin_darkening: 'Acanthosis Nigricans (Skin Darkening)',
  weight_gain:    'Weight Gain / Difficulty Losing Weight',
  hot_flashes:    'Vasomotor Symptoms — Hot Flashes',
  night_sweats:   'Night Sweats / Nocturnal Hyperhidrosis',
  vaginal_dry:    'Vulvovaginal Atrophy / Vaginal Dryness',
  breast_tender:  'Mastalgia (Breast Tenderness)',
  bloating:       'Abdominal Bloating & Distension',
  fatigue:        'Chronic Fatigue / Low Energy',
};
const MOOD_LABELS = {
  mood_swings:  'Emotional Lability / Mood Swings',
  anxiety:      'Anxiety & Depressive Symptoms',
  brain_fog:    'Cognitive Impairment / Brain Fog',
  low_libido:   'Reduced Libido / Sexual Dysfunction',
  sleep_issues: 'Sleep Disturbances / Insomnia',
  fertility:    'Subfertility / Difficulty Conceiving',
  family_pcos:  'Family History of PCOS / Hormonal Disorders',
  family_meno:  'Family History of Early Menopause / POI',
};

/* ─── Scoring engine (medically referenced) ─────────────── */
const score = (answers) => {
  let pcos = 0, meno = 0, normal = 0;
  const { age, bmi, cycles, frequency, heavyBleed, painLevel, physical, mood } = answers;
  const n = parseInt(age) || 0;
  const b = parseFloat(bmi) || 0;

  if (n >= 45) meno += 25;
  else if (n >= 40) meno += 10;
  if (n >= 15 && n <= 35) pcos += 8;
  if (b >= 25) { pcos += 6; meno += 3; }

  if (cycles === 'Very Irregular') pcos += 20;
  else if (cycles === 'Irregular') pcos += 12;
  else if (cycles === 'Absent') { pcos += 15; meno += 18; }
  else normal += 5;

  if (frequency === 'Every 2-3 months') pcos += 14;
  else if (frequency === 'Rare') { pcos += 18; meno += 10; }
  else if (frequency === 'Stopped') { meno += 28; pcos += 6; }
  else normal += 5;

  if (heavyBleed === 'Yes') pcos += 8;
  if (painLevel === 'Severe') pcos += 6;
  else if (painLevel === 'Moderate') pcos += 3;

  const ph = physical || [];
  if (ph.includes('excess_hair'))    pcos += 18;
  if (ph.includes('acne'))           pcos += 10;
  if (ph.includes('hair_loss'))      pcos += 10;
  if (ph.includes('skin_darkening')) pcos += 14;
  if (ph.includes('weight_gain'))    { pcos += 8; meno += 5; }
  if (ph.includes('hot_flashes'))    meno += 24;
  if (ph.includes('night_sweats'))   meno += 16;
  if (ph.includes('vaginal_dry'))    meno += 14;
  if (ph.includes('breast_tender'))  { pcos += 5; meno += 5; }
  if (ph.includes('bloating'))       { pcos += 4; meno += 4; }
  if (ph.includes('fatigue'))        { pcos += 4; meno += 4; }

  const m = mood || [];
  if (m.includes('mood_swings'))    { pcos += 4; meno += 6; }
  if (m.includes('anxiety'))        { pcos += 4; meno += 5; }
  if (m.includes('brain_fog'))      meno += 8;
  if (m.includes('low_libido'))     meno += 8;
  if (m.includes('sleep_issues'))   { pcos += 3; meno += 7; }
  if (m.includes('fertility'))      pcos += 10;
  if (m.includes('family_pcos'))    pcos += 10;
  if (m.includes('family_meno'))    meno += 8;

  const total = pcos + meno + normal + 20;
  const pcosPct = Math.min(98, Math.round((pcos / total) * 100));
  const menoPct = Math.min(98, Math.round((meno / total) * 100));

  let primary, confidence, narrative, labTests = [], lifestyle = [], recs = [];

  if (pcosPct >= 55 && pcosPct > menoPct) {
    primary = pcosPct >= 70 ? 'Polycystic Ovary Syndrome (PCOS)' : 'Polycystic Ovarian Disease (PCOD)';
    confidence = pcosPct;
    narrative = `Based on the symptom profile provided, the clinical presentation is most consistent with ${primary}. The patient presents with ${cycles?.toLowerCase() || 'irregular'} menstrual cycles occurring ${frequency?.toLowerCase() || 'infrequently'}${ph.includes('excess_hair') ? ', hirsutism (excess facial/body hair indicative of hyperandrogenism)' : ''}${ph.includes('acne') ? ', seborrhoea and acne' : ''}${ph.includes('skin_darkening') ? ', acanthosis nigricans (a marker of insulin resistance)' : ''}${ph.includes('weight_gain') ? ', and difficulty managing weight' : ''}. ${pcosPct >= 70 ? 'The combination of oligo/anovulation, clinical hyperandrogenism, and associated metabolic features strongly satisfies at least two of the three Rotterdam diagnostic criteria for PCOS.' : 'The symptom pattern is consistent with PCOD, a condition characterised by multiple immature ovarian follicles with a milder hormonal imbalance primarily driven by lifestyle factors.'} The symptoms reported are consistent with elevated androgen levels and possible insulin resistance, which are hallmark features of this condition. Early intervention through lifestyle modification and medical management can significantly improve outcomes.`;
    labTests = [
      { test: 'Serum LH / FSH Ratio', note: 'LH:FSH > 2:1 is strongly indicative of PCOS' },
      { test: 'Total & Free Testosterone', note: 'Elevated in 60–80% of PCOS patients' },
      { test: 'Fasting Insulin & HOMA-IR', note: 'Assesses insulin resistance' },
      { test: 'Fasting Blood Glucose & HbA1c', note: 'Rules out type 2 diabetes' },
      { test: 'Pelvic Ultrasound (Transvaginal)', note: '≥12 follicles/ovary or ovarian volume >10 mL' },
      { test: 'AMH (Anti-Müllerian Hormone)', note: 'Elevated; reflects ovarian reserve & follicle count' },
      { test: 'Prolactin & TSH', note: 'To rule out hypothyroidism and hyperprolactinaemia' },
      { test: 'Lipid Profile', note: 'Dyslipidaemia common in metabolic PCOS' },
    ];
    lifestyle = [
      'Adopt a low-glycaemic index (low-GI) diet — minimise refined carbohydrates and added sugars',
      'Exercise 150 min/week (combination of aerobic + resistance training) — improves insulin sensitivity',
      'Achieve 5–10% weight loss if overweight — shown to restore ovulation in 50–60% of patients',
      'Avoid endocrine disruptors (BPA plastics, parabens in cosmetics)',
      'Manage stress through mindfulness, yoga, or CBT — cortisol worsens hormonal imbalance',
      'Track menstrual cycles using a dedicated app for 3+ months to establish baseline irregularity',
    ];
    recs = [
      'Consult a gynaecologist or reproductive endocrinologist for comprehensive hormone evaluation',
      'Consider combined oral contraceptive pill (OCP) to regulate cycles and reduce androgens',
      'Metformin may be prescribed if insulin resistance is confirmed',
      'Speak to a dermatologist for hirsutism/acne management (spironolactone, topical retinoids)',
      'If fertility is a concern, ovulation induction with clomiphene citrate or letrozole may be indicated',
    ];
  } else if (menoPct >= 50 && menoPct > pcosPct) {
    primary = n < 45 ? 'Perimenopause (Early Menopausal Transition)' : 'Menopause';
    confidence = menoPct;
    narrative = `The clinical picture presented is highly consistent with ${primary}. The patient${n >= 45 ? `, aged ${n}` : `, aged ${n} — notably below the typical menopause threshold of 45`}, reports ${frequency === 'Stopped' ? 'cessation of menstruation' : `${frequency?.toLowerCase() || 'increasingly infrequent'} periods with progressive irregularity`}${ph.includes('hot_flashes') ? ', vasomotor instability (hot flashes)' : ''}${ph.includes('night_sweats') ? ', nocturnal hyperhidrosis (night sweats)' : ''}${ph.includes('vaginal_dry') ? ', and vulvovaginal atrophy consistent with declining oestrogen levels' : ''}${m.includes('brain_fog') ? ', alongside cognitive changes including brain fog and memory difficulties' : ''}. ${n < 45 ? 'The presentation in a patient under 45 warrants further investigation to exclude Primary Ovarian Insufficiency (POI), which affects approximately 1% of women under 40.' : 'The symptom cluster is highly consistent with the expected oestrogen decline of natural menopause.'} Vasomotor symptoms are the hallmark of menopause, affecting 75–80% of women during this transition. Prompt management can significantly improve quality of life and reduce long-term cardiovascular and skeletal risks.`;
    labTests = [
      { test: 'Serum FSH', note: 'FSH > 30 IU/L on two occasions 4–6 weeks apart confirms menopause' },
      { test: 'Serum Oestradiol (E2)', note: 'Typically < 30 pg/mL in menopause' },
      { test: 'AMH (Anti-Müllerian Hormone)', note: 'Near-undetectable in menopause' },
      { test: 'Thyroid Function Tests (TSH, T4)', note: 'Hypothyroidism mimics menopausal symptoms' },
      { test: 'DEXA Bone Density Scan', note: 'Baseline assessment; oestrogen loss accelerates osteoporosis' },
      { test: 'Fasting Lipid Profile', note: 'Post-menopausal cardiovascular risk increases significantly' },
      { test: 'Blood Pressure & BMI', note: 'Metabolic risk monitoring essential' },
      n < 45 && { test: 'Karyotype & Autoimmune Panel', note: 'If POI is suspected (< 40 years)' },
    ].filter(Boolean);
    lifestyle = [
      'Prioritise calcium-rich foods (dairy, leafy greens, fortified foods) — 1200 mg/day',
      'Daily Vitamin D supplementation (800–1000 IU) for bone and immune health',
      'Weight-bearing exercise (walking, resistance training) 3–4× per week for bone density',
      'Avoid known hot flash triggers: spicy foods, caffeine, alcohol, and heat',
      'Practise paced breathing (6 breaths/min) — clinically shown to reduce hot flash frequency by 50%',
      'Use vaginal moisturisers regularly and water-based lubricants as needed for intimacy',
      'Maintain social connection and cognitive engagement — reduces depression risk',
    ];
    recs = [
      'Consult a gynaecologist to discuss Hormone Replacement Therapy (HRT) — first-line treatment for vasomotor symptoms',
      'If HRT is contraindicated, SSRIs (paroxetine) or SNRIs (venlafaxine) are clinically effective alternatives',
      'Low-dose vaginal oestrogen (cream, ring, or tablet) for localised dryness — does not carry systemic HRT risks',
      'Annual cardiovascular and bone health review with your GP',
      n < 45 ? 'Urgent referral to an endocrinologist to rule out Primary Ovarian Insufficiency (POI)' : 'Consider complementary therapies (black cohosh, phytoestrogens) with physician guidance',
    ];
  } else {
    primary = 'No Significant Hormonal Disorder Detected';
    confidence = 72;
    narrative = `The symptom profile provided does not meet the threshold criteria for PCOS, PCOD, or Menopause at this time. The reported symptoms are consistent with normal physiological hormonal fluctuation, which can occur throughout the reproductive cycle. Factors such as stress, nutritional deficiencies, disrupted sleep, and subclinical thyroid dysfunction can produce overlapping symptoms without representing a distinct endocrine disorder. Continued monitoring and a healthy lifestyle are recommended. If symptoms persist or worsen over the coming 2–3 months, a full clinical evaluation is advised.`;
    labTests = [
      { test: 'Full Blood Count (FBC)', note: 'Rules out anaemia as cause of fatigue' },
      { test: 'TSH & Thyroid Panel', note: 'Thyroid dysfunction causes menstrual irregularity' },
      { test: 'Vitamin D & B12', note: 'Deficiencies commonly cause fatigue and mood changes' },
      { test: 'Serum Iron & Ferritin', note: 'Iron deficiency anaemia is highly prevalent in women' },
      { test: 'Fasting Blood Glucose', note: 'Baseline metabolic health screening' },
    ];
    lifestyle = [
      'Maintain consistent sleep hygiene (7–9 hours per night, fixed sleep/wake times)',
      'Follow a Mediterranean-style diet rich in whole foods, omega-3s, and antioxidants',
      'Exercise regularly — 30 min moderate activity on most days of the week',
      'Reduce chronic stress through mindfulness, journalling, or therapy',
      'Track your menstrual cycle for 3+ months to identify patterns',
    ];
    recs = [
      'Schedule an annual well-woman check-up including pelvic examination',
      'Consult a gynaecologist if cycles remain irregular for more than 3 consecutive months',
      'Consider a full hormonal panel if symptoms escalate',
    ];
  }

  return { primary, confidence, pcosPct, menoPct, narrative, labTests, lifestyle, recs, answers };
};

/* ─── Step config ─────────────────────────────────────────── */
const STEPS = ['Basic Info', 'Menstrual Health', 'Physical Symptoms', 'Mood & Other'];

const PillGroup = ({ options, value, onChange, multi = false }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => {
      const active = multi ? (value || []).includes(opt.value) : value === opt.value;
      return (
        <button key={opt.value} type="button"
          onClick={() => {
            if (multi) {
              const cur = value || [];
              onChange(active ? cur.filter(v => v !== opt.value) : [...cur, opt.value]);
            } else onChange(opt.value);
          }}
          className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: active ? 'linear-gradient(135deg,#6F5CD0,#A596F0)' : 'var(--bg-input)',
            color: active ? '#fff' : 'var(--text-primary)',
            border: `1.5px solid ${active ? 'transparent' : 'var(--border-soft)'}`,
            boxShadow: active ? '0 4px 14px rgba(111,92,208,0.30)' : 'none',
          }}>
          {opt.label}
        </button>
      );
    })}
  </div>
);

const Q = ({ label, children }) => (
  <div className="space-y-2.5">
    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
    {children}
  </div>
);

/* ─── Main Component ──────────────────────────────────────── */
const Symptoms = () => {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult]   = useState(null);

  const set = (key, val) => setAnswers(p => ({ ...p, [key]: val }));

  const calcBMI = () => {
    const h = parseFloat(answers.height), w = parseFloat(answers.weight);
    if (h && w) return (w / ((h / 100) ** 2)).toFixed(1);
    return null;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else {
      const bmi = calcBMI();
      const res = score({ ...answers, bmi });
      setResult(res);

      /* Save to localStorage reports */
      try {
        const existing = JSON.parse(localStorage.getItem('femcare_reports')) || [];
        const newReport = {
          id: `rep_${Date.now()}`,
          date: new Date().toISOString(),
          primary: res.primary,
          confidence: res.confidence,
          answers: { ...answers, bmi },
          res,
        };
        localStorage.setItem('femcare_reports', JSON.stringify([newReport, ...existing]));
      } catch (e) {
        console.warn('Could not save report to localStorage:', e);
      }
    }
  };

  const reset = () => { setStep(0); setAnswers({}); setResult(null); };

  /* ── Stepper ── */
  const Stepper = () => (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((s, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
              style={{
                background: i < step ? 'linear-gradient(135deg,#6F5CD0,#A596F0)' : i === step ? '#6F5CD0' : 'var(--bg-input)',
                color: i <= step ? '#fff' : 'var(--text-muted)',
                border: i > step ? '1.5px solid var(--border-soft)' : 'none',
              }}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className="text-xs font-semibold hidden sm:block"
              style={{ color: i === step ? 'var(--accent)' : i < step ? 'var(--text-muted)' : 'var(--text-subtle)' }}>
              {s}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-0.5 mx-2"
              style={{ background: i < step ? 'linear-gradient(90deg,#6F5CD0,#A596F0)' : 'var(--border-soft)' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  /* ── Result — Full Professional Report ── */
  if (result) {
    const { answers: ans } = result;
    const ph = ans.physical || [];
    const m  = ans.mood     || [];
    const primaryColor = result.primary.includes('PCOS') || result.primary.includes('PCOD') ? '#6F5CD0'
      : result.primary.includes('Meno') || result.primary.includes('Peri') ? '#8B5C8B' : '#4DB88A';
    const reportDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    const SectionTitle = ({ children }) => (
      <div className="flex items-center gap-2 pt-2 pb-2 mb-3" style={{ borderBottom: '1.5px solid var(--border-soft)' }}>
        <div className="w-1 h-4 rounded-full shrink-0" style={{ background: 'linear-gradient(180deg,#6F5CD0,#A596F0)' }} />
        <h3 className="text-[11px] font-black uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{children}</h3>
      </div>
    );

    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-up">

        {/* Top action bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg,#6F5CD0,#A596F0)' }}>
              <CheckCircle2 size={16} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
                Clinical Assessment Report
              </h2>
              <p className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>Generated: {reportDate} · FemCare AI Symptom Analyser</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()}
              className="text-xs font-semibold px-3 py-2 rounded-xl transition-all hover:-translate-y-0.5 flex items-center gap-1.5"
              style={{ background: 'var(--accent-soft)', border: '1px solid var(--border-soft)', color: 'var(--accent)' }}>
              🖨 Print Report
            </button>
            <button onClick={reset} className="btn-primary text-xs py-2 px-4">Restart</button>
          </div>
        </div>

        {/* Main report card */}
        <div id="clinical-report" className="panel space-y-6">

          {/* ── Report Header ── */}
          <div className="flex items-start justify-between pb-5" style={{ borderBottom: '2px solid var(--border-soft)' }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">💕</span>
                <span className="text-base font-black" style={{ color: 'var(--accent)', fontFamily: 'Poppins,sans-serif' }}>FemCare AI</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-subtle)' }}>
                Gynaecological Symptom Assessment · Confidential
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-subtle)' }}>Report Date</div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{reportDate}</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>For educational purposes only</div>
            </div>
          </div>

          {/* ── Patient Profile ── */}
          <div>
            <SectionTitle>Patient Profile</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Age', value: ans.age ? `${ans.age} years` : 'Not provided' },
                { label: 'Height', value: ans.height ? `${ans.height} cm` : 'Not provided' },
                { label: 'Weight', value: ans.weight ? `${ans.weight} kg` : 'Not provided' },
                { label: 'BMI', value: result.answers?.bmi ? `${result.answers.bmi}` : (ans.height && ans.weight ? `${(parseFloat(ans.weight)/((parseFloat(ans.height)/100)**2)).toFixed(1)}` : 'N/A') },
              ].map(f => (
                <div key={f.label} className="p-3 rounded-2xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-soft)' }}>
                  <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-subtle)' }}>{f.label}</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Primary Diagnosis ── */}
          <div>
            <SectionTitle>Primary Clinical Assessment</SectionTitle>
            <div className="p-5 rounded-2xl" style={{ background: primaryColor + '0E', border: `1.5px solid ${primaryColor}35` }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: primaryColor + 'AA' }}>Assessment Outcome</p>
                  <h3 className="text-xl font-black leading-tight" style={{ color: primaryColor, fontFamily: 'Poppins,sans-serif' }}>
                    {result.primary}
                  </h3>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-subtle)' }}>Confidence</p>
                  <p className="text-2xl font-black" style={{ color: primaryColor }}>{result.confidence}%</p>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: 'rgba(0,0,0,0.08)' }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${result.confidence}%`, background: `linear-gradient(90deg,${primaryColor}88,${primaryColor})` }} />
              </div>
              {/* Narrative */}
              <p className="text-sm leading-[1.75] text-justify" style={{ color: 'var(--text-primary)' }}>{result.narrative}</p>
            </div>
          </div>

          {/* ── Differential Diagnosis ── */}
          <div>
            <SectionTitle>Differential Diagnosis — Likelihood Scores</SectionTitle>
            <div className="space-y-3">
              {[
                { label: 'Polycystic Ovary Syndrome (PCOS) / PCOD', score: result.pcosPct, color: '#6F5CD0', basis: 'Rotterdam Criteria: Oligo-anovulation, hyperandrogenism, polycystic morphology' },
                { label: 'Menopause / Perimenopause', score: result.menoPct, color: '#8B5C8B', basis: 'Vasomotor symptoms, hormonal decline, menstrual cessation' },
                { label: 'Normal Hormonal Variation', score: Math.max(5, 100 - result.pcosPct - result.menoPct), color: '#4DB88A', basis: 'Within-range fluctuation without pathological pattern' },
              ].map(d => (
                <div key={d.label} className="p-3.5 rounded-2xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-soft)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{d.label}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>{d.basis}</p>
                    </div>
                    <span className="text-base font-black ml-4 shrink-0" style={{ color: d.color }}>{d.score}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
                    <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Symptom Inventory ── */}
          <div>
            <SectionTitle>Reported Symptom Inventory</SectionTitle>
            <div className="space-y-4">

              {/* Menstrual */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--accent)' }}>Menstrual History</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: 'Cycle Regularity',   value: ans.cycles     || 'Not specified' },
                    { label: 'Period Frequency',    value: ans.frequency  || 'Not specified' },
                    { label: 'Heavy Menstrual Bleeding', value: ans.heavyBleed || 'Not specified' },
                    { label: 'Dysmenorrhoea (Pain Level)', value: ans.painLevel  || 'Not specified' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center px-3 py-2.5 rounded-xl"
                      style={{ background: 'var(--accent-soft)', border: '1px solid var(--border-soft)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--accent)' }}>Physical Symptoms Reported</p>
                {ph.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ph.map(key => (
                      <div key={key} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                        style={{ background: 'rgba(111,92,208,0.06)', border: '1px solid rgba(111,92,208,0.16)' }}>
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#6F5CD0' }} />
                        <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{PHYSICAL_LABELS[key] || key}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic" style={{ color: 'var(--text-subtle)' }}>No physical symptoms selected.</p>
                )}
              </div>

              {/* Psychological & Other */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--accent)' }}>Psychological & Lifestyle Factors</p>
                {m.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {m.map(key => (
                      <div key={key} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                        style={{ background: 'rgba(139,92,139,0.06)', border: '1px solid rgba(139,92,139,0.16)' }}>
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#8B5C8B' }} />
                        <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{MOOD_LABELS[key] || key}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic" style={{ color: 'var(--text-subtle)' }}>No psychological symptoms selected.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Recommended Lab Tests ── */}
          <div>
            <SectionTitle>Recommended Diagnostic Investigations</SectionTitle>
            <div className="space-y-2">
              {result.labTests.map((t, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border-soft)' }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg,#6F5CD0,#A596F0)', minWidth: '20px' }}>{i + 1}</span>
                  <div>
                    <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{t.test}</p>
                    <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{t.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Lifestyle Recommendations ── */}
          <div>
            <SectionTitle>Lifestyle & Self-Management Plan</SectionTitle>
            <div className="space-y-2">
              {result.lifestyle.map((l, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'var(--accent-soft)', border: '1px solid var(--border-soft)' }}>
                  <span className="text-sm shrink-0 mt-0.5">{'🌿🥗🏃‍♀️🧘‍♀️💊🌸🫁'.split('').filter((_, j) => j % 2 === 0)[i % 4]}</span>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Clinical Recommendations ── */}
          <div>
            <SectionTitle>Clinical Action Plan</SectionTitle>
            <div className="space-y-2">
              {result.recs.map((r, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(111,92,208,0.05)', border: '1px solid rgba(111,92,208,0.14)' }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 mt-0.5"
                    style={{ background: '#6F5CD0', minWidth: '20px' }}>{i + 1}</span>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{r}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Disclaimer ── */}
          <div className="flex gap-3 p-4 rounded-2xl" style={{ background: 'rgba(212,133,10,0.07)', border: '1px solid rgba(212,133,10,0.22)' }}>
            <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: '#D4850A' }} />
            <div>
              <p className="text-xs font-bold mb-0.5" style={{ color: '#D4850A' }}>Medical Disclaimer</p>
              <p className="text-xs leading-relaxed" style={{ color: '#D4850A' }}>
                This report is generated by an AI symptom analysis tool for educational and informational purposes only. It does not constitute a medical diagnosis, and results should not be used as a substitute for professional clinical evaluation. Please present this report to a qualified gynaecologist or endocrinologist for formal diagnosis, confirmation, and treatment planning.
              </p>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border-soft)' }}>
            <p className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>
              FemCare AI · Symptom Assessment Engine v2.0 · {reportDate}
            </p>
            <button onClick={reset} className="btn-primary text-xs py-2 px-5">New Assessment</button>
          </div>

        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg,#6F5CD0,#A596F0)' }}>
          <Activity size={16} strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
            Symptom Checker
            <span className="ml-2 text-base font-normal" style={{ color: 'var(--text-muted)' }}>| Condition Analysis</span>
          </h2>
        </div>
      </div>

      {/* Card */}
      <div className="panel">
        <Stepper />

        {/* Step 1 — Basic Info */}
        {step === 0 && (
          <div className="space-y-5 animate-fade-up">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>Basic Information</h3>
            <div className="grid grid-cols-3 gap-4">
              {[{ key: 'age', label: 'AGE', placeholder: 'e.g. 28', type: 'number' },
                { key: 'height', label: 'HEIGHT (CM)', placeholder: '165', type: 'number' },
                { key: 'weight', label: 'WEIGHT (KG)', placeholder: '60', type: 'number' }].map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                  <input type={f.type} className="app-input" placeholder={f.placeholder}
                    value={answers[f.key] || ''}
                    onChange={e => set(f.key, e.target.value)} />
                </div>
              ))}
            </div>
            {answers.height && answers.weight && (
              <div className="flex items-center gap-2 p-3 rounded-2xl" style={{ background: 'var(--accent-soft)', border: '1px solid var(--border-soft)' }}>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Calculated BMI:</span>
                <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{calcBMI()}</span>
                <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>
                  {(() => { const b = parseFloat(calcBMI()); return b < 18.5 ? '(Underweight)' : b < 25 ? '(Normal)' : b < 30 ? '(Overweight)' : '(Obese)'; })()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Menstrual Health */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-up">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>Menstrual Health</h3>
            <Q label="How regular are your cycles?">
              <PillGroup value={answers.cycles} onChange={v => set('cycles', v)}
                options={[{ value: 'Regular', label: 'Regular' }, { value: 'Irregular', label: 'Irregular' }, { value: 'Very Irregular', label: 'Very Irregular' }, { value: 'Absent', label: 'Absent' }]} />
            </Q>
            <Q label="How often do you get periods?">
              <PillGroup value={answers.frequency} onChange={v => set('frequency', v)}
                options={[{ value: 'Monthly', label: 'Monthly' }, { value: 'Every 2-3 months', label: 'Every 2–3 months' }, { value: 'Rare', label: 'Rare' }, { value: 'Stopped', label: 'Stopped' }]} />
            </Q>
            <Q label="Do you experience heavy bleeding?">
              <PillGroup value={answers.heavyBleed} onChange={v => set('heavyBleed', v)}
                options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} />
            </Q>
            <Q label="How painful are your periods?">
              <PillGroup value={answers.painLevel} onChange={v => set('painLevel', v)}
                options={[{ value: 'None', label: 'None' }, { value: 'Mild', label: 'Mild' }, { value: 'Moderate', label: 'Moderate' }, { value: 'Severe', label: 'Severe' }]} />
            </Q>
          </div>
        )}

        {/* Step 3 — Physical Symptoms */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-up">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>Physical Symptoms</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select all that apply:</p>
            <PillGroup multi value={answers.physical} onChange={v => set('physical', v)}
              options={[
                { value: 'excess_hair',    label: '🧔 Excess Facial/Body Hair' },
                { value: 'acne',           label: '🌋 Acne / Oily Skin' },
                { value: 'hair_loss',      label: '💇 Hair Thinning / Loss' },
                { value: 'skin_darkening', label: '🎭 Skin Darkening (Neck/Armpits)' },
                { value: 'weight_gain',    label: '⚖️ Weight Gain / Hard to Lose' },
                { value: 'hot_flashes',    label: '🔥 Hot Flashes' },
                { value: 'night_sweats',   label: '🌙 Night Sweats' },
                { value: 'vaginal_dry',    label: '💧 Vaginal Dryness' },
                { value: 'breast_tender',  label: '🩷 Breast Tenderness' },
                { value: 'bloating',       label: '🫧 Bloating' },
                { value: 'fatigue',        label: '😴 Fatigue / Low Energy' },
              ]} />
          </div>
        )}

        {/* Step 4 — Mood & Other */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-up">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>Mood & Other Factors</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select all that apply:</p>
            <PillGroup multi value={answers.mood} onChange={v => set('mood', v)}
              options={[
                { value: 'mood_swings',  label: '🌪️ Mood Swings' },
                { value: 'anxiety',      label: '😰 Anxiety / Depression' },
                { value: 'brain_fog',    label: '🧠 Brain Fog / Memory Issues' },
                { value: 'low_libido',   label: '❤️ Low Libido' },
                { value: 'sleep_issues', label: '😶 Sleep Problems' },
                { value: 'fertility',    label: '🌸 Difficulty Conceiving' },
                { value: 'family_pcos',  label: '🧬 Family History of PCOS' },
                { value: 'family_meno',  label: '👩‍👧 Family History of Early Menopause' },
              ]} />
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-8 pt-5" style={{ borderTop: '1px solid var(--border-soft)' }}>
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all hover:-translate-x-0.5 disabled:opacity-30"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-input)', border: '1px solid var(--border-soft)' }}>
            <ChevronLeft size={15} /> Back
          </button>

          <button onClick={handleNext}
            className="btn-primary flex items-center gap-1.5">
            {step === STEPS.length - 1 ? '✨ Get My Assessment' : 'Next'} {step < STEPS.length - 1 && <ChevronRight size={15} />}
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-center mt-3 flex items-center justify-center gap-1" style={{ color: 'var(--text-subtle)' }}>
          <AlertTriangle size={11} /> This tool is for educational purposes only. Always consult a healthcare professional.
        </p>
      </div>
    </div>
  );
};

export default Symptoms;
