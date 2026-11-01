import React from 'react';
import { AICommandCenter } from './ai/AICommandCenter';

interface AIAssistantProps {
  initialTab?: string;
}

export function AIAssistant({ initialTab }: AIAssistantProps) {
  return <AICommandCenter initialTab={initialTab} />;
}
