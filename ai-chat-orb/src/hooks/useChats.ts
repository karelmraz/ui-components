import { useRef, useState } from 'react';
import {
  type Chat,
  type Message,
  newChat,
  newId,
  respond,
  streamResponse,
  titleFromMessage,
} from '../lib/chat';

/**
 * Conversation state: the chat list, the active selection and the simulated
 * streaming reply. Conversations live in memory only — they intentionally
 * reset on every app restart / reload (no localStorage persistence).
 */

interface ActiveStream {
  chatId: string;
  cancel: () => void;
}

function makeMessage(role: Message['role'], content: string): Message {
  return { id: newId(), role, content, createdAt: Date.now() };
}

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Id of the assistant message currently streaming in (drives the caret and
  // the "generating" status).
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const streamRef = useRef<ActiveStream | null>(null);

  // Falls back to the most recent chat when the selected one has been
  // deleted, so the selection never dangles and delete needs no reconciling.
  const activeChat = chats.find((c) => c.id === selectedId) ?? chats[0] ?? null;
  const activeId = activeChat?.id ?? null;

  const updateChat = (id: string, update: (chat: Chat) => Chat) => {
    setChats((prev) => prev.map((c) => (c.id === id ? update(c) : c)));
  };

  const stopStreaming = () => {
    streamRef.current?.cancel();
    streamRef.current = null;
    setStreamingId(null);
  };

  // Adds a fresh chat to the front of the list and selects it.
  const openChat = () => {
    const chat = newChat();
    setChats((prev) => [chat, ...prev]);
    setSelectedId(chat.id);
    return chat.id;
  };

  const createChat = () => {
    stopStreaming();
    openChat();
  };

  const deleteChat = (id: string) => {
    if (streamRef.current?.chatId === id) stopStreaming();
    setChats((prev) => prev.filter((c) => c.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  };

  const sendMessage = (raw: string) => {
    const text = raw.trim();
    if (!text) return;

    const chatId = activeId ?? openChat();
    const userMsg = makeMessage('user', text);
    const assistantMsg = makeMessage('assistant', '');

    updateChat(chatId, (c) => ({
      ...c,
      title: c.messages.length === 0 ? titleFromMessage(text) : c.title,
      messages: [...c.messages, userMsg, assistantMsg],
      updatedAt: Date.now(),
    }));
    setStreamingId(assistantMsg.id);

    const cancel = streamResponse(
      respond(text),
      (acc) => {
        updateChat(chatId, (c) => ({
          ...c,
          messages: c.messages.map((m) => (m.id === assistantMsg.id ? { ...m, content: acc } : m)),
        }));
      },
      () => {
        streamRef.current = null;
        setStreamingId(null);
      },
    );
    streamRef.current = { chatId, cancel };
  };

  return {
    chats,
    activeChat,
    activeId,
    streamingId,
    isStreaming: streamingId !== null,
    selectChat: setSelectedId,
    createChat,
    deleteChat,
    sendMessage,
    stopStreaming,
  };
}
