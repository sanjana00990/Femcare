import React, { useState } from 'react';
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

const CONDITIONS = [
  {
    id: 'pcos', emoji: '🌸', name: 'Polycystic Ovary Syndrome (PCOS)', accent: '#C94F68',
    source: 'World Health Organization (WHO)', sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome',
    overview: 'PCOS is a common hormonal disorder affecting 8–13% of women of reproductive age. It involves an imbalance in reproductive hormones, creating problems in the ovaries. The ovaries may develop numerous small follicles and fail to regularly release eggs.',
    causes: ['Excess insulin — high levels increase androgen production','Excess androgen — ovaries produce abnormally high male hormones','Low-grade chronic inflammation','Heredity / Genetics — tends to run in families','Insulin resistance'],
    symptoms: ['Irregular, infrequent, or prolonged menstrual cycles','Excess facial/body hair (hirsutism)','Severe or persistent acne, oily skin','Thinning hair or male-pattern baldness','Weight gain, especially around the abdomen','Difficulty getting pregnant','Mood changes — depression, anxiety'],
    complications: ['Type 2 diabetes or prediabetes','Infertility','Gestational diabetes','Sleep apnea','Depression and eating disorders','Endometrial cancer'],
    treatments: ['Combined oral contraceptive pills','Metformin (improves insulin resistance)','Clomiphene citrate (ovulation induction)','Spironolactone (anti-androgen)','Weight management — 5–10% loss significantly improves symptoms','Lifestyle: regular exercise, balanced diet, stress management'],
    diagnostics: ['Blood tests — testosterone, LH, FSH, insulin, thyroid','Pelvic ultrasound','Rotterdam Criteria — 2 of 3: irregular periods, excess androgens, polycystic ovaries'],
  },
  {
    id: 'pcod', emoji: '🌼', name: 'Polycystic Ovarian Disease (PCOD)', accent: '#E87A90',
    source: 'Apollo Hospitals Medical Guidelines', sourceUrl: 'https://www.apollohospitals.com/',
    overview: 'PCOD is a condition where the ovaries release many immature or partially mature eggs. It is more common than PCOS and generally a milder condition caused largely by lifestyle factors. Unlike PCOS, PCOD usually does not cause significant metabolic disturbances.',
    causes: ['Unhealthy lifestyle — poor diet, lack of physical activity','Obesity — increases hormonal imbalance','Chronic stress raises cortisol','Mild hormonal imbalance','Genetic predisposition'],
    symptoms: ['Irregular menstrual cycles','Heavy menstrual bleeding','Bloating and pelvic discomfort','Breast tenderness','Mild to moderate acne','Mood swings and irritability'],
    complications: ['Difficulty conceiving (less severe than PCOS)','Risk of developing PCOS if unmanaged','Endometrial thickening','Increased diabetes risk'],
    treatments: ['Lifestyle modification is the PRIMARY treatment','Oral contraceptive pills to regulate periods','Progesterone supplements','Anti-inflammatory diet rich in omega-3','Regular exercise — 30 min daily'],
    diagnostics: ['Pelvic ultrasound — shows multiple small cysts','Blood tests — hormone levels','Blood sugar and insulin tests','Menstrual history review'],
  },
  {
    id: 'menopause', emoji: '🍂', name: 'Menopause', accent: '#B8A0AA',
    source: 'WHO & Apollo Hospitals', sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/menopause',
    overview: 'Menopause is a natural biological process marking the permanent end of menstruation and fertility, diagnosed after 12 consecutive months without a period. The average age is 51. Perimenopause can begin 4–8 years before menopause.',
    causes: ['Natural decline of oestrogen and progesterone with age','Surgical menopause — removal of ovaries','Chemotherapy and radiation therapy','Primary ovarian insufficiency (POI)','Genetics and smoking'],
    symptoms: ['Hot flashes — sudden warmth over face and upper body','Night sweats disrupting sleep','Irregular periods leading to cessation','Vaginal dryness','Sleep disturbances and insomnia','Mood changes — irritability, anxiety','Brain fog and memory lapses','Weight gain'],
    complications: ['Osteoporosis — rapid bone density loss','Cardiovascular disease risk increases','Urinary incontinence','Metabolic syndrome','Depression and anxiety'],
    treatments: ['Hormone Replacement Therapy (HRT)','Low-dose vaginal oestrogen for dryness','SSRIs/SNRIs for hot flashes','Bisphosphonates for osteoporosis','Calcium + Vitamin D supplementation','CBT for mood symptoms','Regular weight-bearing exercise'],
    diagnostics: ['Clinical: 12 months without menstruation over 45','FSH blood test > 30 IU/L','Oestradiol levels < 30 pg/mL','Thyroid function tests','Bone density scan (DEXA)'],
  },
];

const Section = ({ title, items }) => (
  <div className="space-y-2.5">
    <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{title}</h4>
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="text-sm flex items-start gap-2.5 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const Learn = () => {
  const [expanded, setExpanded] = useState('pcos');

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg,#C94F68,#E87A90)' }}>
          <BookOpen size={16} strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
            Educational Hub
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Verified health information from WHO & Apollo</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex gap-3 p-4 rounded-2xl"
        style={{ background: 'rgba(212,133,10,0.08)', border: '1px solid rgba(212,133,10,0.22)' }}>
        <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: '#D4850A' }} />
        <p className="text-xs leading-relaxed" style={{ color: '#D4850A' }}>
          This information is for educational purposes only and does not replace professional medical advice. Always consult a qualified healthcare provider.
        </p>
      </div>

      {/* Accordions */}
      <div className="space-y-3">
        {CONDITIONS.map(c => {
          const isOpen = expanded === c.id;
          return (
            <div key={c.id} className="panel p-0 overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? '' : c.id)}
                className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-rose-primary/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: c.accent + '18', border: `1px solid ${c.accent}30` }}>
                    {c.emoji}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
                      {c.name}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>Source: {c.source}</p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-6 space-y-6 animate-fade-up"
                  style={{ borderTop: '1px solid var(--border-soft)' }}>

                  {/* Overview */}
                  <div className="mt-5 p-4 rounded-2xl"
                    style={{ background: 'var(--accent-soft)', border: '1px solid var(--border-soft)' }}>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{c.overview}</p>
                    <a href={c.sourceUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold mt-3 hover:underline"
                      style={{ color: 'var(--accent)' }}>
                      Read Official Source <ExternalLink size={11} />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Section title="🔬 Why It Occurs (Causes)"    items={c.causes}      />
                    <Section title="⚠️ Key Symptoms"               items={c.symptoms}    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    style={{ borderTop: '1px solid var(--border-soft)', paddingTop: '20px' }}>
                    <Section title="🩺 Possible Complications"     items={c.complications} />
                    <Section title="🔎 Diagnostic Tests"           items={c.diagnostics}   />
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: '20px' }}>
                    <Section title="💊 Treatments & Medicines"     items={c.treatments}  />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Learn;
