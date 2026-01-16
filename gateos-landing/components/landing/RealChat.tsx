"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Bot } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

// Initialize socket connection
const socket: Socket = io();

type Role = 'user' | 'model';
interface ChatMessage {
    role: Role;
    text: string;
    timestamp: Date;
    isStreaming?: boolean;
}

const LoadingState = {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
} as const;

export function RealChat() {
    const { executeRecaptcha } = useGoogleReCaptcha();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState<typeof LoadingState[keyof typeof LoadingState]>(LoadingState.IDLE);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Message (Polish by default for GateOS)
    const initialMessage = "Cześć! Jestem Twoim asystentem GateOS. W czym mogę pomóc?";

    useEffect(() => {
        setMessages([{
            role: 'model',
            text: initialMessage,
            timestamp: new Date()
        }]);
    }, []);

    // WebSocket Event Listeners
    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        socket.on('messageToClient', (payload: { sender: string, message: string, isChunk?: boolean }) => {
            if (payload.isChunk) {
                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg && lastMsg.role === 'model' && lastMsg.isStreaming) {
                        return [
                            ...prev.slice(0, -1),
                            { ...lastMsg, text: lastMsg.text + payload.message }
                        ];
                    } else {
                        return [...prev, { role: 'model', text: payload.message, timestamp: new Date(), isStreaming: true }];
                    }
                });
                setLoading(LoadingState.SUCCESS);
            } else {
                const modelMsg: ChatMessage = {
                    role: 'model',
                    text: payload.message,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, modelMsg]);
                setLoading(LoadingState.SUCCESS);
            }
        });

        socket.on('streamComplete', () => {
            setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.isStreaming) {
                    return [...prev.slice(0, -1), { ...lastMsg, isStreaming: false }];
                }
                return prev;
            });
        });

        return () => {
            socket.off('connect');
            socket.off('messageToClient');
        };
    }, []);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading === LoadingState.LOADING) return;

        if (!executeRecaptcha) {
            console.warn('Execute recaptcha not available yet');
            return;
        }

        const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(LoadingState.LOADING);

        try {
            const token = await executeRecaptcha('chat_submit');
            console.log('Recaptcha token generated:', token);
            // Send message via WebSocket
            socket.emit('messageToServer', { text: input, captcha: token });
        } catch (error) {
            console.error('Recaptcha execution failed', error);
            setLoading(LoadingState.ERROR);
            setMessages(prev => [...prev, { role: 'model', text: 'Błąd weryfikacji. Spróbuj ponownie.', timestamp: new Date() }]);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="bg-primary hover:bg-amber-400 text-black p-4 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all hover:scale-110 flex items-center gap-2 font-bold"
                >
                    <Bot size={24} />
                    <span className="hidden md:inline">Zapytaj AI</span>
                </button>
            )}

            {isOpen && (
                <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-[90vw] md:w-[400px] h-[500px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-neutral-800 p-4 flex justify-between items-center border-b border-neutral-700">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/20 p-1.5 rounded-lg">
                                <Bot size={20} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Asystent GateOS</h3>
                                <p className="text-xs text-neutral-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                        <button onClick={toggleChat} className="text-neutral-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-900/95">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-primary text-black rounded-tr-none font-medium'
                                        : 'bg-neutral-800 text-neutral-200 rounded-tl-none border border-neutral-700'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading === LoadingState.LOADING && (
                            <div className="flex justify-start">
                                <div className="bg-neutral-800 p-3 rounded-2xl rounded-tl-none border border-neutral-700 flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-primary" />
                                    <span className="text-xs text-neutral-400">Piszę...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 bg-neutral-800 border-t border-neutral-700 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Zapytaj o cokolwiek..."
                            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder-neutral-500"
                        />
                        <button
                            type="submit"
                            disabled={loading === LoadingState.LOADING || !input.trim()}
                            className="bg-primary text-black p-2 rounded-xl hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                    <div className="bg-neutral-800 px-4 pb-2 text-[10px] text-neutral-500 text-center">
                        Chronione przez reCAPTCHA.
                    </div>
                </div>
            )}
        </div>
    );
};
