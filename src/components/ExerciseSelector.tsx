import { ArrowLeft, Search, Info } from 'lucide-react';
import { useState } from 'react';
import { Exercise } from '../App';
import { exerciseDatabase } from '../data/exercises';
import { Input } from './ui/input';
import { AddExerciseDialog } from './AddExerciseDialog';

interface ExerciseSelectorProps {
  muscleGroup: string;
  onSelect: (exercise: Exercise) => void;
  onBack: () => void;
  onAddCustomExercise: (exercise: Exercise) => void;
  customExercises: Exercise[];
}

export function ExerciseSelector({ muscleGroup, onSelect, onBack, onAddCustomExercise, customExercises }: ExerciseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  
  // Combine built-in and custom exercises
  const builtInExercises = exerciseDatabase.filter(
    (ex) => ex.muscleGroup === muscleGroup
  );
  
  const customMuscleExercises = customExercises.filter(
    (ex) => ex.muscleGroup === muscleGroup
  );
  
  const allExercises = [...builtInExercises, ...customMuscleExercises];

  const filteredExercises = allExercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 z-10">
        <div className="p-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4 -ml-1"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-slate-900 dark:text-white mb-1">{muscleGroup} Exercises</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {filteredExercises.length} exercises available
              </p>
            </div>
            <AddExerciseDialog onAdd={onAddCustomExercise} />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="p-4 space-y-2">
        {filteredExercises.map((exercise) => (
          <div key={exercise.id} className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <button
                onClick={() => onSelect(exercise)}
                className="flex-1 text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-slate-900 dark:text-white mb-1">{exercise.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{exercise.equipment}</p>
                  </div>
                </div>
              </button>
              {exercise.description && (
                <button
                  onClick={() => setExpandedExercise(expandedExercise === exercise.id ? null : exercise.id)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Show description"
                >
                  <Info className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
            
            {/* Description */}
            {expandedExercise === exercise.id && exercise.description && (
              <div className="px-4 pb-4 pt-0 border-t border-slate-200 dark:border-slate-800 mt-2">
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-3">
                  {exercise.description}
                </p>
              </div>
            )}
          </div>
        ))}
        
        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No exercises found</p>
          </div>
        )}
      </div>
    </div>
  );
}