import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, TrendingUp, CheckCircle } from 'lucide-react';
import { Exercise, WorkoutEntry, WorkoutSet } from '../App';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Card } from './ui/card';

interface WorkoutLoggerProps {
  exercise: Exercise;
  workoutHistory: WorkoutEntry[];
  onComplete: (sets: WorkoutSet[]) => void;
  onBack: () => void;
}

export function WorkoutLogger({ exercise, workoutHistory, onComplete, onBack }: WorkoutLoggerProps) {
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [currentWeight, setCurrentWeight] = useState(20);
  const [currentReps, setCurrentReps] = useState(10);

  // Get last workout for this exercise
  const lastWorkout = workoutHistory.find(
    (entry) => entry.exerciseId === exercise.id
  );

  // Calculate suggested progression
  const getSuggestion = () => {
    if (!lastWorkout || lastWorkout.sets.length === 0) {
      return { weight: 20, reps: 10, message: 'Start with a comfortable weight' };
    }

    const lastSet = lastWorkout.sets[0];
    
    // Progressive overload logic
    if (lastSet.reps >= 12) {
      return {
        weight: lastSet.weight + 2.5,
        reps: 8,
        message: 'Increase weight, reduce reps'
      };
    } else if (lastSet.reps >= 10) {
      return {
        weight: lastSet.weight + 2.5,
        reps: lastSet.reps,
        message: 'Time to increase weight!'
      };
    } else {
      return {
        weight: lastSet.weight,
        reps: lastSet.reps + 1,
        message: 'Add one more rep'
      };
    }
  };

  const suggestion = getSuggestion();

  const handleAddSet = () => {
    const newSet: WorkoutSet = {
      weight: currentWeight,
      reps: currentReps,
      date: new Date().toISOString(),
    };
    setSets([...sets, newSet]);
  };

  const handleRemoveSet = (index: number) => {
    setSets(sets.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    if (sets.length === 0) {
      alert('Add at least one set before completing');
      return;
    }
    onComplete(sets);
  };

  const handleUseSuggestion = () => {
    setCurrentWeight(suggestion.weight);
    setCurrentReps(suggestion.reps);
  };

  return (
    <div className="min-h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4 -ml-1"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        <h2 className="text-slate-900 dark:text-white mb-1">{exercise.name}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{exercise.equipment}</p>
        
        {/* Exercise Description */}
        {exercise.description && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {exercise.description}
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* AI Suggestion Card */}
        {lastWorkout && (
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-900 p-4">
            <div className="flex items-start gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-900 dark:text-white mb-1">Suggested Progression</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{suggestion.message}</p>
                <div className="flex items-center gap-4 mb-3">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Weight</p>
                    <p className="text-slate-900 dark:text-white">{suggestion.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Reps</p>
                    <p className="text-slate-900 dark:text-white">{suggestion.reps}</p>
                  </div>
                </div>
                <button
                  onClick={handleUseSuggestion}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Use suggestion →
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Last Workout */}
        {lastWorkout && (
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Last workout</p>
            <div className="flex flex-wrap gap-2">
              {lastWorkout.sets.map((set, index) => (
                <span key={index} className="text-sm bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  {set.weight}kg × {set.reps}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Weight Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-slate-700 dark:text-slate-300">Weight (kg)</label>
            <span className="text-slate-900 dark:text-white px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg min-w-[60px] text-center">
              {currentWeight}
            </span>
          </div>
          <Slider
            value={[currentWeight]}
            onValueChange={(value) => setCurrentWeight(value[0])}
            min={2.5}
            max={200}
            step={2.5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400 dark:text-slate-600">
            <span>2.5 kg</span>
            <span>200 kg</span>
          </div>
        </div>

        {/* Reps Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-slate-700 dark:text-slate-300">Reps</label>
            <span className="text-slate-900 dark:text-white px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg min-w-[60px] text-center">
              {currentReps}
            </span>
          </div>
          <Slider
            value={[currentReps]}
            onValueChange={(value) => setCurrentReps(value[0])}
            min={1}
            max={30}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400 dark:text-slate-600">
            <span>1</span>
            <span>30</span>
          </div>
        </div>

        {/* Add Set Button */}
        <Button
          onClick={handleAddSet}
          className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          Add Set
        </Button>

        {/* Current Sets */}
        {sets.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-slate-700 dark:text-slate-300">Sets ({sets.length})</h3>
            <div className="space-y-2">
              {sets.map((set, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl p-4"
                >
                  <div>
                    <span className="text-slate-900 dark:text-white">
                      Set {index + 1}: {set.weight}kg × {set.reps} reps
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveSet(index)}
                    className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Complete Button */}
      {sets.length > 0 && (
        <div className="sticky bottom-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-4">
          <Button
            onClick={handleComplete}
            className="w-full gap-2 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <CheckCircle className="w-5 h-5" />
            Complete Workout
          </Button>
        </div>
      )}
    </div>
  );
}