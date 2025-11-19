"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Bot, User } from "lucide-react";
import { StorageService } from "@/lib/storage";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export default function AIPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Olá! Sou sua IA financeira. Posso analisar seus gastos e dar dicas. O que gostaria de saber?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = { id: Math.random().toString(36).substring(2), role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        // Real AI response logic
        try {
            // 1. Get current data context
            const data = await StorageService.getData();

            // 2. Call our API
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,
                    context: {
                        transactions: data.transactions.slice(0, 50), // Limit context to last 50 txs to save tokens
                        emergencyFund: data.emergencyFund
                    }
                }),
            });

            const json = await res.json();

            if (!res.ok) throw new Error(json.error || "Erro na IA");

            const aiMsg: Message = {
                id: Math.random().toString(36).substring(2),
                role: "assistant",
                content: json.response
            };

            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: Math.random().toString(36).substring(2),
                role: "assistant",
                content: "Desculpe, tive um problema ao processar sua mensagem. Tente novamente."
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(10vh-120px)]">
            <header className="mb-4">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    Assistente IA
                </h1>
                <p className="text-muted-foreground">Insights inteligentes para seu bolso</p>
            </header>

            <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl bg-muted/20 border border-border mb-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-purple-600 text-white"
                                }`}
                        >
                            {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div
                            className={`p-3 rounded-xl max-w-[80%] text-sm ${msg.role === "user"
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-card border border-border rounded-tl-none"
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="p-3 rounded-xl bg-card border border-border rounded-tl-none text-sm text-muted-foreground animate-pulse">
                            Digitando...
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="flex gap-2">
                <Input
                    placeholder="Pergunte sobre seus gastos..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading}>
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
    );
}
