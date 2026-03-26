import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, X, Send, Sparkles, User } from "lucide-react";

type Message = {
  id: string;
  role: "system" | "user" | "bot";
  content: string;
};

export function AIChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      content: "Hi there! I'm your AI Eco-Assistant. 🌱 How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateAIResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    // Pattern matching for realistic simulated responses
    if (q.includes("reward") || q.includes("points")) {
      return "You can earn 10 Reward Points for every verified item you recycle! Once you hit 500 points, you can redeem them for exciting eco-vouchers or discounts at partner brands. 🎁";
    }
    if (q.includes("e-waste") || q.includes("ewaste") || q.includes("electronic") || q.includes("battery") || q.includes("batteries")) {
      return "E-Waste like batteries, old phones, and chargers contain hazardous materials like lithium and lead. NEVER throw them in general trash! Please use the 'Waste Detection' tool to find the nearest certified E-Waste Smart Bin facility.";
    }
    if (q.includes("plastic") || q.includes("bottle")) {
      return "Plastic bottles should be rinsed and crushed to save space before throwing them into the Blue recycling bins. Make sure the cap is on or separated depending on local rules!";
    }
    if (q.includes("route") || q.includes("optimizer") || q.includes("collection")) {
      return "The Route Optimizer automatically calculates the most fuel-efficient pathways for our recycling trucks, prioritizing Smart Bins that are above 80% fill capacity. This saves huge amounts of CO2!";
    }
    if (q.includes("blockchain") || q.includes("ledger")) {
      return "Our Blockchain Ledger ensures 100% transparency. Every time a recycling event reaches 'FINAL_DISPOSITION', we record an immutable hash block so the lifecycle of that item can never be tampered with. 🔗";
    }
    if (q.includes("score") || q.includes("eco-score") || q.includes("ecoscore")) {
      return "Your Eco-Score is an aggregated metric of your overall recycling impact. The more weight you reliably recycle and the fewer complaints lodged against you, the higher your score will be!";
    }
    
    // Default fallback
    return "I'm still learning about that! As your Eco-Assistant, I can help you understand recycling rules, locate Smart Bins, explain your Reward Points, or walk you through the Blockchain ledger. What would you like to know?";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate network delay and AI processing time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: generateAIResponse(userMessage.content),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Expanded Chat Window */}
      {isOpen && (
        <Card className="w-[350px] shadow-2xl mb-4 border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 overflow-hidden animate-in zoom-in slide-in-from-bottom-5 duration-300">
          <CardHeader className="bg-primary px-4 py-3 flex flex-row items-center justify-between space-y-0 rounded-t-xl">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary-foreground" />
              <CardTitle className="text-sm font-medium text-primary-foreground">
                Eco-Assistant AI
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages Array */}
            <div className="h-[350px] overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 max-w-[85%] ${
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div
                    className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                      msg.role === "user"
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-2 max-w-[85%] mr-auto">
                  <div className="shrink-0 h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 text-sm bg-muted text-foreground rounded-tl-sm flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t bg-background flex items-center gap-2">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 rounded-full border-muted-foreground/20 focus-visible:ring-primary/50"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="rounded-full shrink-0 shadow-md"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-2xl hover:shadow-primary/50 transition-all hover:-translate-y-1 animate-in zoom-in"
          onClick={() => setIsOpen(true)}
        >
          <Bot className="h-7 w-7" />
        </Button>
      )}
    </div>
  );
}
