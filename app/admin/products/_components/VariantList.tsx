'use client';
import React, { useState } from 'react';
import {
  AttributeFormModel,
  ManageProductModel,
  VariantDetailModel,
} from '@/app/lib/definitions';
import { PlusIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import LoadingInline from '@/app/components/Common/Loadings/LoadingInline';
import { VariantFormDialog } from './VariantFormModal';
import { useVariants } from '../_hooks/useVariatns';

interface VariantListProps {
  productDetail: ManageProductModel;
  productAttributes: Array<AttributeFormModel>;
}

const VariantItem: React.FC<{
  variant: VariantDetailModel;
  productId: string;
  onEdit: (variant: VariantDetailModel) => void;
}> = ({ variant, productId, onEdit }) => {
  return (
    <div className='bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <div className='flex items-center space-x-3'>
            <div className='flex-1'>
              <h4 className='text-sm font-medium text-gray-900'>
                SKU: {variant.sku}
              </h4>
              <div className='mt-1 space-y-1'>
                <p className='text-sm text-gray-600'>
                  Price: <span className='font-medium'>${variant.price}</span>
                </p>
                <p className='text-sm text-gray-600'>
                  Stock: <span className='font-medium'>{variant.stock}</span>
                </p>
                {variant.weight && (
                  <p className='text-sm text-gray-600'>
                    Weight:{' '}
                    <span className='font-medium'>{variant.weight}g</span>
                  </p>
                )}
              </div>
            </div>
            <div className='text-right'>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  variant.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {variant.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Variant Attributes */}
          {variant.attributeValues && variant.attributeValues.length > 0 && (
            <div className='mt-3'>
              <div className='flex flex-wrap gap-2'>
                {variant.attributeValues.map((attr, index) => (
                  <span
                    key={`${attr.id}-${index}`}
                    className='inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800'
                  >
                    {attr.name}: {attr.value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='flex items-center space-x-2 ml-4'>
          <button
            onClick={() => onEdit(variant)}
            className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors'
            title='Edit variant'
          >
            <PencilIcon className='w-4 h-4' />
          </button>
          <Link
            href={`/admin/products/${productId}/variants/${variant.id}/view`}
            className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors'
            title='View variant details'
          >
            <EyeIcon className='w-4 h-4' />
          </Link>
        </div>
      </div>
    </div>
  );
};

export const VariantList: React.FC<VariantListProps> = ({
  productDetail,
  productAttributes,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<
    VariantDetailModel | undefined
  >();

  const { variants, isLoading } = useVariants(productDetail.id);

  const handleCreateVariant = () => {
    setSelectedVariant(undefined);
    setIsDialogOpen(true);
  };

  const handleEditVariant = (variant: VariantDetailModel) => {
    setSelectedVariant(variant);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedVariant(undefined);
  };

  if (isLoading) {
    return <LoadingInline />;
  }

  return (
    <div className='mt-8 mb-6'>
      <div className='bg-white rounded-lg shadow-md'>
        <div className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h2 className='text-xl font-semibold text-gray-700'>
                Product Variants
              </h2>
              <p className='text-gray-500 mt-1'>
                Manage different variations of this product (size, color, etc.)
              </p>
            </div>
            <button
              onClick={handleCreateVariant}
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
            >
              <PlusIcon className='w-4 h-4 mr-2' />
              Add New Variant
            </button>
          </div>

          {/* Variants List */}
          {variants && variants.length > 0 ? (
            <div className='space-y-4'>
              {variants.map((variant) => (
                <VariantItem
                  key={variant.id}
                  variant={variant}
                  productId={productDetail.id}
                  onEdit={handleEditVariant}
                />
              ))}
            </div>
          ) : (
            <div className='text-center py-12 bg-gray-50 rounded-lg'>
              <div className='text-gray-400'>
                <PlusIcon className='w-12 h-12 mx-auto mb-4' />
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No variants created yet
              </h3>
              <p className='text-gray-500 mb-6'>
                Create different variations of this product to offer more
                options to your customers.
              </p>
              <button
                onClick={handleCreateVariant}
                className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
              >
                <PlusIcon className='w-4 h-4 mr-2' />
                Create First Variant
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Variant Form Dialog */}
      {isDialogOpen && (
        <VariantFormDialog
          open={isDialogOpen}
          variant={selectedVariant}
          productAttributes={productAttributes}
          onClose={handleCloseDialog}
          productId={productDetail.id}
          basePrice={productDetail.price}
        />
      )}
    </div>
  );
};
