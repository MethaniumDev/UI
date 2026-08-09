import { createContext, useContext, type ReactNode } from "react";

import { defaultEmojiRegistry, type EmojiRegistry } from "./emoji-data";

const EmojiRegistryContext = createContext(defaultEmojiRegistry);

export type EmojiProviderProps = {
  children: ReactNode;
  registry: EmojiRegistry;
};

export function EmojiProvider({ children, registry }: EmojiProviderProps) {
  return (
    <EmojiRegistryContext value={registry}>{children}</EmojiRegistryContext>
  );
}

export function useEmojiRegistry(registry?: EmojiRegistry) {
  const contextualRegistry = useContext(EmojiRegistryContext);
  return registry ?? contextualRegistry;
}
