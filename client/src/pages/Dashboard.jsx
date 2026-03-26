import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const EXERCISE_ICONS = {
  'Push-up': '🤜',
  'Crunch':  '🔥',
  'Squat':   '🦵',
  'Pull-up': '💪',
  'Dip':     '⬇️',
};

function StatCard({ label, value, sub }) {
  return (
    <div className="card text-center">
      <div className="text-3xl font-bold text-primary-500">{value}</div>
      <div className="text-gray-400 text-sm mt-1">{label}</div>
      {sub && <div className="text-gray-600 text-xs mt-0.5">{sub}</div>}
    </div>
  );
}

function ExerciseStat({ name, totalReps, weekReps }) {
  const icon = EXERCISE_ICONS[name] || '🏃';
  return (
    <div className="card flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold">{name}</div>
        <div className="text-sm text-gray-400">{totalReps.toLocaleString()} total reps</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-primary-500 font-bold">{weekReps}</div>
        <div className="text-xs text-gray-500">this week</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/workouts').then(({ data }) => setWorkouts(data)).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    await api.delete(`/workouts/${id}`);
    setWorkouts((w) => w.filter((x) => x.id !== id));
  }

  // Stats calculations
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const thisWeekWorkouts = workouts.filter((w) => new Date(w.date) >= weekStart);
  const totalReps = workouts.reduce((a, w) => a + w.exercises.reduce((b, ex) => b + ex.sets.reduce((c, s) => c + s.reps, 0), 0), 0);

  // Per-exercise totals
  const exerciseMap = {};
  workouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      if (!exerciseMap[ex.name]) exerciseMap[ex.name] = { total: 0, week: 0 };
      const reps = ex.sets.reduce((a, s) => a + s.reps, 0);
      exerciseMap[ex.name].total += reps;
    });
  });
  thisWeekWorkouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      if (!exerciseMap[ex.name]) exerciseMap[ex.name] = { total: 0, week: 0 };
      exerciseMap[ex.name].week += ex.sets.reduce((a, s) => a + s.reps, 0);
    });
  });

  const exerciseStats = Object.entries(exerciseMap)
    .map(([name, { total, week }]) => ({ name, totalReps: total, weekReps: week }))
    .sort((a, b) => b.totalReps - a.totalReps);

  const recentWorkouts = workouts.slice(0, 4);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {user.name} 👋</h1>
        <p className="text-gray-400 mt-1">Keep pushing!</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Workouts" value={workouts.length} />
        <StatCard label="This Week" value={thisWeekWorkouts.length} sub="workouts" />
        <StatCard label="Total Reps" value={totalReps.toLocaleString()} />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Exercise breakdown */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Exercise Breakdown</h2>
            <Link to="/stats" className="text-sm text-primary-500 hover:underline">View charts →</Link>
          </div>
          {loading ? (
            <div className="text-gray-500 text-center py-8">Loading...</div>
          ) : exerciseStats.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-400 text-sm">No exercises logged yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exerciseStats.map((s) => (
                <ExerciseStat key={s.name} {...s} />
              ))}
            </div>
          )}
        </div>

        {/* Recent workouts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Workouts</h2>
            <Link to="/log" className="btn-primary text-sm py-1.5 px-4">+ Log</Link>
          </div>

          {loading ? (
            <div className="text-gray-500 text-center py-8">Loading...</div>
          ) : recentWorkouts.length === 0 ? (
            <div className="card text-center py-8">
              <div className="text-4xl mb-2">🏋️</div>
              <p className="text-gray-400 text-sm">
                No workouts yet.{' '}
                <Link to="/log" className="text-primary-500 hover:underline">Log your first!</Link>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentWorkouts.map((workout) => {
                const date = new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const totalReps = workout.exercises.reduce((a, ex) => a + ex.sets.reduce((b, s) => b + s.reps, 0), 0);
                return (
                  <div key={workout.id} className="card flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{workout.name}</div>
                      <div className="text-sm text-gray-400">
                        {date} · {totalReps} reps · {workout.exercises.length} exercises
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(workout.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                    >✕</button>
                  </div>
                );
              })}
              {workouts.length > 4 && (
                <Link to="/history" className="block text-center text-primary-500 hover:underline text-sm mt-1">
                  View all {workouts.length} workouts →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
