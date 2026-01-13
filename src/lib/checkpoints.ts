'use client';

/**
 * Funnel Checkpoint System
 * 
 * This module manages user progress through the AuraColor funnel:
 * 1. signup/login → 2. quiz → 3. upload → 4. preview → 5. checkout → 6. result
 * 
 * Checkpoints are stored in localStorage to persist across sessions.
 */

// Checkpoint stages in order
export const FUNNEL_STAGES = {
    SIGNUP: 'signup',
    QUIZ: 'quiz',
    UPLOAD: 'upload',
    PREVIEW: 'preview',
    CHECKOUT: 'checkout',
    RESULT: 'result',
} as const;

// Stage order for validation
const STAGE_ORDER: string[] = ['signup', 'quiz', 'upload', 'preview', 'checkout', 'result'];

const CHECKPOINT_KEY = 'aurapalette_checkpoint';
const USER_DATA_KEY = 'aurapalette_user';
const QUIZ_DATA_KEY = 'aurapalette_quiz_answers';
const ANALYSIS_DATA_KEY = 'aurapalette_analysis';
const PAYMENT_KEY = 'aurapalette_payment';

interface CheckpointData {
    currentStage: string;
    completedStages: string[];
    lastUpdated: string;
}

// Get current checkpoint
export function getCheckpoint(): CheckpointData | null {
    if (typeof window === 'undefined') return null;

    const data = localStorage.getItem(CHECKPOINT_KEY);
    if (!data) return null;

    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
}

// Set checkpoint to a specific stage
export function setCheckpoint(stage: string): void {
    if (typeof window === 'undefined') return;

    const current = getCheckpoint();
    const completedStages = current?.completedStages || [];

    // Add all previous stages as completed
    const stageIndex = STAGE_ORDER.indexOf(stage);
    const newCompleted = STAGE_ORDER.slice(0, stageIndex + 1);

    // Merge with existing completed stages
    const allCompleted = Array.from(new Set([...completedStages, ...newCompleted]));

    const checkpoint: CheckpointData = {
        currentStage: stage,
        completedStages: allCompleted,
        lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(checkpoint));
}

// Check if user can access a specific stage
export function canAccessStage(stage: string): boolean {
    if (typeof window === 'undefined') return false;

    // Result page requires payment
    if (stage === 'result') {
        return hasCompletedPayment();
    }

    const checkpoint = getCheckpoint();
    if (!checkpoint) {
        // No checkpoint = can only access signup
        return stage === 'signup';
    }

    const requestedIndex = STAGE_ORDER.indexOf(stage);
    const currentIndex = STAGE_ORDER.indexOf(checkpoint.currentStage);

    // Can access current stage or any completed stage
    // Can also access the next stage (one step ahead)
    return requestedIndex <= currentIndex + 1;
}

// Get the redirect path if user cannot access current page
export function getRedirectPath(attemptedStage: string): string {
    const checkpoint = getCheckpoint();

    if (!checkpoint) {
        return '/signup';
    }

    // Return to the current valid stage
    return `/${checkpoint.currentStage}`;
}

// Check if user completed the quiz
export function hasCompletedQuiz(): boolean {
    if (typeof window === 'undefined') return false;

    const quizData = localStorage.getItem(QUIZ_DATA_KEY);
    return quizData !== null;
}

// Check if user has uploaded photo and got analysis
export function hasCompletedUpload(): boolean {
    if (typeof window === 'undefined') return false;

    const analysisData = localStorage.getItem(ANALYSIS_DATA_KEY);
    return analysisData !== null;
}

// Check if user has paid
export function hasCompletedPayment(): boolean {
    if (typeof window === 'undefined') return false;

    const paymentData = localStorage.getItem(PAYMENT_KEY);
    return paymentData !== null;
}

// Mark payment as completed
export function markPaymentComplete(paymentId: string, method: string): void {
    if (typeof window === 'undefined') return;

    const paymentData = {
        paymentId,
        method,
        completedAt: new Date().toISOString(),
    };

    localStorage.setItem(PAYMENT_KEY, JSON.stringify(paymentData));
    setCheckpoint('result');
}

// Get user data
export function getUserData(): { name: string; email: string; whatsapp: string } | null {
    if (typeof window === 'undefined') return null;

    const data = localStorage.getItem(USER_DATA_KEY);
    if (!data) return null;

    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
}

// Get quiz answers
export function getQuizAnswers(): Record<string, string> | null {
    if (typeof window === 'undefined') return null;

    const data = localStorage.getItem(QUIZ_DATA_KEY);
    if (!data) return null;

    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
}

// Get analysis result
export function getAnalysisResult(): unknown | null {
    if (typeof window === 'undefined') return null;

    const data = localStorage.getItem(ANALYSIS_DATA_KEY);
    if (!data) return null;

    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
}

// Clear all data (for testing or logout)
export function clearAllData(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(CHECKPOINT_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(QUIZ_DATA_KEY);
    localStorage.removeItem(ANALYSIS_DATA_KEY);
    localStorage.removeItem(PAYMENT_KEY);
}

// Initialize checkpoint after signup
export function initializeAfterSignup(userData: { name: string; email: string; whatsapp?: string }): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    setCheckpoint('signup');
}
