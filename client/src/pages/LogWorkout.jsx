import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const PRESET_EXERCISES = ['Push-up', 'Crunch', 'Squat', 'Pull-up', 'Dip'];

const emptySet = () => ({ reps: '' });
const emptyExercise = (name = '') => ({ name, sets: [emptySet()] });

export default function LogWorkout() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', notes: '', date: new Date().toISOString().slice(0, 10) });
  const [exercises, setExercises] = useState([]);
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function addPreset(name) {
    if (exercises.find((e) => e.name === name)) return;
    setExercises((ex) => [...ex, emptyExercise(name)]);
  }

  function addCustom() {
    const name = customName.trim();
    if (!name) return;
    setExercises((ex) => [...ex, emptyExercise(name)]);
    setCustomName('');
  }

  function removeExercise(i) {
    setExercises((ex) => ex.filter((_, idx) => idx !== i));
  }

  function updateSet(exIdx, setIdx, value) {
    setExercises((ex) =>
      ex.map((e, i) =>
        i === exIdx
          ? { ...e, sets: e.sets.map((s, j) => j === setIdx ? { reps: value } : s) }
          : e
      )
    );
  }

  function addSet(exIdx) {
    setExercises((ex) => ex.map((e, i) => i === exIdx ? { ...e, sets: [...e.sets, emptySet()] } : e));
  }

  function removeSet(exIdx, setIdx) {
    setExercises((ex) =>
      ex.map((e, i) =>
        i === exIdx && e.sets.length > 1 ? { ...e, sets: e.sets.filter((_, j) => j !== setIdx) } : e
      )
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (exercises.length === 0) return setError('Add at least one exercise.');
    setLoading(true);
    try {
      await api.post('/workouts', {
        ...form,
        exercises: exercises.map((ex) => ({
          name: ex.name,
          sets: ex.sets
            .filter((s) => s.reps !== '')
            .map((s) => ({ reps: Number(s.reps), weight: 0 })),
        })),
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save workout');
    } finally {
      setLoading(false);
    }
  }

  const activePresets = exercises.map((e) => e.name);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Log Workout</h1>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-6 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workout meta */}
        <div className="card space-y-4">
          <div>
            <label className="label">Workout Name *</label>
            <input
              className="input"
              placeholder="e.g. Morning Workout, Home Training..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Date</label>
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Optional..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>

        {/* Exercise picker */}
        <div className="card">
          <p className="label mb-3">Add Exercises</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESET_EXERCISES.map((name) => {
              const active = activePresets.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => addPreset(name)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    active
                      ? 'bg-primary-600 border-primary-600 text-white cursor-default'
                      : 'border-gray-600 text-gray-300 hover:border-primary-500 hover:text-primary-400'
                  }`}
                >
                  {active ? '✓ ' : ''}{name}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Custom exercise name..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
            />
            <button type="button" onClick={addCustom} className="btn-secondary px-4 flex-shrink-0">Add</button>
          </div>
        </div>

        {/* Exercise list */}
        {exercises.length > 0 && (
          <div className="space-y-4">
            {exercises.map((ex, exIdx) => (
              <div key={exIdx} className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{ex.name}</h3>
                  <button
                    type="button"
                    onClick={() => removeExercise(exIdx)}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 px-1">
                    <span className="col-span-2 text-center">Set</span>
                    <span className="col-span-8">Reps</span>
                  </div>
                  {ex.sets.map((s, sIdx) => (
                    <div key={sIdx} className="grid grid-cols-12 gap-2 items-center">
                      <span className="col-span-2 text-gray-500 text-sm text-center">{sIdx + 1}</span>
                      <input
                        className="input col-span-8 text-center"
                        type="number"
                        min="1"
                        placeholder="10"
                        value={s.reps}
                        onChange={(e) => updateSet(exIdx, sIdx, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeSet(exIdx, sIdx)}
                        className="col-span-2 text-gray-600 hover:text-red-400 transition-colors text-sm text-center"
                      >✕</button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addSet(exIdx)}
                  className="mt-3 text-sm text-primary-500 hover:text-primary-400 transition-colors"
                >
                  + Add Set
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="submit" disabled={loading || exercises.length === 0} className="btn-primary w-full text-lg py-3">
          {loading ? 'Saving...' : 'Save Workout'}
        </button>
      </form>
    </div>
  );
}
