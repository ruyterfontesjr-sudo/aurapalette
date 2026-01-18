'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Card from '@/components/Card';
import Logo from '@/components/Logo';
import Button from '@/components/Button';

type QuestionType = 'color-only' | 'text-grid' | 'text-list';

interface Question {
    id: number;
    question: string;
    description?: string;
    type: QuestionType;
    options: {
        id: string;
        text: string;
        color?: string;
    }[];
}

const questions: Question[] = [
    {
        id: 1,
        question: 'Qual tom mais se aproxima da sua pele?',
        description: 'Selecione a cor que mais se aproxima da sua pele',
        type: 'color-only',
        options: [
            { id: 'tone-1', text: 'Porcelana', color: '#FFDBAC' },
            { id: 'tone-2', text: 'Clara rosada', color: '#F5D0C5' },
            { id: 'tone-3', text: 'Clara', color: '#EFCFB8' },
            { id: 'tone-4', text: 'Bege claro', color: '#E4C5AA' },
            { id: 'tone-5', text: 'Bege', color: '#D4A78B' },
            { id: 'tone-6', text: 'Morena clara', color: '#C49A6C' },
            { id: 'tone-7', text: 'Morena', color: '#B08040' },
            { id: 'tone-8', text: 'Morena escura', color: '#9A6B4A' },
            { id: 'tone-9', text: 'Negra clara', color: '#8B5B4D' },
            { id: 'tone-10', text: 'Negra', color: '#6B4F3A' },
            { id: 'tone-11', text: 'Negra escura', color: '#553B32' },
            { id: 'tone-12', text: 'Negra retinta', color: '#3D2B1F' },
        ],
    },
    {
        id: 2,
        question: 'Qual é a cor dos seus olhos?',
        type: 'text-grid',
        description: 'Selecione a cor mais próxima',
        options: [
            { id: 'eye-1', text: 'Azul claro', color: '#87CEEB' },
            { id: 'eye-2', text: 'Azul', color: '#4A90B8' },
            { id: 'eye-3', text: 'Cinza', color: '#8B9DAE' },
            { id: 'eye-4', text: 'Verde claro', color: '#8FBC8F' },
            { id: 'eye-5', text: 'Verde', color: '#5D8A5D' },
            { id: 'eye-6', text: 'Avelã', color: '#8B7355' },
            { id: 'eye-7', text: 'Mel', color: '#B08040' },
            { id: 'eye-8', text: 'Castanho claro', color: '#8B6B4F' },
            { id: 'eye-9', text: 'Castanho', color: '#5C4033' },
            { id: 'eye-10', text: 'Castanho escuro', color: '#3D2B1F' },
            { id: 'eye-11', text: 'Preto', color: '#1C1C1C' },
        ],
    },
    {
        id: 3,
        question: 'Qual é a cor natural do seu cabelo na raiz?',
        description: 'Considere sua cor natural, sem tintura',
        type: 'text-grid',
        options: [
            { id: 'hair-black', text: 'Preto' },
            { id: 'hair-dark-brown', text: 'Castanho escuro' },
            { id: 'hair-brown', text: 'Castanho médio' },
            { id: 'hair-light-brown', text: 'Castanho claro' },
            { id: 'hair-dark-blonde', text: 'Loiro escuro' },
            { id: 'hair-blonde', text: 'Loiro claro' },
            { id: 'hair-red', text: 'Ruivo / Cobre' },
        ],
    },
    {
        id: 4,
        question: 'Como sua pele reage ao sol?',
        type: 'text-list',
        options: [
            { id: 'sun-1', text: 'Sempre queima, nunca bronzeia' },
            { id: 'sun-2', text: 'Queima primeiro, depois bronzeia levemente' },
            { id: 'sun-3', text: 'Às vezes queima, bronzeia gradualmente' },
            { id: 'sun-4', text: 'Raramente queima, bronzeia fácil' },
            { id: 'sun-5', text: 'Nunca queima, sempre bronzeia' },
        ],
    },
    {
        id: 5,
        question: 'Olhando as veias do seu pulso, qual cor predomina?',
        description: 'Observe sob luz natural',
        type: 'text-list',
        options: [
            { id: 'vein-blue', text: 'Azuladas / Roxas' },
            { id: 'vein-green', text: 'Esverdeadas' },
            { id: 'vein-mixed', text: 'Mistura dos dois' },
        ],
    },
    {
        id: 6,
        question: 'Você tem sardas ou pintas no rosto?',
        type: 'text-list',
        options: [
            { id: 'freckles-many', text: 'Sim, tenho bastante' },
            { id: 'freckles-some', text: 'Tenho algumas poucas' },
            { id: 'freckles-none', text: 'Não tenho sardas nem pintas' },
        ],
    },
    {
        id: 7,
        question: 'Após exercício físico ou calor, seu rosto tende a ficar:',
        description: 'Pense em como sua pele reage após se exercitar ou em dias quentes',
        type: 'text-list',
        options: [
            { id: 'blush-pink', text: 'Rosado ou avermelhado' },
            { id: 'blush-peach', text: 'Pêssego ou alaranjado' },
            { id: 'blush-none', text: 'Quase não muda de cor' },
        ],
    },
];

export default function QuizPage() {
    const router = useRouter();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});

    // Restore saved quiz answers on page load (for refresh handling)
    useEffect(() => {
        const savedQuiz = localStorage.getItem('aurapalette_quiz');
        if (savedQuiz) {
            try {
                const parsedAnswers = JSON.parse(savedQuiz);
                // Only restore if NOT all questions answered (otherwise let user start fresh if they want)
                if (Object.keys(parsedAnswers).length < questions.length) {
                    setAnswers(parsedAnswers);
                    const answeredQuestions = Object.keys(parsedAnswers).map(Number);
                    const lastAnswered = Math.max(...answeredQuestions);
                    setCurrentQuestion(Math.min(lastAnswered, questions.length - 1));
                }
            } catch (e) {
                // Invalid data, start fresh
            }
        }
    }, []);

    const handleSelectOption = (optionId: string) => {
        const newAnswers = {
            ...answers,
            [questions[currentQuestion].id]: optionId,
        };
        setAnswers(newAnswers);

        setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(prev => prev + 1);
            } else {
                localStorage.setItem('aurapalette_quiz', JSON.stringify(newAnswers));
                localStorage.setItem('aurapalette_quiz_answers', JSON.stringify(newAnswers));
                localStorage.setItem('aurapalette_checkpoint', JSON.stringify({
                    currentStage: 'quiz',
                    completedStages: ['signup', 'quiz'],
                    lastUpdated: new Date().toISOString(),
                }));
                router.push('/upload');
            }
        }, 300);
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const handleNext = () => {
        if (selectedOption && currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else if (selectedOption) {
            localStorage.setItem('aurapalette_quiz', JSON.stringify(answers));
            localStorage.setItem('aurapalette_quiz_answers', JSON.stringify(answers));
            localStorage.setItem('aurapalette_checkpoint', JSON.stringify({
                currentStage: 'quiz',
                completedStages: ['signup', 'quiz'],
                lastUpdated: new Date().toISOString(),
            }));
            router.push('/upload');
        }
    };

    const question = questions[currentQuestion];
    const selectedOption = answers[question.id];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
        <main className={styles.page}>
            <div className={styles.bgGradient} />

            <div className={styles.container}>
                <div className={styles.header}>
                    <Logo />
                </div>

                {/* Progress */}
                <div className={styles.progressSection}>
                    <span className={styles.progressLabel}>Pergunta {currentQuestion + 1} de {questions.length}</span>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <Card className={styles.questionCard} key={question.id}>
                    <h2 className={styles.question}>{question.question}</h2>
                    {question.description && (
                        <p className={styles.questionDesc}>{question.description}</p>
                    )}

                    {/* Tipo: Apenas bolinhas de cor */}
                    {question.type === 'color-only' && (
                        <div className={styles.colorGrid}>
                            {question.options.map(option => (
                                <button
                                    key={option.id}
                                    className={`${styles.colorCircle} ${selectedOption === option.id ? styles.colorCircleSelected : ''}`}
                                    style={{ backgroundColor: option.color }}
                                    onClick={() => handleSelectOption(option.id)}
                                    title={option.text}
                                    aria-label={option.text}
                                />
                            ))}
                        </div>
                    )}

                    {/* Tipo: Grid 2 colunas com texto */}
                    {question.type === 'text-grid' && (
                        <div className={styles.textGrid}>
                            {question.options.map(option => (
                                <button
                                    key={option.id}
                                    className={`${styles.textOption} ${selectedOption === option.id ? styles.textOptionSelected : ''}`}
                                    onClick={() => handleSelectOption(option.id)}
                                >
                                    <span>{option.text}</span>
                                    {selectedOption === option.id && (
                                        <span className={styles.checkMark}>✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Tipo: Lista vertical */}
                    {question.type === 'text-list' && (
                        <div className={styles.textList}>
                            {question.options.map(option => (
                                <button
                                    key={option.id}
                                    className={`${styles.listOption} ${selectedOption === option.id ? styles.listOptionSelected : ''}`}
                                    onClick={() => handleSelectOption(option.id)}
                                >
                                    <span>{option.text}</span>
                                    <span className={`${styles.radio} ${selectedOption === option.id ? styles.radioSelected : ''}`}>
                                        {selectedOption === option.id && '✓'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Navigation */}
                <div className={styles.navigation}>
                    <button
                        className={styles.navButton}
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                    >
                        ← Voltar
                    </button>
                    <Button
                        variant="primary"
                        onClick={handleNext}
                        disabled={!selectedOption}
                    >
                        {currentQuestion === questions.length - 1 ? 'Finalizar Quiz' : 'Próxima'} →
                    </Button>
                </div>
            </div>
        </main>
    );
}
