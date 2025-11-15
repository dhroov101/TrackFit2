import { useState } from 'react';
import { WorkoutEntry } from '../App';
import { TrendingUp, Calendar, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ProgressViewProps {
  workoutHistory: WorkoutEntry[];
}

export function ProgressView({ workoutHistory }: ProgressViewProps) {
  // Get unique exercises
  const uniqueExercises = Array.from(
    new Set(workoutHistory.map((entry) => entry.exerciseId))
  ).map((id) => {
    const entry = workoutHistory.find((e) => e.exerciseId === id);
    return {
      id: id,
      name: entry?.exerciseName || '',
    };
  });

  const [selectedExercise, setSelectedExercise] = useState<string>(
    uniqueExercises[0]?.id || ''
  );

  if (workoutHistory.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No progress data yet</p>
          <p className="text-slate-400 dark:text-slate-600 text-sm mt-1">
            Complete workouts to see your progress
          </p>
        </div>
      </div>
    );
  }

  // Filter workouts by selected exercise
  const exerciseWorkouts = workoutHistory
    .filter((entry) => entry.exerciseId === selectedExercise)
    .reverse(); // oldest first

  // Prepare chart data
  const chartData = exerciseWorkouts.map((entry, index) => {
    const maxWeight = Math.max(...entry.sets.map((set) => set.weight));
    const avgReps = entry.sets.reduce((sum, set) => sum + set.reps, 0) / entry.sets.length;
    const totalVolume = entry.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
    
    return {
      workout: index + 1,
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      maxWeight: maxWeight,
      avgReps: Math.round(avgReps),
      volume: totalVolume,
    };
  });

  // Calculate stats
  const totalWorkouts = exerciseWorkouts.length;
  const latestWorkout = exerciseWorkouts[exerciseWorkouts.length - 1];
  const firstWorkout = exerciseWorkouts[0];
  
  const currentMax = latestWorkout ? Math.max(...latestWorkout.sets.map((set) => set.weight)) : 0;
  const startingMax = firstWorkout ? Math.max(...firstWorkout.sets.map((set) => set.weight)) : 0;
  const improvement = currentMax - startingMax;
  const improvementPercent = startingMax > 0 ? ((improvement / startingMax) * 100).toFixed(1) : '0';

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-slate-900 dark:text-white">Progress Tracking</h2>
      </div>

      {/* Exercise Selector */}
      {uniqueExercises.length > 0 && (
        <Select value={selectedExercise} onValueChange={setSelectedExercise}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select exercise" />
          </SelectTrigger>
          <SelectContent>
            {uniqueExercises.map((exercise) => (
              <SelectItem key={exercise.id} value={exercise.id}>
                {exercise.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-900">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Max Weight</p>
          <p className="text-slate-900 dark:text-white">{currentMax} kg</p>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-purple-200 dark:border-purple-900">
          <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Workouts</p>
          <p className="text-slate-900 dark:text-white">{totalWorkouts}</p>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-green-200 dark:border-green-900">
          <Award className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Gain</p>
          <p className="text-slate-900 dark:text-white">+{improvementPercent}%</p>
        </Card>
      </div>

      {/* Weight Progress Chart */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <h3 className="text-slate-900 dark:text-white mb-4">Max Weight Progress</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              stroke="#94a3b8"
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              stroke="#94a3b8"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="maxWeight" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              name="Max Weight (kg)"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Volume Chart */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <h3 className="text-slate-900 dark:text-white mb-4">Total Volume Progress</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              stroke="#94a3b8"
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              stroke="#94a3b8"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="volume" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', r: 4 }}
              name="Volume (kg)"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Workout Details */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <h3 className="text-slate-900 dark:text-white mb-3">Recent Sessions</h3>
        <div className="space-y-3">
          {exerciseWorkouts.slice(-5).reverse().map((entry, index) => {
            const maxWeight = Math.max(...entry.sets.map((set) => set.weight));
            const totalVolume = entry.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
            
            return (
              <div key={index} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(entry.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <div className="flex gap-3 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Max: {maxWeight}kg</span>
                    <span className="text-slate-600 dark:text-slate-300">Vol: {totalVolume}kg</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.sets.map((set, setIndex) => (
                    <span key={setIndex} className="text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      {set.weight}kg × {set.reps}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}