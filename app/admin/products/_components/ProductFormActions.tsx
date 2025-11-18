'use client';

import React from 'react';
import { Button } from '@headlessui/react';
import clsx from 'clsx';
import { TrashIcon } from '@heroicons/react/24/outline';
import { ManageProductModel } from '@/app/lib/definitions';

interface ProductFormActionsProps {
  productDetail?: ManageProductModel;
  isSubmitting: boolean;
  isDirty: boolean;
  isDeleting: boolean;
  onDeleteClick: () => void;
}

export const ProductFormActions: React.FC<ProductFormActionsProps> = ({
  productDetail,
  isSubmitting,
  isDirty,
  isDeleting,
  onDeleteClick,
}) => {
  return (
    <div className='flex space-x-3'>
      {productDetail && (
        <Button
          type='button'
          disabled={isDeleting}
          onClick={onDeleteClick}
          className={clsx(
            'btn text-lg flex items-center',
            isDeleting ? 'btn-disabled' : 'btn-danger'
          )}
        >
          <TrashIcon className='h-5 w-5 mr-1' />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      )}
      <Button
        disabled={isSubmitting || !isDirty}
        type='submit'
        className={clsx(
          'btn text-lg btn-primary',
          isSubmitting && 'loading',
          isDirty ? 'btn-primary' : 'btn-disabled'
        )}
      >
        {isSubmitting ? (
          <span>{productDetail ? 'Saving...' : 'Creating...'}</span>
        ) : (
          <span>{productDetail ? 'Save' : 'Create'}</span>
        )}
      </Button>
    </div>
  );
};