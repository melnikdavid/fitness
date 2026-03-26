import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function History() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/workouts').then(({ data }) => setWorkouts(data)).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    await api.delete(`/workouts/${id}`);
    setWorkouts((w) => w.filter((x) => x.id !== id));
  }

  const filtered = workouts.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Workout History</h1>
        <Link to="/log" className="btn-primary text-sm py-1.5 px-4">+ Log Workout</Link>
      </div>

      <input
        className="input mb-6"
        placeholder="Search workouts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">🏋️</div>
          <p className="text-gray-400">{search ? 'No workouts match your search.' : 'No workouts yet.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((workout) => {
            const date = new Date(workout.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            const totalSets = workout.exercises.reduce((a, ex) => a + ex.sets.length, 0);
            const totalVol = workout.exercises.reduce((a, ex) =>
              a + ex.sets.reduce((b, s) => b + s.reps * s.weight, 0), 0);

            return (
              <div key={workout.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg">{workout.name}</div>
                    <div className="text-sm text-gray-400 mt-0.5">{date}</div>
                    {workout.notes && <div className="text-sm text-gray-500 mt-1">{workout.notes}</div>}

                    <div className="flex gap-6 mt-3 text-sm">
                      <span className="text-gray-400">{workout.exercises.length} exercises</span>
                      <span className="text-gray-400">{totalSets} sets</span>
                      {totalVol > 0 && <span className="text-gray-400">{totalVol.toLocaleString()} kg total volume</span>}
                    </div>

                    <div className="mt-3 space-y-1">
                      {workout.exercises.map((ex) => (
                        <div key={ex.id} className="text-sm">
                          <span className="text-gray-300">{ex.name}</span>
                          <span className="text-gray-500 ml-2">
                            {ex.sets.map((s, i) => (
                              <span key={i}>{i > 0 && ', '}{s.reps}×{s.weight}kg</span>
                            ))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(workout.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0" title="Delete">✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
