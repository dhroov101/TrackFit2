import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Exercise } from '../App';

interface AddExerciseDialogProps {
  onAdd: (exercise: Exercise) => void;
}

const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];

export function AddExerciseDialog({ onAdd }: AddExerciseDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [equipment, setEquipment] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newExercise: Exercise = {
      id: `custom-${Date.now()}`,
      name,
      muscleGroup,
      equipment,
      description,
    };

    onAdd(newExercise);
    
    // Reset form
    setName('');
    setMuscleGroup('');
    setEquipment('');
    setDescription('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Custom Exercise
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Exercise</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300 mb-2 block">
              Exercise Name
            </label>
            <Input
              type="text"
              placeholder="e.g., Cable Twist"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300 mb-2 block">
              Muscle Group
            </label>
            <Select value={muscleGroup} onValueChange={setMuscleGroup} required>
              <SelectTrigger>
                <SelectValue placeholder="Select muscle group" />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300 mb-2 block">
              Equipment
            </label>
            <Input
              type="text"
              placeholder="e.g., Cable, Dumbbell, Bodyweight"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-700 dark:text-slate-300 mb-2 block">
              Description (Optional)
            </label>
            <Textarea
              placeholder="How to perform this exercise..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">
            Add Exercise
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
