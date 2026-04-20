import { History, MessageSquarePlus, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AquaAssistantConversation } from '@/hooks/useAquaAssistantHistory';

interface AquaAssistantHistoryPanelProps {
  activeConversationId: string;
  conversations: AquaAssistantConversation[];
  onClearHistory: () => void;
  onSelectConversation: (conversationId: string) => void;
  onStartNewConversation: () => void;
}

const formatConversationDate = (value: string) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const AquaAssistantHistoryPanel = ({
  activeConversationId,
  conversations,
  onClearHistory,
  onSelectConversation,
  onStartNewConversation,
}: AquaAssistantHistoryPanelProps) => {
  return (
    <div className="flex h-full flex-col border-r border-border bg-background">
      <div className="flex items-center justify-between gap-2 border-b border-border p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <History className="h-4 w-4 text-primary" />
            <span>Historique</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Dates, unités et conversations récentes</p>
        </div>
        <div className="flex items-center gap-1">
          <Button type="button" variant="outline" size="icon" onClick={onStartNewConversation} title="Nouvelle conversation">
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={onClearHistory} title="Effacer l’historique">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 p-3">
          {conversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  isActive ? 'border-primary bg-primary/10' : 'border-border bg-background hover:bg-muted/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{conversation.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatConversationDate(conversation.updatedAt)}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {conversation.messages.length}
                  </Badge>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {conversation.unitName && (
                    <Badge variant="outline" className="max-w-full truncate text-[10px]">
                      {conversation.unitName}
                    </Badge>
                  )}
                  {conversation.lastCategory && (
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {conversation.lastCategory}
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AquaAssistantHistoryPanel;