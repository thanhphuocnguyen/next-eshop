'use client';
import { ADMIN_API_PATHS } from '@/app/lib/constants/api';
import {
  Button,
  Dialog,
  DialogPanel,
  DialogTitle,
  Input,
} from '@headlessui/react';
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { AttributeDetailModel } from '@/app/lib/definitions';
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { clientSideFetch } from '@/app/lib/api/apiClient';
import { useForm, Controller } from 'react-hook-form';

interface AddNewDialogProps {
  open: boolean;
  onClose: () => void;
  handleSubmitted: (attribute: AttributeDetailModel) => void;
}

type CreateAttributeForm = {
  name: string;
};

export const AddNewDialog: React.FC<AddNewDialogProps> = ({
  onClose,
  open,
  handleSubmitted,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateAttributeForm>({
    defaultValues: { name: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (open && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [open]);

  const onSubmit = async (data: CreateAttributeForm) => {
    setIsLoading(true);
    try {
      const resp = await clientSideFetch<AttributeDetailModel>(
        ADMIN_API_PATHS.ATTRIBUTES,
        {
          method: 'POST',
          body: { name: data.name, values: [] },
        }
      );
      if (resp.error) {
        toast.error('Failed to create attribute');
        setIsLoading(false);
        return;
      }
      toast.success(
        <div className='flex items-center gap-2'>
          <CheckCircleIcon className='h-5 w-5 text-green-500' />
          Attribute created successfully
        </div>
      );
      handleSubmitted(resp.data);
      onClose();
      reset();
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Error creating attribute:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return; // Prevent closing while submitting
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-xl w-full">
          <div className='flex items-center justify-between mb-6'>
            <DialogTitle className='text-xl font-semibold'>
              Create Attribute
            </DialogTitle>
            <Button
              onClick={handleClose}
              disabled={isLoading}
              className='rounded p-1 text-gray-400 hover:text-gray-600'
            >
              <XCircleIcon className='h-6 w-6' />
            </Button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div>
              <label
                htmlFor='name'
                className='block text-base font-medium text-gray-700 mb-2'
              >
                Attribute Name *
              </label>
              <Controller
                name='name'
                control={control}
                rules={{ required: 'Attribute name is required' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    ref={nameInputRef}
                    disabled={isLoading}
                    id='name'
                    placeholder='e.g., Color, Size, Material...'
                    className='block w-full rounded-md border border-gray-300 px-4 py-3 text-base'
                  />
                )}
              />
              {errors.name && (
                <p className='mt-2 text-sm text-red-600'>
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className='flex justify-end gap-3 pt-4'>
              <Button
                type='button'
                onClick={handleClose}
                disabled={isLoading}
                className='px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isLoading}
                className='px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50'
              >
                {isLoading ? 'Creating...' : 'Create Attribute'}
              </Button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
