import { useRef, useState } from 'react';
import { type CoreState } from './components/JarvisCore';
import { useChats } from './hooks/useChats';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Backdrops } from './components/Backdrops';
import { IconRail } from './components/IconRail';
import { ChatDrawer } from './components/ChatDrawer';
import { CoreSpotlight } from './components/CoreSpotlight';
import { ChatPanel } from './components/ChatPanel';
import { Composer, type ComposerHandle } from './components/Composer';

export default function App() {
  const {
    chats,
    activeChat,
    activeId,
    streamingId,
    isStreaming,
    selectChat,
    createChat,
    deleteChat,
    sendMessage,
    stopStreaming,
  } = useChats();

  // UI-only state: the composer draft and the conversation drawer.
  const [input, setInput] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const composerRef = useRef<ComposerHandle>(null);

  const closeDrawer = () => setDrawerOpen(false);
  const toggleDrawer = () => setDrawerOpen((v) => !v);

  const startNewChat = () => {
    createChat();
    closeDrawer();
  };
  const sendText = (raw: string) => {
    sendMessage(raw);
    setInput('');
  };

  useKeyboardShortcuts([
    { key: 'n', mod: true, run: startNewChat },
    { key: '/', mod: true, run: () => composerRef.current?.focus() },
    { key: 'b', mod: true, run: toggleDrawer },
    { key: 'Escape', run: closeDrawer },
  ]);

  /* ── derived state ────────────────────────────────────────────────── */

  const coreState: CoreState = isStreaming
    ? 'generating'
    : input.trim().length > 0
      ? 'listening'
      : 'idle';

  /* ── render ───────────────────────────────────────────────────────── */

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#04060a] text-cyan-50">
      <Backdrops />

      {/* Left icon rail */}
      <IconRail
        chats={chats}
        activeId={activeId}
        onSelect={selectChat}
        onNew={startNewChat}
        onToggleDrawer={toggleDrawer}
      />

      {/* Slide-out drawer with conversation list */}
      <ChatDrawer
        open={drawerOpen}
        chats={chats}
        activeId={activeId}
        onSelect={(id) => {
          selectChat(id);
          closeDrawer();
        }}
        onDelete={deleteChat}
        onClose={closeDrawer}
      />

      {/* Main area. Landscape: orb stage (flex-1) + a fixed chat panel side
          by side. Vertical (portrait / square — e.g. social posts): the orb
          stacks on top and the chat fills the space beneath it. */}
      <div className="relative z-10 ml-[68px] flex h-full vert:ml-0 vert:flex-col">
        <CoreSpotlight state={coreState} hasChat={activeChat !== null} />

        <ChatPanel chat={activeChat} streamingId={streamingId} onPrompt={sendText}>
          <Composer
            ref={composerRef}
            value={input}
            onChange={setInput}
            onSend={() => sendText(input)}
            onStop={stopStreaming}
            isStreaming={isStreaming}
          />
        </ChatPanel>
      </div>

      {/* Faint scanlines */}
      <div className="pointer-events-none absolute inset-0 scanlines opacity-[0.03]" />
    </div>
  );
}
