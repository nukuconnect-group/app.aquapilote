import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Volume2, Loader2, Building2, Fish, Utensils, HeartPulse, TrendingUp, Settings, Sparkles, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  category?: string;
  unitId?: string;
}

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  suggestions: string[];
}

interface Language {
  id: string;
  label: string;
  code: string; // BCP 47 language code for speech recognition
  flag: string;
}

const languages: Language[] = [
  { id: 'fr', label: 'Français', code: 'fr-FR', flag: '🇫🇷' },
  { id: 'en', label: 'English', code: 'en-US', flag: '🇺🇸' },
  { id: 'ewe', label: 'Eʋegbe (Ewe)', code: 'ee-GH', flag: '🇬🇭' },
  { id: 'kabye', label: 'Kabɩyɛ', code: 'fr-TG', flag: '🇹🇬' },
  { id: 'adja', label: 'Adja', code: 'fr-BJ', flag: '🇧🇯' },
  { id: 'lingala', label: 'Lingála', code: 'ln-CD', flag: '🇨🇩' },
  { id: 'wolof', label: 'Wolof', code: 'wo-SN', flag: '🇸🇳' },
  { id: 'bambara', label: 'Bambara', code: 'bm-ML', flag: '🇲🇱' },
  { id: 'hausa', label: 'Hausa', code: 'ha-NG', flag: '🇳🇬' },
  { id: 'yoruba', label: 'Yorùbá', code: 'yo-NG', flag: '🇳🇬' },
  { id: 'swahili', label: 'Kiswahili', code: 'sw-KE', flag: '🇰🇪' },
  { id: 'fon', label: 'Fɔngbè', code: 'fr-BJ', flag: '🇧🇯' },
];

const categories: Category[] = [
  {
    id: 'production',
    label: 'Production',
    icon: <Fish className="w-4 h-4" />,
    color: 'bg-blue-500',
    suggestions: [
      "Quel est l'état de mes cycles de production ?",
      "Combien de poissons ai-je en stock ?",
      "Quand prévoir la prochaine récolte ?",
      "Comment optimiser ma densité d'élevage ?",
    ]
  },
  {
    id: 'feeding',
    label: 'Alimentation',
    icon: <Utensils className="w-4 h-4" />,
    color: 'bg-orange-500',
    suggestions: [
      "Quel est mon stock d'aliments actuel ?",
      "Calcule la ration journalière optimale",
      "Quand dois-je commander de l'aliment ?",
      "Quel est mon FCR moyen ?",
    ]
  },
  {
    id: 'health',
    label: 'Santé',
    icon: <HeartPulse className="w-4 h-4" />,
    color: 'bg-red-500',
    suggestions: [
      "Y a-t-il des alertes sanitaires ?",
      "Quel est le taux de mortalité actuel ?",
      "Quand faire le prochain contrôle sanitaire ?",
      "Comment prévenir les maladies courantes ?",
    ]
  },
  {
    id: 'economics',
    label: 'Économie',
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'bg-green-500',
    suggestions: [
      "Quel est mon coût de production par kg ?",
      "Analyse ma rentabilité actuelle",
      "Prévision des revenus ce mois",
      "Comment réduire mes coûts ?",
    ]
  },
  {
    id: 'general',
    label: 'Général',
    icon: <Settings className="w-4 h-4" />,
    color: 'bg-purple-500',
    suggestions: [
      "Donne-moi un résumé de ma ferme",
      "Quelles tâches sont prioritaires aujourd'hui ?",
      "Comment améliorer mes performances ?",
      "Conseils pour la saison actuelle",
    ]
  },
];

const AquaAssistant = () => {
  const { units } = useProductionUnits();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Bonjour ! Je suis AquaAssistant, votre expert aquacole. Sélectionnez une catégorie ou posez-moi directement votre question." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('fr');
  const [showUnitSelector, setShowUnitSelector] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);


  // Initialize speech recognition
  const currentLang = languages.find(l => l.id === selectedLanguage);
  
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = currentLang?.code || 'fr-FR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Erreur micro",
          description: "Je n'ai pas pu vous entendre. Réessayez.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [selectedLanguage, currentLang?.code]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Micro non disponible",
        description: "Votre navigateur ne supporte pas la reconnaissance vocale.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLang?.code || 'fr-FR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const selectedUnitName = units.find(u => u.id === selectedUnitId)?.name;
    const contextPrefix = selectedUnitId && selectedUnitName 
      ? `[Contexte: Unité "${selectedUnitName}"] ` 
      : '';

    const userMessage: Message = { 
      role: 'user', 
      content: textToSend,
      category: selectedCategory || undefined,
      unitId: selectedUnitId || undefined
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour utiliser l'assistant.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const enrichedMessages = newMessages.map(m => ({
        role: m.role,
        content: m.role === 'user' && m === userMessage 
          ? `${contextPrefix}${m.content}`
          : m.content
      }));

      const response = await fetch('https://hhsvraqchtqqgaezhnzn.supabase.co/functions/v1/aqua-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          messages: enrichedMessages,
          category: selectedCategory,
          unitId: selectedUnitId,
          language: currentLang?.label || 'Français'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur de connexion');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('Pas de réponse');

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

    } catch (error) {
      console.error('Assistant error:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Je n'ai pas pu répondre. Réessayez.",
        variant: "destructive"
      });
      if (!assistantContent) {
        setMessages(prev => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentCategory = categories.find(c => c.id === selectedCategory);
  const currentUnit = units.find(u => u.id === selectedUnitId);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${isOpen ? 'hidden' : ''}`}
        aria-label="Ouvrir l'assistant"
      >
        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </button>

      {/* Chat modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[600px] flex flex-col bg-background border border-border rounded-none sm:rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AquaAssistant Pro</h3>
                  <p className="text-xs text-white/80">Expert aquacole IA</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Unit selector */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <button
                  onClick={() => { setShowUnitSelector(!showUnitSelector); setShowLanguageSelector(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span className="truncate">{currentUnit?.name || 'Toutes unités'}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showUnitSelector ? 'rotate-180' : ''}`} />
                </button>
                
                {showUnitSelector && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => { setSelectedUnitId(null); setShowUnitSelector(false); }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${!selectedUnitId ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
                    >
                      Toutes les unités
                    </button>
                    {units.map(unit => (
                      <button
                        key={unit.id}
                        onClick={() => { setSelectedUnitId(unit.id); setShowUnitSelector(false); }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${selectedUnitId === unit.id ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
                      >
                        {unit.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Language selector */}
              <div className="relative">
                <button
                  onClick={() => { setShowLanguageSelector(!showLanguageSelector); setShowUnitSelector(false); }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>{currentLang?.flag}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showLanguageSelector ? 'rotate-180' : ''}`} />
                </button>
                
                {showLanguageSelector && (
                  <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10 min-w-[160px] max-h-64 overflow-y-auto">
                    {languages.map(lang => (
                      <button
                        key={lang.id}
                        onClick={() => { setSelectedLanguage(lang.id); setShowLanguageSelector(false); }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2 ${selectedLanguage === lang.id ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="p-2 border-b border-border bg-muted/30">
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id 
                      ? `${cat.color} text-white shadow-md` 
                      : 'bg-background hover:bg-muted border border-border'
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {currentCategory && messages.length <= 2 && (
            <div className="p-3 bg-muted/20 border-b border-border">
              <p className="text-xs text-muted-foreground mb-2">Suggestions {currentCategory.label.toLowerCase()} :</p>
              <div className="flex flex-wrap gap-1.5">
                {currentCategory.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-2.5 py-1 text-xs bg-background hover:bg-primary/10 border border-border rounded-full transition-colors hover:border-primary/50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    }`}
                  >
                    {msg.role === 'user' && msg.unitId && (
                      <Badge variant="secondary" className="mb-1.5 text-[10px] bg-white/20 text-white border-0">
                        <Building2 className="w-3 h-3 mr-1" />
                        {units.find(u => u.id === msg.unitId)?.name}
                      </Badge>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === 'assistant' && msg.content && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => speakText(msg.content)}
                        className="mt-2 h-7 px-2 text-xs opacity-70 hover:opacity-100"
                      >
                        <Volume2 className="w-3 h-3 mr-1" />
                        Écouter
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.content === '' && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-2xl rounded-bl-md">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Analyse en cours...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border bg-background">
            <div className="flex items-center gap-2">
              <Button
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                onClick={toggleListening}
                className="shrink-0 h-10 w-10"
                disabled={isLoading}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question..."
                className="flex-1 h-10"
                disabled={isLoading}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="shrink-0 h-10 w-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            {isListening && (
              <p className="text-xs text-center text-muted-foreground mt-2 animate-pulse">
                🎤 Écoute en cours... Parlez maintenant
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AquaAssistant;