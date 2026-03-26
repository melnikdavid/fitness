import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '../api/client';

const PRESET_EXERCISES = ['Push-up', 'Crunch', 'Squat', 'Pull-up', 'Dip'];
const COLORS = {
  'Push-up': '#22c55e',
  'Crunch':  '#3b82f6',
  'Squat':   '#f59e0b',
  'Pull-up': '#ec4899',
  'Dip':     '#a855f7',
  'Other':   '#6b7280',
};

// ── helpers ──────────────────────────────────────────────────────────────────

function getRepsForExercise(workouts, exName) {
  return workouts.flatMap((w) =>
    w.exercises
      .filter((e) => !exName || e.name === exName)
      .flatMap((e) => e.sets.map((s) => s.reps))
  ).reduce((a, b) => a + b, 0);
}

function getWeeklyData(workouts, exNames) {
  const now = new Date();
  const result = [];
  for (let w = 7; w >= 0; w--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - w * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const entry = {
      week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
    exNames.forEach((name) => {
      let total = 0;
      workouts.forEach((workout) => {
        const d = new Date(workout.date);
        if (d >= weekStart && d < weekEnd) {
          workout.exercises
            .filter((e) => e.name === name)
            .forEach((e) => e.sets.forEach((s) => { total += s.reps; }));
        }
      });
      entry[name] = +(total / 7).toFixed(1);
    });
    result.push(entry);
  }
  return result;
}

function getMonthlyData(workouts, exNames) {
  const now = new Date();
  const result = [];
  for (let m = 5; m >= 0; m--) {
    const year = now.getFullYear();
    const month = now.getMonth() - m;
    const monthStart = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const entry = {
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    };
    exNames.forEach((name) => {
      let total = 0;
      workouts.forEach((workout) => {
        const d = new Date(workout.date);
        if (d.getFullYear() === monthStart.getFullYear() && d.getMonth() === monthStart.getMonth()) {
          workout.exercises
            .filter((e) => e.name === name)
            .forEach((e) => e.sets.forEach((s) => { total += s.reps; }));
        }
      });
      entry[name] = +(total / daysInMonth).toFixed(1);
    });
    result.push(entry);
  }
  return result;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function Stats() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeExercises, setActiveExercises] = useState(PRESET_EXERCISES);

  useEffect(() => {
    api.get('/workouts').then(({ data }) => setWorkouts(data)).finally(() => setLoading(false));
  }, []);

  function toggleExercise(name) {
    setActiveExercises((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  // Collect all exercise names that appear in workouts
  const allNames = [...new Set(workouts.flatMap((w) => w.exercises.map((e) => e.name)))];
  const trackedNames = activeExercises.filter((n) => allNames.includes(n));

  const weeklyData  = getWeeklyData(workouts, trackedNames);
  const monthlyData = getMonthlyData(workouts, trackedNames);

  // Per-exercise totals
  const totals = allNames.map((name) => ({
    name,
    total: getRepsForExercise(workouts, name),
    color: COLORS[name] || COLORS['Other'],
  })).sort((a, b) => b.total - a.total);

  if (loading) return <div className="text-gray-500 text-center py-20">Loading...</div>;

  if (workouts.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 text-center">
        <div className="text-5xl mb-4">📊</div>
        <p className="text-gray-400 text-lg">No workout data yet. Start logging to see stats!</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <h1 className="text-2xl font-bold">Statistics</h1>

      {/* Exercise filter */}
      <div className="card">
        <p className="label mb-3">Filter by Exercise</p>
        <div className="flex flex-wrap gap-2">
          {allNames.map((name) => {
            const on = activeExercises.includes(name);
            const color = COLORS[name] || COLORS['Other'];
            return (
              <button
                key={name}
                onClick={() => toggleExercise(name)}
                style={on ? { backgroundColor: color, borderColor: color } : {}}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  on ? 'text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Totals */}
      <div>
        <h2 className="text-lg font-semibold mb-3">All-Time Totals</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {totals.map(({ name, total, color }) => (
            <div key={name} className="card text-center" style={{ borderColor: color + '55' }}>
              <div className="text-2xl font-bold" style={{ color }}>{total.toLocaleString()}</div>
              <div className="text-gray-400 text-xs mt-1">{name}</div>
              <div className="text-gray-500 text-xs">total reps</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly chart */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-1">Avg Daily Reps — Per Week</h2>
        <p className="text-sm text-gray-500 mb-5">Total reps in each week ÷ 7 days</p>
        {trackedNames.length === 0 ? (
          <p className="text-gray-500 text-sm">Select exercises above to display data.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#f3f4f6' }}
                itemStyle={{ color: '#d1d5db' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {trackedNames.map((name) => (
                <Bar key={name} dataKey={name} fill={COLORS[name] || COLORS['Other']} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Monthly chart */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-1">Avg Daily Reps — Per Month</h2>
        <p className="text-sm text-gray-500 mb-5">Total reps in each month ÷ days in that month</p>
        {trackedNames.length === 0 ? (
          <p className="text-gray-500 text-sm">Select exercises above to display data.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#f3f4f6' }}
                itemStyle={{ color: '#d1d5db' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {trackedNames.map((name) => (
                <Bar key={name} dataKey={name} fill={COLORS[name] || COLORS['Other']} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
