interface ClientDietData {
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  plan?: string;
  medical_condition?: string;
  payment_status?: string;
}

export function generateDietPlan(data: ClientDietData) {
  const age = Number(data.age) || 0;
  const gender = data.gender || 'Male';
  const weight = Number(data.weight) || 0;
  const height = Number(data.height) || 0;
  const plan = data.plan || 'Monthly';
  const medical = data.medical_condition || '';

  const bmi = height > 0 ? Number((weight / ((height / 100) ** 2)).toFixed(1)) : 0;
  const goal = bmi >= 25 ? 'Weight Loss' : bmi < 18.5 ? 'Weight Gain' : 'Maintenance';
  const calories = goal === 'Weight Loss' ? 1800 : goal === 'Weight Gain' ? 2400 : 2100;
  const style = goal === 'Weight Loss' ? 'balanced with lower carbs' : goal === 'Weight Gain' ? 'higher protein and healthy carbs' : 'well-rounded macros';

  const medicalNote = medical ? ` Since you have ${medical}, focus on gentle, nourishing foods and avoid any known triggers.` : '';
  const planNote = plan === 'Yearly' ? 'Your program looks long-term, so stay consistent and adjust portion sizes as you progress.' : 'This membership is a great time to build healthy daily habits.';

  return `Personalized Diet Plan (${goal}):

- Target calories: ${calories} kcal/day
- Focus: ${style}
- Breakfast: Oatmeal or porridge with fruit, nuts, and a source of protein.
- Snack: Greek yogurt or a small fruit with nuts.
- Lunch: Lean protein, whole grains, and vegetables.
- Snack: Veggie sticks or a protein smoothie.
- Dinner: Light protein, greens, and complex carbs.
- Hydration: Drink 2-3 liters of water daily.
- Notes:${medicalNote} ${planNote}

Recommended weekly pattern:
- 3 strength/cardio workouts
- 2 active recovery days
- 1 complete rest day

Keep a food journal and adjust based on how your body feels.`;
}
