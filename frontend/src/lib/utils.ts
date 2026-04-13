import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateDietPlan(clientData: any) {
  const weight = Number(clientData.weight) || 0;
  const height = Number(clientData.height) || 0;
  const bmi = height > 0 ? Number((weight / ((height / 100) ** 2)).toFixed(1)) : 0;
  const goal = bmi >= 25 ? 'Weight Loss' : bmi < 18.5 ? 'Weight Gain' : 'Maintenance';
  const calories = goal === 'Weight Loss' ? 1800 : goal === 'Weight Gain' ? 2400 : 2100;
  const style = goal === 'Weight Loss' ? 'balanced with lower carbs' : goal === 'Weight Gain' ? 'higher protein and healthy carbs' : 'well-rounded macros';
  const medicalNote = clientData.medical_condition ? ` Since you have ${clientData.medical_condition}, focus on gentle, nourishing foods and avoid any known triggers.` : '';
  const planNote = clientData.plan === 'Yearly' ? 'Your program looks long-term, so stay consistent and adjust portion sizes as you progress.' : 'This membership is a great time to build healthy daily habits.';

  return `Personalized Diet Plan (${goal}):\n\n- Target calories: ${calories} kcal/day\n- Focus: ${style}\n- Breakfast: Oatmeal or porridge with fruit, nuts, and a source of protein.\n- Snack: Greek yogurt or a small fruit with nuts.\n- Lunch: Lean protein, whole grains, and vegetables.\n- Snack: Veggie sticks or a protein smoothie.\n- Dinner: Light protein, greens, and complex carbs.\n- Hydration: Drink 2-3 liters of water daily.\n- Notes:${medicalNote} ${planNote}\n\nRecommended weekly pattern:\n- 3 strength/cardio workouts\n- 2 active recovery days\n- 1 complete rest day\n\nKeep a food journal and adjust based on how your body feels.`;
}

export function generateWorkoutPlan(clientData: any) {
  const weight = Number(clientData.weight) || 0;
  const height = Number(clientData.height) || 0;
  const bmi = height > 0 ? Number((weight / ((height / 100) ** 2)).toFixed(1)) : 0;
  const goal = bmi >= 25 ? 'Fat Loss' : bmi < 18.5 ? 'Muscle Gain' : 'Strength & Tone';
  const plan = clientData.plan || 'Monthly';
  const programLength = plan === 'Yearly' ? '12 months' : plan === 'Half-Yearly' ? '6 months' : plan === 'Quarterly' ? '3 months' : '1 month';
  const focus = plan === 'Yearly'
    ? 'progressive overload with recovery and strength cycles'
    : plan === 'Half-Yearly'
      ? 'balanced strength, cardio, and mobility for long-term progress'
      : plan === 'Quarterly'
        ? 'consistent strength and conditioning with habit-building focus'
        : 'foundational strength, mobility, and cardio to build momentum';
  const planNote = plan === 'Yearly'
    ? 'This long-term plan gives you room to build strength, add volume safely, and recover well.'
    : plan === 'Half-Yearly'
      ? 'A strong mid-term plan focused on steady progress and recovery balance.'
      : plan === 'Quarterly'
        ? 'A solid 3-month push with clear progress milestones.'
        : 'A concise 1-month focus to establish routine and consistency.';

  return `Personalized Workout Plan (${goal}):\n\n- Program duration: ${programLength}\n- Training focus: ${focus}\n- Goal guidance: Build full-body strength, improve endurance, and support healthy movement patterns.\n\nWeekly Schedule:\n- Monday: Upper body strength (push/pull compound lifts + core).\n- Tuesday: Conditioning & mobility (steady cardio, dynamic stretches, and light core work).\n- Wednesday: Lower body strength (squats, deadlifts, lunges, glute-focused work).\n- Thursday: Active recovery (yoga flow, mobility, light walk or cycling).\n- Friday: Full-body strength circuit (compound lifts, core stabilization, and power work).\n- Saturday: Cardio or stamina session (intervals, hill walk, or low-impact conditioning).\n- Sunday: Rest & recovery (stretching, foam rolling, hydration).\n\nTraining Notes: ${planNote}\n- Start with moderate loads and increase intensity every 1-2 weeks.\n- Focus on form before adding weight.\n- Keep rest between sets to 60-90 seconds for strength days.\n\nProgression Tips:\n- Track weights, reps, and recovery each week.\n- Add 1-2 strength sessions to your routine if you feel ready.\n- Prioritize sleep, hydration, and protein intake to support recovery.`;
}
