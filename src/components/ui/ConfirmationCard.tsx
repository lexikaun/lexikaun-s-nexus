import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Check, X } from 'lucide-react';

export type ConfirmationTier = 'auto' | 'inline' | 'explicit';

interface ConfirmationCardProps {
  tier: ConfirmationTier;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({ tier, message, onConfirm, onCancel }) => {
  if (tier === 'auto') {
    // Auto-execute is silent, UI shouldn't really render this, but for completeness:
    return null; 
  }

  if (tier === 'inline') {
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-surface hairline-border rounded-md my-2">
        <span className="text-sm text-text-main">{message}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onConfirm}>
            <Check className="h-4 w-4 text-text-main" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onCancel}>
            <X className="h-4 w-4 text-text-secondary" />
          </Button>
        </div>
      </div>
    );
  }

  // Explicit
  return (
    <Card className="my-4">
      <h3 className="text-sm font-medium text-text-main mb-2">Confirm Action</h3>
      <p className="text-sm text-text-secondary mb-4">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" size="sm" onClick={onConfirm}>Confirm</Button>
      </div>
    </Card>
  );
};
