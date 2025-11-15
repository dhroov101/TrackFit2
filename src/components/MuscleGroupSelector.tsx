import { 
  Dumbbell, 
  Armchair, 
  Heart, 
  Activity,
  CircleDot,
  Move,
  Zap,
  Target
} from 'lucide-react';

interface MuscleGroupSelectorProps {
  onSelect: (group: string) => void;
}

const muscleGroups = [
  { name: 'Chest', icon: Heart, color: 'from-red-500 to-pink-500' },
  { name: 'Back', icon: Move, color: 'from-blue-500 to-cyan-500' },
  { name: 'Shoulders', icon: Target, color: 'from-orange-500 to-yellow-500' },
  { name: 'Arms', icon: Zap, color: 'from-purple-500 to-pink-500' },
  { name: 'Legs', icon: Activity, color: 'from-green-500 to-emerald-500' },
  { name: 'Core', icon: CircleDot, color: 'from-indigo-500 to-purple-500' },
];

export function MuscleGroupSelector({ onSelect }: MuscleGroupSelectorProps) {
  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-slate-900 mb-1">Select Muscle Group</h2>
        <p className="text-sm text-slate-500">Choose which muscles you want to train</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {muscleGroups.map((group) => {
          const Icon = group.icon;
          return (
            <button
              key={group.name}
              onClick={() => onSelect(group.name)}
              className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all hover:scale-105 active:scale-95"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${group.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
              <div className="relative z-10">
                <Icon className="w-8 h-8 text-white mb-3" />
                <h3 className="text-white">{group.name}</h3>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
