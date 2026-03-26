const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// GET all workouts for current user
router.get('/', auth, async (req, res) => {
  try {
    const workouts = await prisma.workout.findMany({
      where: { userId: req.user.id },
      include: { exercises: { include: { sets: true } } },
      orderBy: { date: 'desc' },
    });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single workout
router.get('/:id', auth, async (req, res) => {
  try {
    const workout = await prisma.workout.findFirst({
      where: { id: Number(req.params.id), userId: req.user.id },
      include: { exercises: { include: { sets: true } } },
    });
    if (!workout) return res.status(404).json({ error: 'Workout not found' });
    res.json(workout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create workout
router.post('/', auth, async (req, res) => {
  const { name, notes, date, exercises } = req.body;
  if (!name) return res.status(400).json({ error: 'Workout name required' });

  try {
    const workout = await prisma.workout.create({
      data: {
        name,
        notes,
        date: date ? new Date(date) : new Date(),
        userId: req.user.id,
        exercises: {
          create: (exercises || []).map((ex) => ({
            name: ex.name,
            sets: { create: ex.sets.map((s) => ({ reps: s.reps, weight: s.weight })) },
          })),
        },
      },
      include: { exercises: { include: { sets: true } } },
    });
    res.status(201).json(workout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE workout
router.delete('/:id', auth, async (req, res) => {
  try {
    const workout = await prisma.workout.findFirst({
      where: { id: Number(req.params.id), userId: req.user.id },
    });
    if (!workout) return res.status(404).json({ error: 'Workout not found' });

    await prisma.workout.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
