'use client';
import { use } from 'react';
import { VariantForm } from '../../_components';
import { Breadcrumb } from '@/app/components/Common';
import { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: 'Create Product Variant',
//   description: 'Create a new variant for your product',
// };

export default function CreateVariantPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = use(params);

  // Breadcrumb items for navigation
  const breadcrumbItems = [
    { label: 'Admin Dashboard', href: '/admin' },
    { label: 'Products', href: '/admin/products' },
    { label: 'Product Details', href: `/admin/products/${id}` },
    { label: 'Create Variant' },
  ];

  return (
    <div className='space-y-6'>
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} className='mb-4' />
      
      {/* Page Header */}
      <div className='border-b border-gray-200 pb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Create Product Variant
            </h1>
            <p className='mt-2 text-sm text-gray-600'>
              Add a new variant to customize your product with different attributes, pricing, and inventory.
            </p>
          </div>
        </div>
      </div>

      {/* Variant Form Section */}
      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <div className='mb-6'>
          <h2 className='text-xl font-semibold text-gray-800 mb-2'>
            Variant Details
          </h2>
          <p className='text-sm text-gray-600'>
            Configure the attributes, pricing, and inventory for this product variant.
          </p>
        </div>
        
        <VariantForm productAttributes={[]} />
      </div>
    </div>
  );
}
