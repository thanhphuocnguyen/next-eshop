'use client';


import React from 'react';
import { Button } from '@headlessui/react';


// This component is now stateless and only for display, edit, and remove handled by parent.
interface ValueItemProps {
  code: string;
  name: string;
  isActive: boolean;
  onEdit: () => void;
  onRemove: () => void;
}

const ValueItem: React.FC<ValueItemProps> = ({ code, name, isActive, onEdit, onRemove }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
    <span>{code} - {name} {isActive ? '(Active)' : ''}</span>
    <Button type='button' onClick={onEdit}>Edit</Button>
    <Button type='button' onClick={onRemove}>Remove</Button>
  </div>
);

export default ValueItem;
