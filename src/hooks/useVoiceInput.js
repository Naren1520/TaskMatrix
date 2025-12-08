// Voice input feature removed — provide a safe stub to avoid import errors.
export const useVoiceInput = () => ({
  isListening: false,
  transcript: '',
  startListening: () => {},
  stopListening: () => {},
  isSupported: false,
});
