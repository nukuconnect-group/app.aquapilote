import { useEffect, useMemo, useState } from 'react';

export interface AquaAssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  category?: string;
  unitId?: string;
  unitName?: string | null;
  createdAt: string;
}

export interface AquaAssistantConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  unitId?: string | null;
  unitName?: string | null;
  lastCategory?: string | null;
  messages: AquaAssistantMessage[];
}

const STORAGE_KEY = 'aqua_assistant_conversations_v2';
const LEGACY_STORAGE_KEY = 'aqua_assistant_messages_v1';
const MAX_CONVERSATIONS = 30;

const randomId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const sortConversations = (conversations: AquaAssistantConversation[]) =>
  [...conversations]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, MAX_CONVERSATIONS);

const getLastCategorizedMessage = (messages: AquaAssistantMessage[]) => {
  const categorizedMessages = messages.filter((message) => message.category);
  return categorizedMessages[categorizedMessages.length - 1] ?? null;
};

const buildConversationTitle = (messages: AquaAssistantMessage[]) => {
  const firstUserMessage = messages.find((message) => message.role === 'user' && message.content.trim().length > 0);
  if (!firstUserMessage) return 'Nouvelle conversation';

  const compact = firstUserMessage.content.replace(/\s+/g, ' ').trim();
  return compact.length > 52 ? `${compact.slice(0, 52)}…` : compact;
};

export const createAquaAssistantMessage = (
  message: Omit<AquaAssistantMessage, 'id' | 'createdAt'> & Partial<Pick<AquaAssistantMessage, 'id' | 'createdAt'>>,
): AquaAssistantMessage => ({
  id: message.id ?? randomId(),
  createdAt: message.createdAt ?? new Date().toISOString(),
  role: message.role,
  content: message.content,
  category: message.category,
  unitId: message.unitId,
  unitName: message.unitName ?? null,
});

const createConversation = (
  greeting: string,
  currentUnit?: { id?: string | null; name?: string | null },
): AquaAssistantConversation => {
  const now = new Date().toISOString();
  return {
    id: randomId(),
    title: 'Nouvelle conversation',
    createdAt: now,
    updatedAt: now,
    unitId: currentUnit?.id ?? null,
    unitName: currentUnit?.name ?? null,
    lastCategory: null,
    messages: [
      createAquaAssistantMessage({
        role: 'assistant',
        content: greeting,
        unitId: currentUnit?.id ?? undefined,
        unitName: currentUnit?.name ?? null,
        createdAt: now,
      }),
    ],
  };
};

const normalizeMessages = (messages: unknown[], fallbackUnitName?: string | null) =>
  messages
    .filter((message): message is Partial<AquaAssistantMessage> & { role: 'user' | 'assistant'; content: string } => {
      return !!message && typeof message === 'object' && 'role' in message && 'content' in message;
    })
    .map((message) =>
      createAquaAssistantMessage({
        role: message.role,
        content: message.content,
        category: message.category,
        unitId: message.unitId,
        unitName: message.unitName ?? fallbackUnitName ?? null,
        id: message.id,
        createdAt: message.createdAt,
      }),
    );

const loadStoredConversations = (
  greeting: string,
  currentUnit?: { id?: string | null; name?: string | null },
) => {
  if (typeof window === 'undefined') {
    return [createConversation(greeting, currentUnit)];
  }

  try {
    const storedConversations = window.localStorage.getItem(STORAGE_KEY);
    if (storedConversations) {
      const parsed = JSON.parse(storedConversations);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalized = parsed
          .filter((conversation): conversation is Partial<AquaAssistantConversation> & { messages: unknown[] } => {
            return !!conversation && typeof conversation === 'object' && Array.isArray(conversation.messages);
          })
          .map((conversation) => {
            const messages = normalizeMessages(conversation.messages, conversation.unitName ?? currentUnit?.name ?? null);
            const createdAt = conversation.createdAt ?? messages[0]?.createdAt ?? new Date().toISOString();
            const updatedAt = conversation.updatedAt ?? messages[messages.length - 1]?.createdAt ?? createdAt;

            return {
              id: conversation.id ?? randomId(),
              title: conversation.title ?? buildConversationTitle(messages),
              createdAt,
              updatedAt,
              unitId: conversation.unitId ?? null,
              unitName: conversation.unitName ?? currentUnit?.name ?? null,
              lastCategory: conversation.lastCategory ?? getLastCategorizedMessage(messages)?.category ?? null,
              messages: messages.length > 0 ? messages : createConversation(greeting, currentUnit).messages,
            } satisfies AquaAssistantConversation;
          });

        if (normalized.length > 0) return sortConversations(normalized);
      }
    }

    const legacyMessages = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyMessages) {
      const parsedLegacy = JSON.parse(legacyMessages);
      if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
        const messages = normalizeMessages(parsedLegacy, currentUnit?.name ?? null);
        const legacyConversation: AquaAssistantConversation = {
          id: randomId(),
          title: buildConversationTitle(messages),
          createdAt: messages[0]?.createdAt ?? new Date().toISOString(),
          updatedAt: messages[messages.length - 1]?.createdAt ?? new Date().toISOString(),
          unitId: messages.find((message) => message.unitId)?.unitId ?? currentUnit?.id ?? null,
          unitName: messages.find((message) => message.unitName)?.unitName ?? currentUnit?.name ?? null,
          lastCategory: getLastCategorizedMessage(messages)?.category ?? null,
          messages,
        };

        return [legacyConversation];
      }
    }
  } catch (error) {
    console.warn('Impossible de charger l’historique AquaAssistant', error);
  }

  return [createConversation(greeting, currentUnit)];
};

export const useAquaAssistantHistory = (
  greeting: string,
  currentUnit?: { id?: string | null; name?: string | null },
) => {
  const [conversations, setConversations] = useState<AquaAssistantConversation[]>(() =>
    loadStoredConversations(greeting, currentUnit),
  );
  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    const initial = loadStoredConversations(greeting, currentUnit);
    return initial[0]?.id ?? createConversation(greeting, currentUnit).id;
  });

  const activeConversation = useMemo(() => {
    return conversations.find((conversation) => conversation.id === activeConversationId) ?? conversations[0] ?? null;
  }, [activeConversationId, conversations]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortConversations(conversations)));
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) {
      console.warn('Impossible d’enregistrer l’historique AquaAssistant', error);
    }
  }, [conversations]);

  const updateActiveConversationMessages = (
    updater:
      | AquaAssistantMessage[]
      | ((messages: AquaAssistantMessage[]) => AquaAssistantMessage[]),
  ) => {
    setConversations((previousConversations) => {
      const fallbackConversation = previousConversations[0] ?? createConversation(greeting, currentUnit);
      const targetId = activeConversationId || fallbackConversation.id;

      const nextConversations = previousConversations.length > 0 ? [...previousConversations] : [fallbackConversation];
      const targetIndex = nextConversations.findIndex((conversation) => conversation.id === targetId);
      const safeIndex = targetIndex >= 0 ? targetIndex : 0;
      const targetConversation = nextConversations[safeIndex] ?? fallbackConversation;

      const rawMessages = typeof updater === 'function' ? updater(targetConversation.messages) : updater;
      const normalizedMessages = rawMessages.map((message) =>
        createAquaAssistantMessage({
          ...message,
          unitName: message.unitName ?? targetConversation.unitName ?? currentUnit?.name ?? null,
        }),
      );

      const finalMessages = normalizedMessages.length > 0 ? normalizedMessages : createConversation(greeting, currentUnit).messages;
      const lastMessage = finalMessages[finalMessages.length - 1];

      nextConversations[safeIndex] = {
        ...targetConversation,
        title: buildConversationTitle(finalMessages),
        updatedAt: lastMessage?.createdAt ?? new Date().toISOString(),
        unitId: finalMessages.find((message) => message.unitId)?.unitId ?? targetConversation.unitId ?? currentUnit?.id ?? null,
        unitName:
          finalMessages.find((message) => message.unitName)?.unitName ??
          targetConversation.unitName ??
          currentUnit?.name ??
          null,
        lastCategory: getLastCategorizedMessage(finalMessages)?.category ?? targetConversation.lastCategory ?? null,
        messages: finalMessages,
      };

      return sortConversations(nextConversations);
    });
  };

  const appendMessage = (message: Omit<AquaAssistantMessage, 'id' | 'createdAt'> & Partial<Pick<AquaAssistantMessage, 'id' | 'createdAt'>>) => {
    const normalizedMessage = createAquaAssistantMessage({
      ...message,
      unitName: message.unitName ?? currentUnit?.name ?? null,
    });

    updateActiveConversationMessages((previousMessages) => [...previousMessages, normalizedMessage]);
    return normalizedMessage;
  };

  const updateLastAssistantMessage = (content: string) => {
    updateActiveConversationMessages((previousMessages) => {
      if (previousMessages.length === 0) {
        return [
          createAquaAssistantMessage({
            role: 'assistant',
            content,
            unitId: currentUnit?.id ?? undefined,
            unitName: currentUnit?.name ?? null,
          }),
        ];
      }

      const nextMessages = [...previousMessages];
      const lastMessage = nextMessages[nextMessages.length - 1];

      if (lastMessage?.role !== 'assistant') {
        nextMessages.push(
          createAquaAssistantMessage({
            role: 'assistant',
            content,
            unitId: currentUnit?.id ?? undefined,
            unitName: currentUnit?.name ?? null,
          }),
        );
        return nextMessages;
      }

      nextMessages[nextMessages.length - 1] = {
        ...lastMessage,
        content,
      };
      return nextMessages;
    });
  };

  const removeLastMessage = () => {
    updateActiveConversationMessages((previousMessages) => previousMessages.slice(0, -1));
  };

  const startNewConversation = () => {
    const nextConversation = createConversation(greeting, currentUnit);
    setConversations((previousConversations) => sortConversations([nextConversation, ...previousConversations]));
    setActiveConversationId(nextConversation.id);
  };

  const clearHistory = () => {
    const nextConversation = createConversation(greeting, currentUnit);
    setConversations([nextConversation]);
    setActiveConversationId(nextConversation.id);
  };

  const selectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  return {
    conversations,
    activeConversation,
    activeConversationId,
    messages: activeConversation?.messages ?? [],
    appendMessage,
    clearHistory,
    removeLastMessage,
    selectConversation,
    setMessages: updateActiveConversationMessages,
    startNewConversation,
    updateLastAssistantMessage,
  };
};