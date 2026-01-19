'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// Analysis step definitions matching the SSE API
export const ANALYSIS_STEPS = [
  { id: 'detecting_face', label: 'Detectando seu rosto...', progress: 15 },
  { id: 'analyzing_skin', label: 'Analisando tom de pele...', progress: 30 },
  { id: 'analyzing_eyes', label: 'Identificando cor dos olhos...', progress: 45 },
  { id: 'calculating_contrast', label: 'Calculando contraste pessoal...', progress: 60 },
  { id: 'identifying_undertone', label: 'Identificando subtom...', progress: 75 },
  { id: 'generating_palette', label: 'Gerando sua paleta...', progress: 90 },
  { id: 'finalizing', label: 'Finalizando análise...', progress: 100 },
] as const;

export type AnalysisStepId = typeof ANALYSIS_STEPS[number]['id'];

export type AnalysisStatus = 'idle' | 'validating' | 'analyzing' | 'complete' | 'error';

export interface PartialInsights {
  skinDescription?: string;
  eyeColor?: string;
  undertone?: string;
  temperature?: string;
  contrast?: string;
  season?: string;
}

export interface AnalysisError {
  type: 'VALIDATION_ERROR' | 'TIMEOUT_ERROR' | 'NETWORK_ERROR' | 'SERVER_ERROR';
  message: string;
}

export interface AnalysisResult {
  temperature: string;
  undertone: string;
  season: string;
  seasonEmoji?: string;
  contrast: string;
  skinDescription?: string;
  eyeColor?: string;
  fullAnalysis?: {
    summary: string;
    bestColors: Array<{ name: string; hex: string; description?: string }>;
    avoidColors: Array<{ name: string; hex: string; reason?: string }>;
    makeup?: Record<string, unknown>;
    hair?: Record<string, unknown>;
    fashion?: Record<string, unknown>;
    accessories?: Record<string, unknown>;
    tips?: Record<string, unknown>;
  };
  seasonTrends?: Record<string, unknown>;
}

export interface AnalysisState {
  status: AnalysisStatus;
  progress: number;
  currentStep: string;
  currentStepId: AnalysisStepId | null;
  insights: PartialInsights;
  result: AnalysisResult | null;
  error: AnalysisError | null;
}

interface SSEEvent {
  type: 'step' | 'insight' | 'complete' | 'error';
  step?: string;
  progress?: number;
  field?: string;
  value?: string;
  result?: AnalysisResult;
  error?: AnalysisError;
}

const MAX_RETRIES = 2;
const INITIAL_RETRY_DELAY = 1000;

function getStepLabel(stepId: string): string {
  const step = ANALYSIS_STEPS.find(s => s.id === stepId);
  return step?.label || 'Analisando...';
}

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    status: 'idle',
    progress: 0,
    currentStep: '',
    currentStepId: null,
    insights: {},
    result: null,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const lastImageRef = useRef<string>('');
  const lastQuizDataRef = useRef<Record<string, string> | undefined>(undefined);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // SSE analysis with streaming
  const analyzeWithSSE = useCallback(async (
    image: string,
    quizData?: Record<string, string>
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      cleanup();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState(prev => ({
        ...prev,
        status: 'analyzing',
        progress: 0,
        currentStep: 'Iniciando análise...',
        currentStepId: null,
        insights: {},
        result: null,
        error: null,
      }));

      fetch('/api/analyze-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, quizData }),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body');
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;

              try {
                const event: SSEEvent = JSON.parse(line.slice(6));

                switch (event.type) {
                  case 'step':
                    setState(prev => ({
                      ...prev,
                      progress: event.progress || prev.progress,
                      currentStep: event.step ? getStepLabel(event.step) : prev.currentStep,
                      currentStepId: event.step as AnalysisStepId || prev.currentStepId,
                    }));
                    break;

                  case 'insight':
                    if (event.field && event.value) {
                      setState(prev => ({
                        ...prev,
                        insights: {
                          ...prev.insights,
                          [event.field!]: event.value,
                        },
                      }));
                    }
                    break;

                  case 'complete':
                    if (event.result) {
                      const result = event.result;
                      setState(prev => ({
                        ...prev,
                        status: 'complete',
                        progress: 100,
                        currentStep: 'Análise completa!',
                        result,
                      }));
                      resolve(true);
                      return;
                    }
                    break;

                  case 'error':
                    if (event.error) {
                      const error = event.error;
                      setState(prev => ({
                        ...prev,
                        status: 'error',
                        error,
                      }));
                      resolve(false);
                      return;
                    }
                    break;
                }
              } catch {
                // Skip malformed events
              }
            }
          }

          // Stream ended without complete event
          resolve(false);
        })
        .catch((error) => {
          if (error.name === 'AbortError') {
            resolve(false);
            return;
          }

          console.error('SSE analysis error:', error);
          setState(prev => ({
            ...prev,
            status: 'error',
            error: {
              type: 'NETWORK_ERROR',
              message: 'Erro de conexão. Verifique sua internet.',
            },
          }));
          resolve(false);
        });
    });
  }, [cleanup]);

  // Fallback to legacy API
  const analyzeWithLegacy = useCallback(async (
    image: string,
    quizData?: Record<string, string>
  ): Promise<boolean> => {
    cleanup();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState(prev => ({
      ...prev,
      status: 'analyzing',
      progress: 0,
      currentStep: 'Iniciando análise...',
      currentStepId: 'detecting_face',
      insights: {},
      result: null,
      error: null,
    }));

    // Simulate progress during legacy request
    let progressInterval: NodeJS.Timeout | null = null;
    let currentStepIndex = 0;

    const updateProgress = () => {
      if (currentStepIndex < ANALYSIS_STEPS.length - 1) {
        const step = ANALYSIS_STEPS[currentStepIndex];
        setState(prev => ({
          ...prev,
          progress: step.progress * 0.85, // Cap at 85% until complete
          currentStep: step.label,
          currentStepId: step.id,
        }));
        currentStepIndex++;
      }
    };

    progressInterval = setInterval(updateProgress, 1500);
    updateProgress();

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, quizData }),
        signal: controller.signal,
      });

      if (progressInterval) clearInterval(progressInterval);

      if (!response.ok) {
        const data = await response.json();
        if (data.error === 'INVALID_IMAGE') {
          setState(prev => ({
            ...prev,
            status: 'error',
            error: {
              type: 'VALIDATION_ERROR',
              message: data.message || 'Não foi possível analisar a foto.',
            },
          }));
          return false;
        }
        throw new Error(data.error || 'Analysis failed');
      }

      const result = await response.json();

      setState(prev => ({
        ...prev,
        status: 'complete',
        progress: 100,
        currentStep: 'Análise completa!',
        result,
      }));

      return true;
    } catch (error) {
      if (progressInterval) clearInterval(progressInterval);

      if ((error as Error).name === 'AbortError') {
        return false;
      }

      console.error('Legacy analysis error:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: {
          type: 'SERVER_ERROR',
          message: 'Erro ao analisar. Tente novamente.',
        },
      }));
      return false;
    }
  }, [cleanup]);

  // Main analyze function with retry logic
  const analyze = useCallback(async (
    image: string,
    quizData?: Record<string, string>
  ): Promise<boolean> => {
    lastImageRef.current = image;
    lastQuizDataRef.current = quizData;
    retryCountRef.current = 0;

    // Try SSE first
    let success = await analyzeWithSSE(image, quizData);

    // If SSE fails, fallback to legacy
    if (!success && state.status === 'error') {
      console.log('SSE failed, falling back to legacy API');
      success = await analyzeWithLegacy(image, quizData);
    }

    return success;
  }, [analyzeWithSSE, analyzeWithLegacy, state.status]);

  // Retry function with exponential backoff
  const retry = useCallback(async (): Promise<boolean> => {
    if (!lastImageRef.current) return false;

    retryCountRef.current++;
    if (retryCountRef.current > MAX_RETRIES) {
      setState(prev => ({
        ...prev,
        error: {
          type: 'SERVER_ERROR',
          message: 'Muitas tentativas falharam. Tente novamente mais tarde.',
        },
      }));
      return false;
    }

    // Exponential backoff
    const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCountRef.current - 1);
    await new Promise(resolve => setTimeout(resolve, delay));

    // Try SSE again, then fallback
    let success = await analyzeWithSSE(lastImageRef.current, lastQuizDataRef.current);
    if (!success) {
      success = await analyzeWithLegacy(lastImageRef.current, lastQuizDataRef.current);
    }

    return success;
  }, [analyzeWithSSE, analyzeWithLegacy]);

  // Reset state
  const reset = useCallback(() => {
    cleanup();
    setState({
      status: 'idle',
      progress: 0,
      currentStep: '',
      currentStepId: null,
      insights: {},
      result: null,
      error: null,
    });
    retryCountRef.current = 0;
    lastImageRef.current = '';
    lastQuizDataRef.current = undefined;
  }, [cleanup]);

  // Cancel ongoing analysis
  const cancel = useCallback(() => {
    cleanup();
    setState(prev => ({
      ...prev,
      status: 'idle',
      progress: 0,
    }));
  }, [cleanup]);

  return {
    ...state,
    analyze,
    retry,
    reset,
    cancel,
  };
}
