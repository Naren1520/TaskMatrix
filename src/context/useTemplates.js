import { useContext } from 'react';
import { TemplatesContext } from './templatesCore';

export const useTemplates = () => {
  const ctx = useContext(TemplatesContext);
  if (!ctx) throw new Error('useTemplates must be used within TemplatesProvider');
  return ctx;
};

export default useTemplates;
