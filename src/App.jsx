import React, { useState, useEffect, useMemo } from 'react';

/* ============================================================
   DATA
   ============================================================ */

const CATEGORIES = ['Barbell', 'Dumbbell', 'Resistance Cables', 'Bodyweight', 'Core'];

const BUILT_IN = [
  { id: 'bb-back-squat', name: 'Back Squat', category: 'Barbell' },
  { id: 'bb-front-squat', name: 'Front Squat', category: 'Barbell' },
  { id: 'bb-deadlift', name: 'Deadlift', category: 'Barbell' },
  { id: 'bb-bent-over-row', name: 'Bent Over Barbell Rows', category: 'Barbell' },
  { id: 'bb-overhead-press', name: 'Overhead Press', category: 'Barbell' },
  { id: 'bb-landmine-row', name: 'Landmine Row', category: 'Barbell' },
  { id: 'bb-bench-press', name: 'Barbell Bench Press', category: 'Barbell' },

  { id: 'db-bicep-curl', name: 'Dumbbell Bicep Curl', category: 'Dumbbell' },
  { id: 'db-chest-press', name: 'Dumbbell Chest Press', category: 'Dumbbell' },
  { id: 'db-shoulder-press', name: 'Dumbbell Shoulder Press', category: 'Dumbbell' },
  { id: 'db-single-arm-row', name: 'Dumbbell Single Arm Row', category: 'Dumbbell' },
  { id: 'db-chest-supported-row', name: 'Dumbbell Chest Supported Row', category: 'Dumbbell' },
  { id: 'db-concentration-curl', name: 'Dumbbell Concentration Curl', category: 'Dumbbell' },
  { id: 'db-oh-tricep-ext', name: 'Dumbbell Overhead Tricep Extension', category: 'Dumbbell' },
  { id: 'db-skullcrusher', name: 'Dumbbell Skullcrusher', category: 'Dumbbell' },
  { id: 'db-tricep-kickback', name: 'Dumbbell Tricep Kickback', category: 'Dumbbell' },
  { id: 'db-pullover', name: 'Dumbbell Pullover', category: 'Dumbbell' },
  { id: 'db-rear-delt-fly', name: 'Dumbbell Rear Delt Fly', category: 'Dumbbell' },
  { id: 'db-seated-calf-raise', name: 'Dumbbell Seated Calf Raise', category: 'Dumbbell' },
  { id: 'db-romanian-deadlift', name: 'Dumbbell Romanian Deadlift', category: 'Dumbbell' },
  { id: 'db-goblet-squat', name: 'Dumbbell Goblet Squat', category: 'Dumbbell' },
  { id: 'db-lateral-raise', name: 'Dumbbell Lateral Raise', category: 'Dumbbell' },

  { id: 'rc-bicep-curls', name: 'Bicep Curls', category: 'Resistance Cables' },
  { id: 'rc-straight-arm-pulldown', name: 'Straight Arm Pulldown', category: 'Resistance Cables' },
  { id: 'rc-tricep-pushdown', name: 'Tricep Pushdown', category: 'Resistance Cables' },
  { id: 'rc-chest-flys', name: 'Chest Flys', category: 'Resistance Cables' },
  { id: 'rc-face-pulls', name: 'Face Pulls', category: 'Resistance Cables' },
  { id: 'rc-cable-crunches', name: 'Cable Crunches', category: 'Resistance Cables' },

  { id: 'bw-calf-raise', name: 'Calf Raise', category: 'Bodyweight' },
  { id: 'bw-squat', name: 'Squat', category: 'Bodyweight' },
  { id: 'bw-push-up', name: 'Push Up', category: 'Bodyweight' },
  { id: 'bw-lunges', name: 'Lunges', category: 'Bodyweight' },

  { id: 'co-hanging-leg-raises', name: 'Hanging Leg Raises', category: 'Core' },
  { id: 'co-hanging-knee-raises', name: 'Hanging Knee Raises', category: 'Core' },
  { id: 'co-ab-crunch', name: 'Ab Crunch', category: 'Core' },
  { id: 'co-lying-leg-raise', name: 'Lying Leg Raise', category: 'Core' },
  { id: 'co-heel-taps', name: 'Heel Taps', category: 'Core' },
  { id: 'co-ab-rollout', name: 'Ab Rollout', category: 'Core' },
  { id: 'co-plank', name: 'Plank', category: 'Core' },
  { id: 'co-side-bends', name: 'Side Bends', category: 'Core' },
];

/* ============================================================
   STORAGE
   ============================================================ */

const KEYS = { custom: 'wt_custom_v1', plans: 'wt_plans_v2', sessions: 'wt_sessions_v2', active: 'wt_active_v2' };

const load = (k, fallback) => {
  try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
};
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { console.error(e); } };
const uid = () => Math.random().toString(36).slice(2, 10);

/* ============================================================
   WEIGHT HANDLING
   ============================================================ */

// Accept "12.5", "12,5", "12.50" -> canonical "12.5". Reject anything else.
const cleanWeight = (raw) => {
  const s = String(raw).replace(',', '.').replace(/[^0-9.]/g, '');
  const parts = s.split('.');
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
  if (parts[1]?.length > 2) return parts[0] + '.' + parts[1].slice(0, 2);
  return s;
};

// Display: 12.5 -> "12.5", 60 -> "60", 12.50 -> "12.5"
const showWeight = (w) => {
  const n = Number(w);
  if (!w && w !== 0) return '0';
  if (!isFinite(n)) return '0';
  return String(parseFloat(n.toFixed(2)));
};

const PLATE_STEPS = [1.25, 2.5, 5];

/* ============================================================
   STYLE
   ============================================================ */

const C = {
  void: '#0B0B0C',
  steel: '#16171A',
  panel: '#1E2024',
  chalk: '#F2F0EB',
  iron: '#797D86',
  load: '#E8412C',
  rack: '#2E3036',
  go: '#4ADE80',
  link: '#5B93D3',
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
.wt { font-family: 'Archivo', system-ui, sans-serif; background: ${C.void}; color: ${C.chalk}; min-height: 100vh; }
.mono { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
.eyebrow { font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: ${C.iron}; font-weight: 600; }
.wt input { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; background: ${C.void};
  border: 1px solid ${C.rack}; color: ${C.chalk}; border-radius: 6px; padding: 10px 6px; font-size: 16px;
  width: 100%; text-align: center; outline: none; }
.wt input:focus { border-color: ${C.load}; }
.wt input::-webkit-outer-spin-button, .wt input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.btn { font-family: 'Archivo', sans-serif; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  font-size: 12px; border: none; border-radius: 8px; padding: 14px 18px; cursor: pointer; transition: opacity .15s; }
.btn:active { opacity: .7; }
.btn-primary { background: ${C.chalk}; color: ${C.void}; }
.btn-load { background: ${C.load}; color: #fff; }
.btn-ghost { background: transparent; color: ${C.iron}; border: 1px solid ${C.rack}; }
.btn-panel { background: ${C.panel}; color: ${C.chalk}; }
.tapbar { position: sticky; bottom: 0; background: ${C.steel}; border-top: 1px solid ${C.rack}; display: flex; }
.tap { flex: 1; padding: 14px 4px calc(14px + env(safe-area-inset-bottom)); background: none; border: none;
  color: ${C.iron}; font-family: 'Archivo'; font-weight: 700; font-size: 11px; letter-spacing: .1em;
  text-transform: uppercase; cursor: pointer; border-top: 2px solid transparent; }
.tap.on { color: ${C.chalk}; border-top-color: ${C.load}; }
.card { background: ${C.steel}; border: 1px solid ${C.rack}; border-radius: 10px; }
.scroll::-webkit-scrollbar { display: none; }
.ss-rail { position: absolute; left: 7px; top: 22px; bottom: 22px; width: 2px; background: ${C.link}; opacity: .5; }
.ss-node { width: 16px; height: 16px; border-radius: 50%; border: 2px solid ${C.link}; background: ${C.steel};
  flex-shrink: 0; margin-top: 3px; z-index: 1; }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
`;

/* ============================================================
   HELPERS
   ============================================================ */

const fmtClock = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};
const fmtShort = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

// A block always exposes exercises[] -- singles just have one.
const blockExercises = (b) => b.type === 'superset' ? b.exercises : [b.exercises[0]];

// A block is complete once every set of every exercise inside it is ticked.
// An entry with zero sets (e.g. rounds all removed) does not count as complete.
const isBlockComplete = (block, entries) => blockExercises(block).every(exId => {
  const entry = entries.find(e => e.blockKey === block.key && e.exerciseId === exId);
  return entry && entry.sets.length > 0 && entry.sets.every(s => s.done);
});

/* ============================================================
   REST BAR
   ============================================================ */

function RestBar({ total, remaining, label, onSkip, onAdd }) {
  const pct = total > 0 ? (remaining / total) * 100 : 0;
  return (
    <div style={{ position: 'sticky', bottom: 0, zIndex: 20, background: C.steel, borderTop: `1px solid ${C.rack}` }}>
      <div style={{ height: 3, background: C.rack }}>
        <div style={{ height: '100%', width: `${pct}%`, background: C.load, transition: 'width 1s linear' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Rest{label ? ` - ${label}` : ''}
          </div>
          <div className="mono" style={{ fontSize: 34, fontWeight: 600, lineHeight: 1, color: remaining <= 5 ? C.load : C.chalk }}>
            {fmtShort(remaining)}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost" onClick={() => onAdd(30)}>+30s</button>
        <button className="btn btn-primary" onClick={onSkip}>Skip</button>
      </div>
    </div>
  );
}

/* ============================================================
   WEIGHT FIELD -- decimal-safe, with plate nudges
   ============================================================ */

function WeightField({ value, onChange, dim }) {
  const [focused, setFocused] = useState(false);
  const bump = (delta) => {
    const n = (parseFloat(value) || 0) + delta;
    onChange(n <= 0 ? '' : showWeight(n));
  };
  return (
    <div>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        placeholder="0"
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); if (value) onChange(showWeight(value)); }}
        onChange={e => onChange(cleanWeight(e.target.value))}
        style={{ opacity: dim ? .5 : 1 }}
      />
      {focused && (
        <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
          {PLATE_STEPS.map(s => (
            <button key={s} className="btn mono" onMouseDown={e => e.preventDefault()} onClick={() => bump(s)}
              style={{ flex: 1, padding: '5px 0', fontSize: 9, background: C.panel, color: C.iron, letterSpacing: 0 }}>
              +{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   EXERCISE PICKER -- multi-select for supersets
   ============================================================ */

function ExercisePicker({ library, onDone, onClose, onAddCustom, multi }) {
  const [q, setQ] = useState('');
  const [chosen, setChosen] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState(CATEGORIES[0]);

  const grouped = useMemo(() => {
    const f = library.filter(e => e.name.toLowerCase().includes(q.toLowerCase()));
    return CATEGORIES.map(cat => ({ cat, items: f.filter(e => e.category === cat) })).filter(g => g.items.length);
  }, [library, q]);

  const toggle = (ex) => {
    if (!multi) { onDone([ex.id]); return; }
    setChosen(c => c.includes(ex.id) ? c.filter(x => x !== ex.id) : [...c, ex.id]);
  };

  const commitCustom = () => {
    const n = newName.trim();
    if (!n) return;
    onAddCustom({ id: `cu-${uid()}`, name: n, category: newCat, custom: true });
    setNewName(''); setAdding(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.void, zIndex: 50, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 16, borderBottom: `1px solid ${C.rack}`, paddingTop: 'calc(16px + env(safe-area-inset-top))' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, letterSpacing: '.08em', fontSize: 13, textTransform: 'uppercase' }}>
            {multi ? 'Pick 2 or more' : 'Exercises'}
          </div>
          <button className="btn btn-ghost" onClick={() => setAdding(a => !a)}>{adding ? '-' : '+ New'}</button>
        </div>

        {adding && (
          <div className="card" style={{ padding: 14, marginBottom: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Add to library</div>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Exercise name"
              style={{ textAlign: 'left', marginBottom: 10 }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setNewCat(c)} className="btn"
                  style={{ padding: '8px 10px', fontSize: 10, background: newCat === c ? C.load : C.panel, color: newCat === c ? '#fff' : C.iron }}>
                  {c}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={commitCustom}>Save exercise</button>
          </div>
        )}

        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search" style={{ textAlign: 'left' }} />
      </div>

      <div className="scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px' }}>
        {grouped.length === 0 && (
          <div style={{ color: C.iron, padding: '32px 0', textAlign: 'center', fontSize: 14 }}>
            No exercises match "{q}". Add it with + New.
          </div>
        )}
        {grouped.map(g => (
          <div key={g.cat}>
            <div className="eyebrow" style={{ padding: '20px 0 8px', position: 'sticky', top: 0, background: C.void }}>{g.cat}</div>
            {g.items.map(e => {
              const on = chosen.includes(e.id);
              const order = chosen.indexOf(e.id) + 1;
              return (
                <button key={e.id} onClick={() => toggle(e)}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: `1px solid ${C.rack}`,
                    color: C.chalk, padding: '15px 2px', fontSize: 15, fontFamily: 'Archivo', fontWeight: 500, cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <span style={{ flex: 1 }}>{e.name}</span>
                  {e.custom && <span className="eyebrow" style={{ color: C.load }}>Custom</span>}
                  {multi && (
                    <span className="mono" style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${on ? C.link : C.rack}`, background: on ? C.link : 'transparent',
                      color: on ? C.void : 'transparent', fontSize: 12, display: 'grid', placeItems: 'center', fontWeight: 600 }}>
                      {order || 0}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {multi && (
        <div style={{ padding: '12px 16px calc(12px + env(safe-area-inset-bottom))', borderTop: `1px solid ${C.rack}`, background: C.steel }}>
          <button className="btn btn-primary" style={{ width: '100%', opacity: chosen.length < 2 ? .4 : 1 }}
            disabled={chosen.length < 2} onClick={() => onDone(chosen)}>
            {chosen.length < 2 ? 'Pick at least 2' : `Create superset - ${chosen.length} exercises`}
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PLAN EDITOR
   ============================================================ */

function PlanEditor({ plan, library, onSave, onCancel }) {
  const [name, setName] = useState(plan?.name || '');
  const [blocks, setBlocks] = useState(plan?.blocks || []);
  const [picking, setPicking] = useState(null); // null | 'single' | 'superset'
  const [customs, setCustoms] = useState([]);

  const fullLib = [...library, ...customs];
  const nameOf = id => fullLib.find(e => e.id === id)?.name || 'Unknown';

  const addBlock = (ids) => {
    setBlocks(b => [...b, {
      key: uid(),
      type: picking === 'superset' ? 'superset' : 'single',
      exercises: ids,
      sets: 3,
      targetReps: 10,
      restSec: picking === 'superset' ? 60 : 90,
      weights: Object.fromEntries(ids.map(id => [id, ''])), // per-exercise starting weight
    }]);
    setPicking(null);
  };

  const update = (key, field, val) => setBlocks(b => b.map(x => x.key === key ? { ...x, [field]: val } : x));
  const setWeight = (key, exId, val) => setBlocks(b => b.map(x =>
    x.key === key ? { ...x, weights: { ...(x.weights || {}), [exId]: val } } : x));
  const remove = key => setBlocks(b => b.filter(x => x.key !== key));
  const move = (i, dir) => setBlocks(b => {
    const n = [...b], j = i + dir;
    if (j < 0 || j >= n.length) return b;
    [n[i], n[j]] = [n[j], n[i]];
    return n;
  });
  // Drop one exercise out of a superset; if only one remains, demote to single.
  const dropFromSuperset = (key, exId) => setBlocks(b => b.map(x => {
    if (x.key !== key) return x;
    const rest = x.exercises.filter(e => e !== exId);
    return rest.length <= 1 ? { ...x, type: 'single', exercises: rest } : { ...x, exercises: rest };
  }).filter(x => x.exercises.length));

  const commit = () => {
    if (!name.trim() || !blocks.length) return;
    onSave({ id: plan?.id || uid(), name: name.trim(), blocks, createdAt: plan?.createdAt || new Date().toISOString() }, customs);
  };

  return (
    <div style={{ padding: '20px 16px 40px' }}>
      {picking && (
        <ExercisePicker library={fullLib} multi={picking === 'superset'} onDone={addBlock}
          onClose={() => setPicking(null)} onAddCustom={ex => setCustoms(c => [...c, ex])} />
      )}

      <div className="eyebrow" style={{ marginBottom: 8 }}>Plan name</div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Push Day"
        style={{ textAlign: 'left', fontSize: 18, marginBottom: 28, fontFamily: 'Archivo', fontWeight: 700 }} />

      {blocks.map((b, i) => {
        const ss = b.type === 'superset';
        return (
          <div key={b.key} className="card" style={{ padding: 16, marginBottom: 12, borderColor: ss ? C.link : C.rack }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <span className="mono" style={{ fontSize: 11, color: C.iron }}>{String(i + 1).padStart(2, '0')}</span>
                  {ss && <span className="eyebrow" style={{ color: C.link }}>Superset</span>}
                </div>

                {ss ? (
                  <div style={{ position: 'relative', paddingLeft: 0 }}>
                    <div className="ss-rail" />
                    {b.exercises.map(exId => (
                      <div key={exId} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, position: 'relative' }}>
                        <div className="ss-node" style={{ marginTop: 0 }} />
                        <div style={{ flex: 1, fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{nameOf(exId)}</div>
                        <div style={{ width: 82, flexShrink: 0 }}>
                          <input type="text" inputMode="decimal" placeholder="- kg"
                            value={b.weights?.[exId] ?? ''}
                            onChange={e => setWeight(b.key, exId, cleanWeight(e.target.value))}
                            onBlur={e => e.target.value && setWeight(b.key, exId, showWeight(e.target.value))}
                            style={{ padding: '8px 4px', fontSize: 13 }} />
                        </div>
                        <button onClick={() => dropFromSuperset(b.key, exId)}
                          style={{ background: 'none', border: 'none', color: C.iron, cursor: 'pointer', fontSize: 14, padding: 0, flexShrink: 0 }}>x</button>
                      </div>
                    ))}
                    <div className="eyebrow" style={{ textAlign: 'right', paddingRight: 26, marginTop: -4 }}>Starting weight</div>
                  </div>
                ) : (
                  <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.25 }}>{nameOf(b.exercises[0])}</div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button onClick={() => move(i, -1)} className="btn btn-ghost" style={{ padding: '6px 9px' }}>Up</button>
                <button onClick={() => move(i, 1)} className="btn btn-ghost" style={{ padding: '6px 9px' }}>Down</button>
                <button onClick={() => remove(b.key)} className="btn btn-ghost" style={{ padding: '6px 9px', color: C.load }}>x</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: ss ? '1fr 1fr 1fr' : '1fr 1fr 1fr 1fr', gap: 8 }}>
              {[[ss ? 'Rounds' : 'Sets', 'sets', 1], ['Reps', 'targetReps', 1], ['Rest (s)', 'restSec', 15]].map(([label, field, step]) => (
                <div key={field}>
                  <div className="eyebrow" style={{ marginBottom: 6, textAlign: 'center' }}>{label}</div>
                  <input type="number" inputMode="numeric" step={step} value={b[field]}
                    onChange={e => update(b.key, field, Math.max(0, parseInt(e.target.value) || 0))} />
                </div>
              ))}
              {!ss && (
                <div>
                  <div className="eyebrow" style={{ marginBottom: 6, textAlign: 'center' }}>Kg</div>
                  <input type="text" inputMode="decimal" placeholder="-"
                    value={b.weights?.[b.exercises[0]] ?? ''}
                    onChange={e => setWeight(b.key, b.exercises[0], cleanWeight(e.target.value))}
                    onBlur={e => e.target.value && setWeight(b.key, b.exercises[0], showWeight(e.target.value))} />
                </div>
              )}
            </div>

            <div className="mono" style={{ fontSize: 10, color: C.iron, marginTop: 12, lineHeight: 1.5 }}>
              {ss && <>REST RUNS ONCE PER ROUND, AFTER ALL EXERCISES.<br /></>}
              WEIGHT IS A STARTING POINT. SESSIONS PRE-FILL FROM YOUR LAST LOGGED SET.
            </div>
          </div>
        );
      })}

      <div style={{ display: 'flex', gap: 8, marginTop: 8, marginBottom: 28 }}>
        <button className="btn btn-panel" style={{ flex: 1 }} onClick={() => setPicking('single')}>+ Exercise</button>
        <button className="btn btn-panel" style={{ flex: 1, color: C.link }} onClick={() => setPicking('superset')}>+ Superset</button>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" style={{ flex: 2, opacity: (!name.trim() || !blocks.length) ? .4 : 1 }} onClick={commit}>
          Save plan
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   LIVE SESSION
   ============================================================ */

function Session({ session, plan, library, sessions, onUpdate, onFinish, onAbandon }) {
  const [elapsed, setElapsed] = useState(0);
  const [rest, setRest] = useState(null);

  useEffect(() => {
    const tick = () => setElapsed(Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [session.startedAt]);

  useEffect(() => {
    if (!rest) return;
    if (rest.remaining <= 0) { setRest(null); try { navigator.vibrate?.(300); } catch {} return; }
    const t = setTimeout(() => setRest(r => r && { ...r, remaining: r.remaining - 1 }), 1000);
    return () => clearTimeout(t);
  }, [rest]);

  const nameOf = id => library.find(e => e.id === id)?.name || 'Unknown';

  const prevFor = (exerciseId) => {
    for (const s of sessions) {
      const entry = s.entries.find(e => e.exerciseId === exerciseId);
      const done = entry?.sets.filter(x => x.done);
      if (done?.length) {
        const top = done.reduce((a, b) => (parseFloat(b.weight) || 0) > (parseFloat(a.weight) || 0) ? b : a);
        return `${showWeight(top.weight)}kg x ${top.reps || 0}`;
      }
    }
    return '-';
  };

  // entries are keyed by blockKey + exerciseId so the same exercise can appear twice
  const entryOf = (blockKey, exId) => session.entries.find(e => e.blockKey === blockKey && e.exerciseId === exId);

  const setField = (blockKey, exId, si, field, val) => {
    onUpdate({
      ...session,
      entries: session.entries.map(e => (e.blockKey !== blockKey || e.exerciseId !== exId) ? e : {
        ...e, sets: e.sets.map((s, j) => j !== si ? s : { ...s, [field]: val })
      }),
    });
  };

  // Ticking a set: rest fires only when the LAST exercise of the block completes that round.
  const toggleDone = (block, exId, si) => {
    const entry = entryOf(block.key, exId);
    const wasDone = entry.sets[si].done;
    const nextEntries = session.entries.map(e => (e.blockKey !== block.key || e.exerciseId !== exId) ? e : {
      ...e, sets: e.sets.map((s, j) => j !== si ? s : { ...s, done: !wasDone })
    });
    onUpdate({ ...session, entries: nextEntries });

    if (wasDone || !block.restSec) return;

    // Rest fires when the whole round is ticked -- order of ticking doesn't matter.
    const roundComplete = blockExercises(block).every(id => {
      const e = nextEntries.find(x => x.blockKey === block.key && x.exerciseId === id);
      return e?.sets[si]?.done;
    });

    if (roundComplete) {
      const label = block.type === 'superset' ? `Round ${si + 1}` : nameOf(exId);
      setRest({ total: block.restSec, remaining: block.restSec, label });
    }
  };

  const addRound = (block) => {
    onUpdate({
      ...session,
      entries: session.entries.map(e => e.blockKey !== block.key ? e : {
        ...e, sets: [...e.sets, { reps: String(block.targetReps || ''), weight: '', done: false }]
      }),
    });
  };

  const totalSets = session.entries.reduce((n, e) => n + e.sets.length, 0);
  const doneSets = session.entries.reduce((n, e) => n + e.sets.filter(s => s.done).length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: 16, borderBottom: `1px solid ${C.rack}`, display: 'flex', alignItems: 'center', gap: 14,
        position: 'sticky', top: 0, background: C.void, zIndex: 10 }}>
        <div>
          <div className="eyebrow">Duration</div>
          <div className="mono" style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.1 }}>{fmtClock(elapsed)}</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'right' }}>
          <div className="eyebrow">Sets</div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 600 }}>{doneSets}<span style={{ color: C.iron }}>/{totalSets}</span></div>
        </div>
        <button className="btn btn-load" onClick={() => onFinish(session)}>Finish</button>
      </div>

      <div style={{ padding: '20px 16px 32px', flex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <div className="eyebrow">Now training</div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em' }}>{plan.name}</div>
        </div>

        {(() => {
          const completion = plan.blocks.map(block => isBlockComplete(block, session.entries));
          const currentIdx = completion.findIndex(done => !done); // -1 if everything is done
          return plan.blocks.map((block, blockIdx) => {
          const ss = block.type === 'superset';
          const exs = blockExercises(block);
          const rounds = entryOf(block.key, exs[0])?.sets.length || 0;
          const complete = completion[blockIdx];
          const isCurrent = blockIdx === currentIdx;

          return (
            <div key={block.key} className="card" style={{
              padding: 16, marginBottom: 14,
              borderColor: isCurrent ? C.load : (ss ? C.link : C.rack),
              borderWidth: isCurrent ? 2 : 1,
              opacity: complete ? 0.55 : 1,
              transition: 'opacity .2s, border-color .2s',
            }}>
              {isCurrent && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span className="eyebrow" style={{ color: C.load }}>Current</span>
                  <div style={{ flex: 1, height: 1, background: C.rack }} />
                </div>
              )}
              {ss && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span className="eyebrow" style={{ color: C.link }}>Superset</span>
                  <div style={{ flex: 1, height: 1, background: C.rack }} />
                  <span className="mono" style={{ fontSize: 10, color: C.iron }}>REST {block.restSec}s AFTER ROUND</span>
                </div>
              )}

              {exs.map((exId, exIdx) => {
                const entry = entryOf(block.key, exId);
                if (!entry) return null;
                return (
                  <div key={exId} style={{ marginBottom: exIdx < exs.length - 1 ? 22 : 0 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      {ss && <div className="ss-node" style={{ marginTop: 0 }} />}
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{nameOf(exId)}</div>
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: C.iron, margin: '6px 0 14px', paddingLeft: ss ? 26 : 0 }}>
                      TARGET {block.targetReps} REPS - LAST {prevFor(exId)}
                      {entry.seedSource === 'plan' && <span style={{ color: C.link }}> - PLAN WEIGHT</span>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '30px 1fr 1fr 50px', gap: 8, marginBottom: 8 }}>
                      <div className="eyebrow" style={{ textAlign: 'center' }}>{ss ? 'RD' : '#'}</div>
                      <div className="eyebrow" style={{ textAlign: 'center' }}>Reps</div>
                      <div className="eyebrow" style={{ textAlign: 'center' }}>Kg</div>
                      <div />
                    </div>

                    {entry.sets.map((s, si) => (
                      <div key={si} style={{ display: 'grid', gridTemplateColumns: '30px 1fr 1fr 50px', gap: 8,
                        marginBottom: 8, alignItems: 'start' }}>
                        <div className="mono" style={{ textAlign: 'center', color: C.iron, fontSize: 13, paddingTop: 12 }}>{si + 1}</div>
                        <input type="number" inputMode="numeric" value={s.reps} placeholder={String(block.targetReps)}
                          onChange={e => setField(block.key, exId, si, 'reps', e.target.value)}
                          style={{ opacity: s.done ? .5 : 1 }} />
                        <WeightField value={s.weight} dim={s.done}
                          onChange={v => setField(block.key, exId, si, 'weight', v)} />
                        <button onClick={() => toggleDone(block, exId, si)} className="btn"
                          style={{ padding: '11px 0', background: s.done ? C.go : C.panel, color: s.done ? C.void : C.iron, fontSize: 14 }}>
                          OK
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}

              <button className="btn btn-ghost" style={{ width: '100%', marginTop: 14, padding: 10 }} onClick={() => addRound(block)}>
                + {ss ? 'Round' : 'Set'} <span className="mono" style={{ opacity: .6 }}>({rounds})</span>
              </button>
            </div>
          );
        });
        })()}

        <button className="btn btn-ghost" style={{ width: '100%', marginTop: 16, color: C.load, borderColor: C.load }} onClick={onAbandon}>
          Discard session
        </button>
      </div>

      {rest && <RestBar total={rest.total} remaining={rest.remaining} label={rest.label}
        onSkip={() => setRest(null)} onAdd={n => setRest(r => ({ ...r, total: r.total + n, remaining: r.remaining + n }))} />}
    </div>
  );
}

/* ============================================================
   ROOT
   ============================================================ */

export default function App() {
  const [tab, setTab] = useState('plans');
  const [customs, setCustoms] = useState(() => load(KEYS.custom, []));
  const [plans, setPlans] = useState(() => load(KEYS.plans, []));
  const [sessions, setSessions] = useState(() => load(KEYS.sessions, []));
  const [active, setActive] = useState(() => load(KEYS.active, null));
  const [editing, setEditing] = useState(null);
  const [openSession, setOpenSession] = useState(null);

  useEffect(() => save(KEYS.custom, customs), [customs]);
  useEffect(() => save(KEYS.plans, plans), [plans]);
  useEffect(() => save(KEYS.sessions, sessions), [sessions]);
  useEffect(() => save(KEYS.active, active), [active]);

  const library = useMemo(() => [...BUILT_IN, ...customs], [customs]);
  const nameOf = id => library.find(e => e.id === id)?.name || 'Unknown';

  // Heaviest set from the most recent session that logged this exercise.
  const lastWeight = (exerciseId) => {
    for (const s of sessions) {
      const e = s.entries.find(x => x.exerciseId === exerciseId);
      if (e?.sets.length) {
        const top = e.sets.reduce((a, b) => (parseFloat(b.weight) || 0) > (parseFloat(a.weight) || 0) ? b : a);
        if (parseFloat(top.weight) > 0) return showWeight(top.weight);
      }
    }
    return null;
  };

  const startSession = (plan) => {
    const entries = [];
    plan.blocks.forEach(b => {
      blockExercises(b).forEach(exId => {
        // Rolling: last logged weight wins; plan weight is the fallback for session one.
        const prior = lastWeight(exId);
        const planned = b.weights?.[exId] || '';
        const seed = prior ?? planned;
        entries.push({
          blockKey: b.key, exerciseId: exId, blockType: b.type,
          seedSource: prior ? 'last' : (planned ? 'plan' : null),
          sets: Array.from({ length: b.sets }, () => ({ reps: String(b.targetReps || ''), weight: seed, done: false })),
        });
      });
    });
    setActive({ id: uid(), planId: plan.id, planName: plan.name, startedAt: new Date().toISOString(), entries });
    setTab('train');
  };

  const finish = (s) => {
    const kept = {
      ...s, endedAt: new Date().toISOString(),
      entries: s.entries.map(e => ({ ...e, sets: e.sets.filter(x => x.done) })).filter(e => e.sets.length),
    };
    if (kept.entries.length) setSessions(prev => [kept, ...prev]);
    setActive(null);
    setTab('history');
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ customs, plans, sessions, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `workout-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const activePlan = active ? plans.find(p => p.id === active.planId) : null;

  return (
    <div className="wt">
      <style>{CSS}</style>
      <div style={{ maxWidth: 560, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {tab === 'train' && (
          active && activePlan
            ? <Session session={active} plan={activePlan} library={library} sessions={sessions}
                onUpdate={setActive} onFinish={finish} onAbandon={() => { setActive(null); setTab('plans'); }} />
            : <div style={{ flex: 1, padding: '80px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Nothing in progress</div>
                <div style={{ color: C.iron, fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>Pick a plan to start logging sets.</div>
                <button className="btn btn-primary" onClick={() => setTab('plans')}>Go to plans</button>
              </div>
        )}

        {tab === 'plans' && (
          editing
            ? <PlanEditor plan={editing === 'new' ? null : editing} library={library}
                onSave={(p, newCustoms) => {
                  if (newCustoms.length) setCustoms(c => [...c, ...newCustoms]);
                  setPlans(prev => prev.some(x => x.id === p.id) ? prev.map(x => x.id === p.id ? p : x) : [...prev, p]);
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)} />
            : <div style={{ flex: 1, padding: '24px 16px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
                  <div>
                    <div className="eyebrow">Library - {library.length} exercises</div>
                    <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>Plans</div>
                  </div>
                  <button className="btn btn-primary" onClick={() => setEditing('new')}>+ New</button>
                </div>

                {active && (
                  <button onClick={() => setTab('train')} className="card"
                    style={{ width: '100%', padding: 16, marginBottom: 20, textAlign: 'left', cursor: 'pointer', borderColor: C.load }}>
                    <div className="eyebrow" style={{ color: C.load }}>In progress</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>{active.planName} -- resume</div>
                  </button>
                )}

                {plans.length === 0 && (
                  <div style={{ color: C.iron, fontSize: 14, lineHeight: 1.6, padding: '40px 0', textAlign: 'center' }}>
                    No plans yet. Build one, then start it from here.
                  </div>
                )}

                {plans.map(p => (
                  <div key={p.id} className="card" style={{ padding: 16, marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{p.name}</div>
                    <div className="mono" style={{ fontSize: 11, color: C.iron, marginBottom: 14 }}>
                      {p.blocks.reduce((n, b) => n + blockExercises(b).length, 0)} EXERCISES
                      {p.blocks.some(b => b.type === 'superset') && ` - ${p.blocks.filter(b => b.type === 'superset').length} SUPERSET`}
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      {p.blocks.map((b, i) => (
                        <div key={i} style={{ padding: '8px 0', borderBottom: i < p.blocks.length - 1 ? `1px solid ${C.rack}` : 'none' }}>
                          {b.type === 'superset' && <div className="eyebrow" style={{ color: C.link, marginBottom: 5 }}>Superset</div>}
                          {blockExercises(b).map((exId, j) => (
                            <div key={exId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '2px 0' }}>
                              <span style={{ color: C.chalk, paddingLeft: b.type === 'superset' ? 10 : 0,
                                borderLeft: b.type === 'superset' ? `2px solid ${C.link}` : 'none' }}>{nameOf(exId)}</span>
                              <span className="mono" style={{ color: C.iron, fontSize: 12, whiteSpace: 'nowrap', marginLeft: 12 }}>
                                {j === 0 && `${b.sets}x${b.targetReps}`}
                                {b.weights?.[exId] && ` @ ${b.weights[exId]}kg`}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost" onClick={() => setEditing(p)}>Edit</button>
                      <button className="btn btn-ghost" style={{ color: C.load }}
                        onClick={() => { if (confirm(`Delete "${p.name}"?`)) setPlans(x => x.filter(y => y.id !== p.id)); }}>Delete</button>
                      <div style={{ flex: 1 }} />
                      <button className="btn btn-primary" disabled={!!active} style={{ opacity: active ? .4 : 1 }}
                        onClick={() => startSession(p)}>Start</button>
                    </div>
                  </div>
                ))}
              </div>
        )}

        {tab === 'history' && (
          <div style={{ flex: 1, padding: '24px 16px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
              <div>
                <div className="eyebrow">{sessions.length} sessions logged</div>
                <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>History</div>
              </div>
              <button className="btn btn-ghost" onClick={exportData}>Export</button>
            </div>

            {sessions.length === 0 && (
              <div style={{ color: C.iron, fontSize: 14, lineHeight: 1.6, padding: '40px 0', textAlign: 'center' }}>
                Finished sessions land here. Export regularly -- this data lives on this device only.
              </div>
            )}

            {sessions.map(s => {
              const open = openSession === s.id;
              const volume = s.entries.reduce((n, e) => n + e.sets.reduce((m, x) => m + (parseFloat(x.weight) || 0) * (parseInt(x.reps) || 0), 0), 0);
              const mins = Math.round((new Date(s.endedAt) - new Date(s.startedAt)) / 60000);
              return (
                <div key={s.id} className="card" style={{ padding: 16, marginBottom: 12 }}>
                  <button onClick={() => setOpenSession(open ? null : s.id)}
                    style={{ width: '100%', background: 'none', border: 'none', color: C.chalk, textAlign: 'left', cursor: 'pointer', padding: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, fontFamily: 'Archivo' }}>{s.planName}</div>
                        <div className="mono" style={{ fontSize: 11, color: C.iron, marginTop: 4 }}>
                          {fmtDate(s.startedAt).toUpperCase()} - {mins} MIN - {showWeight(volume)} KG VOLUME
                        </div>
                      </div>
                      <span style={{ color: C.iron, fontSize: 18 }}>{open ? '-' : '+'}</span>
                    </div>
                  </button>

                  {open && (
                    <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.rack}` }}>
                      {s.entries.map((e, i) => (
                        <div key={i} style={{ marginBottom: 16, paddingLeft: e.blockType === 'superset' ? 10 : 0,
                          borderLeft: e.blockType === 'superset' ? `2px solid ${C.link}` : 'none' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{nameOf(e.exerciseId)}</div>
                          {e.sets.map((x, j) => (
                            <div key={j} className="mono" style={{ display: 'flex', gap: 16, fontSize: 12, color: C.iron, padding: '3px 0' }}>
                              <span style={{ width: 20 }}>{j + 1}</span>
                              <span style={{ color: C.chalk }}>{x.reps || 0} reps</span>
                              <span style={{ color: C.chalk }}>{showWeight(x.weight)} kg</span>
                            </div>
                          ))}
                        </div>
                      ))}
                      <button className="btn btn-ghost" style={{ color: C.load, marginTop: 4 }}
                        onClick={() => { if (confirm('Delete this session?')) setSessions(p => p.filter(y => y.id !== s.id)); }}>
                        Delete session
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!(tab === 'train' && active) && !editing && (
          <div className="tapbar">
            {[['train', 'Train'], ['plans', 'Plans'], ['history', 'History']].map(([k, label]) => (
              <button key={k} className={`tap ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>
                {label}{k === 'train' && active ? ' -' : ''}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
