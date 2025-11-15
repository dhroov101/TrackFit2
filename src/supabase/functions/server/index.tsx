import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Sign up route
app.post('/make-server-24683dd3/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Add custom exercise
app.post('/make-server-24683dd3/exercises/custom', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const exercise = await c.req.json();
    
    // Store custom exercise with user ID as part of the key
    const key = `custom_exercise:${user.id}:${exercise.id}`;
    await kv.set(key, exercise);

    return c.json({ success: true, exercise });
  } catch (error) {
    console.error('Error adding custom exercise:', error);
    return c.json({ error: 'Failed to add custom exercise' }, 500);
  }
});

// Get custom exercises for user
app.get('/make-server-24683dd3/exercises/custom', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const prefix = `custom_exercise:${user.id}:`;
    const customExercises = await kv.getByPrefix(prefix);

    return c.json({ exercises: customExercises || [] });
  } catch (error) {
    console.error('Error fetching custom exercises:', error);
    return c.json({ error: 'Failed to fetch custom exercises' }, 500);
  }
});

// Save workout data
app.post('/make-server-24683dd3/workouts', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const workout = await c.req.json();
    
    // Get existing workouts
    const workoutsKey = `workouts:${user.id}`;
    const existingWorkouts = await kv.get(workoutsKey) || [];
    
    // Add new workout
    const updatedWorkouts = [workout, ...existingWorkouts];
    
    // Keep only last 1000 workouts to avoid storage issues
    if (updatedWorkouts.length > 1000) {
      updatedWorkouts.splice(1000);
    }
    
    await kv.set(workoutsKey, updatedWorkouts);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving workout:', error);
    return c.json({ error: 'Failed to save workout' }, 500);
  }
});

// Get workout history
app.get('/make-server-24683dd3/workouts', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const workoutsKey = `workouts:${user.id}`;
    const workouts = await kv.get(workoutsKey) || [];

    return c.json({ workouts });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return c.json({ error: 'Failed to fetch workouts' }, 500);
  }
});

// Clear workout history
app.delete('/make-server-24683dd3/workouts', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const workoutsKey = `workouts:${user.id}`;
    await kv.set(workoutsKey, []);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error clearing workouts:', error);
    return c.json({ error: 'Failed to clear workouts' }, 500);
  }
});

Deno.serve(app.fetch);
