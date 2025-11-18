'use client';

import LoadingInline from '@/app/components/Common/Loadings/LoadingInline';
import { use, useEffect, useState } from 'react';
import { ProductDetailForm, VariantList } from '../_components';
import { useProductDetail } from '../../hooks/useProductDetail';
import { AttributeFormModel } from '@/app/lib/definitions';
import { clientSideFetch } from '@/app/lib/api/apiClient';
import { ADMIN_API_PATHS } from '@/app/lib/constants/api';
import { toast } from 'react-toastify';

export default function ProductFormEditPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = use(params);

  const { productDetail, isLoading, mutate } = useProductDetail(id);
  const [attributes, setAttributes] = useState<Array<AttributeFormModel>>([]);

  useEffect(() => {
    // Fetch product attributes logic can be added here
    if (!id) return;
    clientSideFetch<Array<AttributeFormModel>>(
      ADMIN_API_PATHS.ATTRIBUTES_BY_PRODUCT_ID.replace(':productId', id)
    )
      .then((resp) => {
        setAttributes(resp.data);
      })
      .catch((error) => {
        console.error('Error fetching product attributes:', error);
        toast.error('Failed to load product attributes.');
      });
  }, [id]);

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
      {productDetail && (
        <VariantList
          productDetail={productDetail}
          productAttributes={attributes}
        />
      )}
    </div>
  );
}
