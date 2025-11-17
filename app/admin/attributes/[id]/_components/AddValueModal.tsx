'use client';
import StyledModal from '@/app/components/StyledModal';
import { Button, Input } from '@headlessui/react';
import clsx from 'clsx';
import React, { useState } from 'react';

interface AttrValueModalProps {
  valId: null | undefined | number;
  value?: string;
  onClose: () => void;
  onSubmit: (value: string) => Promise<void>;
}
export const AttrValueModal: React.FC<AttrValueModalProps> = ({
  valId,
  value,
  onSubmit,
  onClose,
}) => {
  const [val, setVal] = useState(value || '');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <StyledModal
      open={valId !== undefined}
      onClose={onClose}
      title={`${valId ? 'Edit' : 'Add'} Value`}
    >
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          {valId ? 'Edit' : 'Add'} Value
        </h3>
        <p className='text-sm text-gray-600'>
          {valId ? 'Edit' : 'Add'} a new value to this attribute
        </p>
      </div>

      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Value
          </label>

          <Input
            className='block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500'
            placeholder='Enter value'
            value={val}
            onChange={({ target: { value } }) => {
              setVal(value);
            }}
          />
          {}
        </div>

        <div className='flex justify-end gap-3 mt-6'>
          <Button
            type='button'
            onClick={onClose}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setIsLoading(true);
              onSubmit(val).finally(() => {
                setIsLoading(false);
              });
            }}
            className={clsx(
              'px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md',
              'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            Add Value
          </Button>
        </div>
      </div>
    </StyledModal>
  );
};
