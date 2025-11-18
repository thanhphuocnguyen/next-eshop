'use client';

import LoadingInline from '@/app/components/Common/Loadings/LoadingInline';
import { use } from 'react';
import { ProductDetailForm, VariantList } from '../_components';
import { useProductDetail } from '../../hooks/useProductDetail';

export default function ProductFormEditPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = use(params);

  const { productDetail, isLoading, mutate } = useProductDetail(id);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-full'>
        <LoadingInline />
      </div>
    );
  }

  if (!productDetail) {
    return (
      <div className='flex justify-center items-center h-full'>
        <div className='text-lg font-bold'>Product not found</div>
      </div>
    );
  }

  return (
    <div className='h-full overflow-auto'>
      <ProductDetailForm productDetail={productDetail} mutate={mutate} />
      {productDetail && <VariantList productDetail={productDetail} />}
    </div>
  );
}
