import { useEffect, useState, useRef } from 'react';

export const useVoiceInput = (onTranscript) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const [isSupported] = useState(() => {
    // Check browser support at initialization
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    return !!SpeechRecognition;
  });

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = true; // Changed to true to keep listening for multiple phrases
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        // Clear any pending silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Combine final and interim for display - show everything in real-time
        const combined = (finalTranscript + interimTranscript).trim();
        if (combined) {
          setTranscript(combined);
          // Call callback immediately with interim results so input updates in real-time
          onTranscript?.(combined);
        }

        // If we have final transcript, set a timeout to auto-save after 3 seconds of silence
        if (finalTranscript.trim()) {
          console.log('Final transcript detected:', finalTranscript);
          // Clear previous timeout
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }

          // Set new timeout for 3 seconds of silence to auto-stop
          silenceTimeoutRef.current = setTimeout(() => {
            console.log('3 seconds silence elapsed, auto-stopping');
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
          }, 3000);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [onTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Error starting recognition:', e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    }
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
  };
};
