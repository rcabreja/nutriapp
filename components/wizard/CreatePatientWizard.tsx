import React, { useState } from 'react';
import { useNutri } from '../../context';
import { useNavigate } from 'react-router-dom';
import { Patient, Lifestyle, LabResult } from '../../types';
import { X, ChevronRight, ChevronLeft, Save, Check } from 'lucide-react';

// Steps
import StepBasicInfo from './steps/StepBasicInfo';
import StepClinical from './steps/StepClinical';
import StepLifestyle from './steps/StepLifestyle';
import StepAnthropometry from './steps/StepAnthropometry';
import StepLabs from './steps/StepLabs';
import StepEvolution from './steps/StepEvolution';

interface Props {
    onClose: () => void;
}

const STEPS = [
    { id: 'basic', label: 'Datos Básicos' },
    { id: 'clinical', label: 'Historia Clínica' },
    { id: 'lifestyle', label: 'Estilo de Vida' },
    { id: 'anthro', label: 'Antropometría' },
    { id: 'labs', label: 'Analíticas' },
    { id: 'evolution', label: 'Notas Evolución' },
];

export default function CreatePatientWizard({ onClose }: Props) {
    const { addPatient } = useNutri();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);

    const [formData, setFormData] = useState({
        // Personal
        name: '', dob: '', gender: 'F', maritalStatus: '', occupation: '', address: '', phone: '', email: '', motive: '',

        // Clinical - Pathological
        diabetes: false, cancer: false, dislipidemia: false, anemia: false, hypertension: false, renal: false, others: '', allergies: '',

        // Clinical - Symptoms (New)
        symptoms: [] as string[],

        // Clinical - General
        medications: '', familyHistory: '',

        // Clinical - Gyneco
        g: '', p: '', c: '', a: '', fum: '', contraception: '',
        menarche: '', cycleDuration: '', cycleRegularity: '',

        // Clinical - Habits & Recall
        dietType: '', cookingHabits: '', eatingCompany: '', coffeeConsumption: '', eatingOutFrequency: '', processedFoodFrequency: '', favoriteRecipes: '',
        recallBreakfast: '', recallSnackAM: '', recallLunch: '', recallSnackPM: '', recallDinner: '',

        // Clinical - Frequency Grid (New)
        foodFrequencies: {} as Record<string, string>,

        // Nutrition Habits (New Image 4 fields if not covered)
        waterConsumption: '', numMeals: '', mealTimes: '',

        // Lifestyle
        exercise: false, exerciseType: '', exerciseFrequency: '', exerciseDuration: '', exerciseDetails: '', sittingHours: '',
        wakeUpTime: '', bedTime: '', sleepHours: '', energyLevel: '', stress: '',

        // Lifestyle - New Fields from Image 1
        dailyStress: '', // Nivel estres diario
        mealSchedules: '', // Horarios comida
        weightLossMeds: '', // Medicamentos peso
        otherHealthCare: '', // Cuidas salud de otra manera

        alcohol: false, alcoholType: '', alcoholFrequency: '',
        tobacco: false, tobaccoType: '', tobaccoFrequency: '',
        water: '', bowel: '', dailyRoutine: '',
        mealsPerDay: '', eatingOut: '',
        supplementation: '', foodIntolerances: '', foodAllergies: '', likes: '', dislikes: '',
        preferences: '', aversiones: '', budget: 'Medio', access: '', eatingOutStat: '', // Preferences & Economy

        // Anthropometry (Object)
        anthropometry: {
            weight: 0, height: 0, imc: 0,
            circumference: { waist: 0, hip: 0, abdomen: 0, chest: 0, armR: 0, armL: 0, thigh: 0, calf: 0 },
            folds: { tricipital: 0, bicipital: 0, subscapular: 0, suprailiac: 0, abdominal: 0, quadriceps: 0 },
            activity: 1.2, bmr: 0, tdee: 0,
            notes: ''
        },

        // Labs (Initial Object)
        initialLab: {
            date: new Date().toISOString().slice(0, 16),
            name: '',
            glucose: '', cholesterol: '', triglycerides: '', hemoglobin: '', hematocrit: ''
        },

        // Evolution Notes (New)
        evolutionDate: new Date().toISOString().slice(0, 16),
        evolutionNextAppt: '',
        evolutionObjective: 'Primera visita - Ingreso',
        evolutionObservations: '',
        evolution: {
            feelingWithPlan: '',
            hungerOrAnxiety: '',
            inflammation: '',
            constipation: '',
            stress: '',
            adherence: '',
            sleep: '',
            water: '',
            eatingOut: '',
            exercise: '',
            modifications: '',
            management: '',
        }
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(curr => curr + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(curr => curr - 1);
        }
    };

    const handleSave = () => {
        // Validation
        if (!formData.name) {
            alert("El nombre es obligatorio");
            return;
        }

        const newId = Date.now().toString();

        // Construct Patient Object
        const newPatient: Patient = {
            id: newId,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            dob: formData.dob,
            gender: formData.gender as 'M' | 'F',
            occupation: formData.occupation,
            maritalStatus: formData.maritalStatus,
            address: formData.address,
            avatarUrl: '',
            notes: [],
            anthropometry: [], // Will add initial if exists
            plans: [],
            adherence: [],
            labs: [], // Will add initial if exists

            lifestyle: {
                activity: {
                    regular: formData.exercise,
                    details: formData.exerciseDetails,
                    type: formData.exerciseType,
                    frequency: formData.exerciseFrequency,
                    duration: formData.exerciseDuration
                },
                sleep: { hours: formData.sleepHours, stress: formData.stress },
                stressLevel: formData.dailyStress, // Mapped
                diet: {
                    meals: formData.mealSchedules, // Mapped to mealSchedules
                    water: formData.water,
                    alcohol: formData.alcohol,
                    alcoholType: formData.alcoholType,
                    alcoholFrequency: formData.alcoholFrequency,
                    tobacco: formData.tobacco,
                    tobaccoType: formData.tobaccoType,
                    tobaccoFrequency: formData.tobaccoFrequency
                },
                bowelMovement: formData.bowel,
                foodAllergies: formData.foodAllergies ? formData.foodAllergies.split(',').map((s: string) => s.trim()) : [],
                foodIntolerances: formData.foodIntolerances ? formData.foodIntolerances.split(',').map((s: string) => s.trim()) : [],
                supplementation: formData.supplementation,
                weightLossMeds: formData.weightLossMeds,
                otherHealthCare: formData.otherHealthCare,
                dailyRoutine: formData.dailyRoutine,
                sittingHours: formData.sittingHours,
                wakeUpTime: formData.wakeUpTime,
                bedTime: formData.bedTime,
                energyLevel: formData.energyLevel as any,

                preferences: {
                    likes: formData.likes,
                    dislikes: formData.dislikes, // or aversiones
                    budget: formData.budget,
                    access: formData.access,
                    eatingOut: formData.eatingOutStat
                },
                nutritionalHabits: {
                    dietType: formData.dietType,
                    mealsPerDay: formData.numMeals,
                    cookingHabits: formData.cookingHabits,
                    eatingCompany: formData.eatingCompany,
                    coffeeConsumption: formData.coffeeConsumption,
                    eatingOutFrequency: formData.eatingOutFrequency, // Or eatingOutStat?
                    processedFoodFrequency: formData.processedFoodFrequency,
                    favoriteRecipes: formData.favoriteRecipes,
                    waterConsumption: formData.waterConsumption,
                    mealTimes: formData.mealTimes
                }
            },

            clinical: {
                background: {
                    motive: formData.motive,
                    medications: formData.medications,
                    familyHistory: formData.familyHistory,
                    pathological: {
                        diabetes: formData.diabetes,
                        cancer: formData.cancer,
                        dislipidemia: formData.dislipidemia,
                        anemia: formData.anemia,
                        hypertension: formData.hypertension,
                        renal: formData.renal,
                        others: formData.others,
                        allergies: formData.allergies
                    },
                    symptoms: formData.symptoms,
                    currentSymptoms: formData.currentSymptoms,
                    pathologies: formData.pathologiesDescription
                },
                gyneco: {
                    g: formData.g,
                    p: formData.p,
                    c: formData.c,
                    a: formData.a,
                    fum: formData.fum,
                    contraception: formData.contraception,
                    menarche: formData.menarche,
                    cycleDuration: formData.cycleDuration,
                    cycleRegularity: formData.cycleRegularity as any
                },
                recall24h: {
                    breakfast: formData.recallBreakfast,
                    snackAM: formData.recallSnackAM,
                    lunch: formData.recallLunch,
                    snackPM: formData.recallSnackPM,
                    dinner: formData.recallDinner
                },
                frequencies: formData.foodFrequencies
            }
        };

        // Add Initial Anthropometry if weight/height are set
        if (Number(formData.anthropometry.weight) > 0 || Number(formData.anthropometry.height) > 0) {
            newPatient.anthropometry.push({
                ...formData.anthropometry,
                weight: Number(formData.anthropometry.weight) || 0,
                height: Number(formData.anthropometry.height) || 0,
                imc: Number(formData.anthropometry.imc) || 0,
                activity: Number(formData.anthropometry.activity) || 1.2,
                bmr: Number(formData.anthropometry.bmr) || 0,
                tdee: Number(formData.anthropometry.tdee) || 0,
                id: Date.now().toString(),
                date: new Date().toISOString(),
                notes: formData.anthropometry.notes || 'Medida Inicial'
            });
        }

        // Add Initial Lab if name or glucose set
        // Ensure values are strings for LabResult markers
        if (formData.initialLab.name || formData.initialLab.glucose) {
            const labCtx = formData.initialLab;
            const markers = [
                { name: 'Glucosa', value: String(labCtx.glucose || ''), unit: 'mg/dL' },
                { name: 'Colesterol', value: String(labCtx.cholesterol || ''), unit: 'mg/dL' },
                { name: 'Triglicéridos', value: String(labCtx.triglycerides || ''), unit: 'mg/dL' },
                { name: 'Hemoglobina', value: String(labCtx.hemoglobin || ''), unit: 'g/dL' },
                { name: 'Hematocrito', value: String(labCtx.hematocrit || ''), unit: '%' },
            ].filter(m => m.value && m.value !== '');

            if (markers.length > 0 || labCtx.name) {
                newPatient.labs.push({
                    id: Date.now().toString(),
                    name: labCtx.name || 'Análisis Inicial',
                    date: labCtx.date || new Date().toISOString(),
                    markers,
                    attachments: []
                });
            }
        }

        // Add Initial Evolution Note
        if (formData.evolutionObjective || formData.evolutionObservations) {
            newPatient.notes.push({
                id: Date.now().toString(),
                date: formData.evolutionDate || new Date().toISOString().slice(0, 16),
                objective: formData.evolutionObjective,
                observations: formData.evolutionObservations,
                nextAppointment: formData.evolutionNextAppt,
                evolution: formData.evolution,
                images: []
            });
        }

        addPatient(newPatient);
        onClose();
        navigate(`/patients/${newId}`);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--card-bg)] border border-slate-700 rounded-xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-[var(--primary)] p-4 flex justify-between items-center shrink-0 rounded-t-xl">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">Nuevo Paciente</h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Steps Indicator */}
                <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0 overflow-x-auto">
                    <div className="flex items-center justify-between min-w-[600px] max-w-4xl mx-auto">
                        {STEPS.map((step, idx) => (
                            <div key={step.id} className="flex flex-col items-center relative z-10">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${idx === currentStep
                                        ? 'bg-[var(--primary)] border-[var(--primary)] text-white scale-110 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                        : idx < currentStep
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : 'bg-slate-800 border-slate-600 text-slate-500'
                                        }`}
                                >
                                    {idx < currentStep ? <Check size={20} /> : idx + 1}
                                </div>
                                <span className={`text-xs mt-2 font-medium ${idx === currentStep ? 'text-white' : 'text-slate-500'}`}>
                                    {step.label}
                                </span>
                                {/* Line connector */}
                                {idx < STEPS.length - 1 && (
                                    <div className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 ${idx < currentStep ? 'bg-green-500' : 'bg-slate-700'} w-[calc(100%_-_2.5rem)] translate-x-[1.25rem]`} style={{ width: 'calc(100% + 4rem)', left: '50%', transform: 'translateX(0)' }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[var(--card-bg)]">
                    <div className="max-w-4xl mx-auto">
                        {currentStep === 0 && <StepBasicInfo formData={formData} onChange={handleChange} />}
                        {currentStep === 1 && <StepClinical formData={formData} onChange={handleChange} />}
                        {currentStep === 2 && <StepLifestyle formData={formData} onChange={handleChange} />}
                        {currentStep === 3 && <StepAnthropometry formData={formData} onChange={handleChange} gender={formData.gender as 'M' | 'F'} dob={formData.dob} />}
                        {currentStep === 4 && <StepLabs formData={formData} onChange={handleChange} />}
                        {currentStep === 5 && <StepEvolution formData={formData} onChange={handleChange} />}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 shrink-0 rounded-b-xl flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${currentStep === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <ChevronLeft size={20} /> Anterior
                    </button>

                    {currentStep < STEPS.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="bg-[var(--primary)] hover:opacity-90 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                        >
                            Siguiente <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-green-900/20 transition-all active:scale-95"
                        >
                            <Save size={20} /> Guardar Paciente
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
