'use client';
import React from 'react';
import { ManageProductModel, VariantDetailModel } from '@/app/lib/definitions';
import { PlusIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import useSWR from 'swr';
import { ADMIN_API_PATHS } from '@/app/lib/constants/api';
import { clientSideFetch } from '@/app/lib/api/apiClient';
import LoadingInline from '@/app/components/Common/Loadings/LoadingInline';

interface VariantListProps {
  productDetail: ManageProductModel;
}

const VariantItem: React.FC<{
  variant: VariantDetailModel;
  productId: string;
}> = ({ variant, productId }) => {
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
                  Stock: <span className='font-medium'>{variant.stockQty}</span>
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
          {variant.attributes && variant.attributes.length > 0 && (
            <div className='mt-3'>
              <div className='flex flex-wrap gap-2'>
                {variant.attributes.map((attr, index) => (
                  <span
                    key={`${attr.id}-${index}`}
                    className='inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800'
                  >
                    {attr.name}: {attr.valueObject.value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='flex items-center space-x-2 ml-4'>
          <Link
            href={`/admin/products/${productId}/variants/${variant.id}`}
            className='inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors'
            title='Edit variant'
          >
            <PencilIcon className='w-4 h-4' />
          </Link>
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

export const VariantList: React.FC<VariantListProps> = ({ productDetail }) => {
  const { data: variants, isLoading } = useSWR<VariantDetailModel[]>(
    ADMIN_API_PATHS.PRODUCT_VARIANTS.replace(':id', productDetail.id),
    (url) =>
      clientSideFetch<VariantDetailModel[]>(url, {
        method: 'GET',
        queryParams: { includeInactive: 'true' },
      }).then((res) => res.data),
    {
      fallbackData: [],
    }
  );

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
            <Link
              href={`/admin/products/${productDetail.id}/variant`}
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
            >
              <PlusIcon className='w-4 h-4 mr-2' />
              Add New Variant
            </Link>
          </div>

          {/* Variants List */}
          {variants && variants.length > 0 ? (
            <div className='space-y-4'>
              {variants.map((variant) => (
                <VariantItem
                  key={variant.id}
                  variant={variant}
                  productId={productDetail.id}
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
              <Link
                href={`/admin/products/${productDetail.id}/variant`}
                className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
              >
                <PlusIcon className='w-4 h-4 mr-2' />
                Create First Variant
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
