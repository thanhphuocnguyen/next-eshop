import { clientSideFetch } from '@/app/lib/api/apiClient';
import { ADMIN_API_PATHS } from '@/app/lib/constants/api';
import { VariantDetailModel } from '@/app/lib/definitions';
import useSWR from 'swr';

export const useVariants = (productId: string) => {
  const {
    data: variants,
    isLoading,
    mutate,
  } = useSWR<VariantDetailModel[]>(
    ADMIN_API_PATHS.PRODUCT_VARIANTS.replace(':productId', productId),
    (url) =>
      clientSideFetch<VariantDetailModel[]>(url, {
        method: 'GET',
        queryParams: { includeInactive: 'true' },
      }).then((res) => res.data),
    {
      fallbackData: [],
    }
  );
  return { variants, isLoading, mutate };
};
