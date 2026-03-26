import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const emptySet = () => ({ reps: '', weight: '' });
const emptyExercise = () => ({ name: '', sets: [emptySet()] });

export default function LogWorkout() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', notes: '', date: new Date().toISOString().slice(0, 10) });
  const [exercises, setExercises] = useState([emptyExercise()]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateExercise(i, field, value) {
    setExercises((ex) => ex.map((e, idx) => idx === i ? { ...e, [field]: value } : e));
  }

  function updateSet(exIdx, setIdx, field, value) {
    setExercises((ex) =>
      ex.map((e, i) =>
        i === exIdx
          ? { ...e, sets: e.sets.map((s, j) => j === setIdx ? { ...s, [field]: value } : s) }
          : e
      )
    );
  }

  function addSet(exIdx) {
    setExercises((ex) => ex.map((e, i) => i === exIdx ? { ...e, sets: [...e.sets, emptySet()] } : e));
  }

  function removeSet(exIdx, setIdx) {
    setExercises((ex) =>
      ex.map((e, i) => i === exIdx && e.sets.length > 1 ? { ...e, sets: e.sets.filter((_, j) => j !== setIdx) } : e)
    );
  }

  function addExercise() {
    setExercises((ex) => [...ex, emptyExercise()]);
  }

  function removeExercise(i) {
    if (exercises.length > 1) setExercises((ex) => ex.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        exercises: exercises
          .filter((ex) => ex.name.trim())
          .map((ex) => ({
            name: ex.name,
            sets: ex.sets
              .filter((s) => s.reps && s.weight !== '')
              .map((s) => ({ reps: Number(s.reps), weight: Number(s.weight) })),
          })),
      };
      await api.post('/workouts', payload);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save workout');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Log Workout</h1>

      {error && <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-6 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <div>
            <label className="label">Workout Name *</label>
            <input className="input" placeholder="e.g. Push Day, Leg Day..." value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} placeholder="Optional notes..."
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        <div className="space-y-4">
          {exercises.map((ex, exIdx) => (
            <div key={exIdx} className="card">
              <div className="flex items-center gap-3 mb-4">
                <input
                  className="input flex-1"
                  placeholder={`Exercise ${exIdx + 1} name`}
                  value={ex.name}
                  onChange={(e) => updateExercise(exIdx, 'name', e.target.value)}
                />
                {exercises.length > 1 && (
                  <button type="button" onClick={() => removeExercise(exIdx)}
                    className="text-gray-600 hover:text-red-400 transition-colors text-lg">✕</button>
                )}
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 px-1">
                  <span className="col-span-1">Set</span>
                  <span className="col-span-5">Reps</span>
                  <span className="col-span-5">Weight (kg)</span>
                </div>
                {ex.sets.map((s, sIdx) => (
                  <div key={sIdx} className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-1 text-gray-500 text-sm text-center">{sIdx + 1}</span>
                    <input
                      className="input col-span-5 text-center"
                      type="number"
                      min="1"
                      placeholder="10"
                      value={s.reps}
                      onChange={(e) => updateSet(exIdx, sIdx, 'reps', e.target.value)}
                    />
                    <input
                      className="input col-span-5 text-center"
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="60"
                      value={s.weight}
                      onChange={(e) => updateSet(exIdx, sIdx, 'weight', e.target.value)}
                    />
                    <button type="button" onClick={() => removeSet(exIdx, sIdx)}
                      className="col-span-1 text-gray-600 hover:text-red-400 transition-colors text-sm text-center">✕</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => addSet(exIdx)}
                className="mt-3 text-sm text-primary-500 hover:text-primary-400 transition-colors">
                + Add Set
              </button>
            </div>
          ))}

          <button type="button" onClick={addExercise} className="btn-secondary w-full">
            + Add Exercise
          </button>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full text-lg py-3">
          {loading ? 'Saving...' : 'Save Workout'}
        </button>
      </form>
    </div>
  );
}
