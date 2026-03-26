import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

function StatCard({ label, value }) {
  return (
    <div className="card text-center">
      <div className="text-3xl font-bold text-primary-500">{value}</div>
      <div className="text-gray-400 text-sm mt-1">{label}</div>
    </div>
  );
}

function WorkoutRow({ workout, onDelete }) {
  const date = new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  return (
    <div className="card flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{workout.name}</div>
        <div className="text-sm text-gray-400 mt-0.5">
          {date} · {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''} · {totalSets} set{totalSets !== 1 ? 's' : ''}
        </div>
        {workout.notes && <div className="text-sm text-gray-500 mt-1 truncate">{workout.notes}</div>}
      </div>
      <button onClick={() => onDelete(workout.id)} className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0" title="Delete">✕</button>
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

  const thisWeek = workouts.filter((w) => {
    const d = new Date(w.date);
    const now = new Date();
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {user.name} 👋</h1>
        <p className="text-gray-400 mt-1">Keep up the great work!</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Workouts" value={workouts.length} />
        <StatCard label="This Week" value={thisWeek} />
        <StatCard label="Exercises Logged" value={workouts.reduce((a, w) => a + w.exercises.length, 0)} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Workouts</h2>
        <Link to="/log" className="btn-primary text-sm py-1.5 px-4">+ Log Workout</Link>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading...</div>
      ) : workouts.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">🏋️</div>
          <p className="text-gray-400">No workouts yet. <Link to="/log" className="text-primary-500 hover:underline">Log your first one!</Link></p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.slice(0, 5).map((w) => (
            <WorkoutRow key={w.id} workout={w} onDelete={handleDelete} />
          ))}
          {workouts.length > 5 && (
            <Link to="/history" className="block text-center text-primary-500 hover:underline text-sm mt-2">
              View all {workouts.length} workouts →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
