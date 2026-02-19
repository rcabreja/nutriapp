export type Role = 'admin' | 'patient';

export interface User {
  id: string;
  email: string;
  password?: string; // stored plainly for demo purposes
  name: string;
  role: Role;
  patientId?: string; // Link user to patient profile if role is patient
}

export interface Note {
  id: string;
  date: string;
  objective: string;
  observations: string;
  images?: string[];
  nextAppointment?: string; // New field for next appointment date

  // New Evolution Fields
  evolution?: {
    feelingWithPlan: string;
    hungerOrAnxiety: string;
    inflammation: string;
    constipation: string;
    stress: string;
    adherence: string;
    sleep: string;
    water: string;
    eatingOut: string;
    exercise: string;
    modifications: string;
    management: string;
  };
}

export interface Lifestyle {
  activity: {
    regular: boolean;
    details: string;
    // New fields
    type?: string;
    frequency?: string;
    duration?: string;
  };
  sleep: {
    hours: string;
    stress: string; // General stress
  };
  stressLevel?: string; // Daily stress level
  diet: {
    meals: string;
    water: string;
    alcohol: boolean;
    tobacco: boolean;
  };
  bowelMovement?: string;
  foodAllergies?: string[]; // Changed to array
  foodIntolerances?: string[]; // Changed to array

  // New Lifestyle Fields
  supplementation?: string;
  weightLossMeds?: string;
  toxicSubstances?: string; // Drugs etc.
  dailyRoutine?: string;
  sittingHours?: string;
  wakeUpTime?: string;
  bedTime?: string;
  energyLevel?: 'Cansado' | 'Activo' | 'Variable';
  otherHealthCare?: string;

  preferences: {
    likes: string;
    dislikes: string;
    budget: 'Bajo' | 'Medio' | 'Alto';
    access: string;
    eatingOut: string;
  };
}

export interface Anthropometry {
  id: string;
  date: string;
  weight: number;
  height: number;
  imc: number;
  circumference: {
    waist: number;
    hip: number;
    abdomen: number;
    chest: number;
    armR: number;
    armL: number;
    thigh: number;
    calf: number;
  };
  folds: {
    tricipital: number;
    bicipital: number;
    subscapular: number;
    suprailiac: number;
    abdominal: number;
    quadriceps: number;
  };
  activity?: number; // Activity factor used
  bmr?: number; // Basal Metabolic Rate
  tdee?: number; // Total Daily Energy Expenditure
  notes: string;
}

export interface ClinicalHistory {
  background: {
    motive: string;
    medications: string;
    familyHistory: string;
    pathological?: {
      diabetes: boolean;
      cancer: boolean;
      dislipidemia: boolean;
      anemia: boolean;
      hypertension: boolean;
      renal: boolean;
      others: string;
      allergies: string;
    };
    symptoms?: string[]; // List of symptoms
  };
  gyneco?: {
    g: string;
    p: string;
    c: string;
    a: string;
    fum: string;
    contraception: string;
    // New fields
    menarche?: string;
    cycleDuration?: string;
    cycleRegularity?: 'Regular' | 'Irregular';
  };
  recall24h: {
    breakfast: string;
    snackAM: string;
    lunch: string;
    snackPM: string;
    dinner: string;
  };
  // New Nutritional Habits Section
  nutritionalHabits?: {
    dietType?: string;
    mealsPerDay?: string;
    cookingHabits?: string; // Do you cook or someone else?
    mealTimes?: string;
    eatingCompany?: string; // Alone, accompanied, with distractors?
    favoriteRecipes?: string;
    waterConsumption?: string;
    coffeeConsumption?: string;
    eatingOutFrequency?: string;
    processedFoodFrequency?: string;
  };
  frequencies: Record<string, string>;
}

export interface Meal {
  id: string;
  name: string; // e.g., Option 1
  description: string;
}

export interface MealSection {
  title: string; // Desayuno, Almuerzo...
  options: Meal[];
}

export interface Plan {
  id: string;
  name: string;
  kcalTarget: number;
  active: boolean;
  sections: MealSection[];
  supplements: string;
  avoid: string;
  macronutrients?: {
    protein: number;
    carbs: number;
    fats: number;
  };
  createdAt: string;
}

export interface Adherence {
  date: string; // YYYY-MM-DD
  completed: number; // Count of checked items
  total: number; // Total items tracked
  checks?: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    supplements: boolean;
  };
}

export interface LabResult {
  id: string;
  name: string;
  date: string;
  attachments?: string[]; // Array of image URLs
  markers: {
    name: string;
    value: string;
    unit?: string;
    flag?: 'high' | 'low' | 'normal';
  }[];
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string; // Date of birth
  gender: 'M' | 'F';
  occupation: string;

  maritalStatus?: string;
  address?: string;

  avatarUrl?: string;
  notes: Note[];
  lifestyle: Lifestyle;
  anthropometry: Anthropometry[];
  clinical: ClinicalHistory;
  plans: Plan[];
  adherence: Adherence[];
  labs: LabResult[];
}

export interface ThemeConfig {
  appBg: string;
  cardBg: string;
  textColor: string;
  primaryColor: string;
  fontFamily: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  patients: Patient[];
  theme: ThemeConfig;
}