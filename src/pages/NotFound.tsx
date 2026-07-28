import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import { FileQuestion } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-16 h-16 bg-brand-50 border border-brand-100 rounded-2xl flex items-center justify-center mb-5 text-brand-600">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 font-display">Page Not Found</h2>
      <p className="text-sm text-gray-500 max-w-md mb-6 mt-2">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button variant="primary" onClick={() => navigate('/app')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
