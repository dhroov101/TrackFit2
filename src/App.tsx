import { useState, useEffect } from 'react';
import { MuscleGroupSelector } from './components/MuscleGroupSelector';
import { ExerciseSelector } from './components/ExerciseSelector';
import { WorkoutLogger } from './components/WorkoutLogger';
import { ProgressView } from './components/ProgressView';
import { AuthPage } from './components/AuthPage';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import { Dumbbell, TrendingUp, Calendar, Moon, Sun, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { projectId, publicAnonKey } from './utils/supabase/info.tsx';
import { createClient } from '@supabase/supabase-js';

export interface WorkoutSet {
  weight: number;
  reps: number;
  date: string;
}

export interface WorkoutEntry {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  sets: WorkoutSet[];
  date: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  description?: string;
}

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('User');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutEntry[]>([]);
  const [activeTab, setActiveTab] = useState<string>('workout');
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setAccessToken(session.access_token);
        setUserName(session.user?.user_metadata?.name || 'User');
        await loadUserData(session.access_token);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  // Load user data from backend
  const loadUserData = async (token: string) => {
    try {
      // Load workouts
      const workoutsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-24683dd3/workouts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (workoutsResponse.ok) {
        const data = await workoutsResponse.json();
        setWorkoutHistory(data.workouts || []);
      }

      // Load custom exercises
      const exercisesResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-24683dd3/exercises/custom`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (exercisesResponse.ok) {
        const data = await exercisesResponse.json();
        setCustomExercises(data.exercises || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleAuthSuccess = (token: string, name: string) => {
    setAccessToken(token);
    setUserName(name);
    loadUserData(token);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAccessToken(null);
    setUserName('User');
    setWorkoutHistory([]);
    setCustomExercises([]);
    setSelectedMuscleGroup(null);
    setSelectedExercise(null);
  };

  const handleMuscleGroupSelect = (group: string) => {
    setSelectedMuscleGroup(group);
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const handleBackToMuscleGroups = () => {
    setSelectedMuscleGroup(null);
    setSelectedExercise(null);
  };

  const handleBackToExercises = () => {
    setSelectedExercise(null);
  };

  const handleWorkoutComplete = async (sets: WorkoutSet[]) => {
    if (!selectedExercise) return;

    const newEntry: WorkoutEntry = {
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      muscleGroup: selectedExercise.muscleGroup,
      sets: sets,
      date: new Date().toISOString(),
    };

    // Save to backend
    if (accessToken) {
      try {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-24683dd3/workouts`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(newEntry),
          }
        );
      } catch (error) {
        console.error('Error saving workout:', error);
      }
    }

    setWorkoutHistory([newEntry, ...workoutHistory]);
    setSelectedExercise(null);
    setSelectedMuscleGroup(null);
  };

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear all workout history?')) {
      if (accessToken) {
        try {
          await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-24683dd3/workouts`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
        } catch (error) {
          console.error('Error clearing workouts:', error);
        }
      }
      setWorkoutHistory([]);
    }
  };

  const handleAddCustomExercise = async (exercise: Exercise) => {
    if (accessToken) {
      try {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-24683dd3/exercises/custom`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(exercise),
          }
        );
        setCustomExercises([...customExercises, exercise]);
      } catch (error) {
        console.error('Error adding custom exercise:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="w-12 h-12 mx-auto text-blue-600 animate-pulse mb-3" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-slate-950 shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 pb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Dumbbell className="w-8 h-8" />
              <div>
                <h1>FitTrack</h1>
                <p className="text-blue-100 text-sm">Hi, {userName}!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b dark:border-slate-800">
            <TabsTrigger value="workout" className="gap-2">
              <Dumbbell className="w-4 h-4" />
              Workout
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Calendar className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Workout Tab */}
          <TabsContent value="workout" className="m-0">
            {!selectedMuscleGroup && (
              <MuscleGroupSelector onSelect={handleMuscleGroupSelect} />
            )}
            
            {selectedMuscleGroup && !selectedExercise && (
              <ExerciseSelector 
                muscleGroup={selectedMuscleGroup}
                onSelect={handleExerciseSelect}
                onBack={handleBackToMuscleGroups}
                onAddCustomExercise={handleAddCustomExercise}
                customExercises={customExercises}
              />
            )}
            
            {selectedExercise && (
              <WorkoutLogger 
                exercise={selectedExercise}
                workoutHistory={workoutHistory}
                onComplete={handleWorkoutComplete}
                onBack={handleBackToExercises}
              />
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="m-0">
            <ProgressView workoutHistory={workoutHistory} />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="m-0 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-slate-900 dark:text-white">Recent Workouts</h2>
                {workoutHistory.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {workoutHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">No workout history yet</p>
                  <p className="text-slate-400 dark:text-slate-600 text-sm mt-1">Start logging to see your progress</p>
                </div>
              ) : (
                <WorkoutHistoryGrouped workoutHistory={workoutHistory} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Component to group workouts by date
function WorkoutHistoryGrouped({ workoutHistory }: { workoutHistory: WorkoutEntry[] }) {
  const groupedWorkouts = workoutHistory.reduce((acc, entry) => {
    const date = new Date(entry.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, WorkoutEntry[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedWorkouts).map(([date, entries]) => (
        <div key={date}>
          <h3 className="text-slate-700 dark:text-slate-300 mb-3 sticky top-0 bg-white dark:bg-slate-950 py-2">
            {date}
          </h3>
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-slate-900 dark:text-white">{entry.exerciseName}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{entry.muscleGroup}</p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-600">
                    {new Date(entry.date).toLocaleTimeString('en-US', { 
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {entry.sets.map((set, setIndex) => (
                    <span key={setIndex} className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      {set.weight}kg × {set.reps}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}