'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Fieldset, Legend } from '@headlessui/react';
import { redirect, useRouter } from 'next/navigation';
import { ArrowLeftCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  GenericResponse,
  ManageProductModel,
  ProductFormSchema,
  ProductModelForm,
  ProductModelFormOut,
} from '@/app/lib/definitions';

import { ProductInfoForm } from './ProductInfoForm';
import { ProductFormActions } from './ProductFormActions';
import { ADMIN_API_PATHS } from '@/app/lib/constants/api';
import { toast } from 'react-toastify';
import { ConfirmDialog } from '@/app/components/Common/Dialogs/ConfirmDialog';
import { KeyedMutator } from 'swr';
import { clientSideFetch } from '@/app/lib/api/apiClient';

interface ProductEditFormProps {
  productDetail?: ManageProductModel;
  mutate?: KeyedMutator<ManageProductModel>;
}

export const ProductDetailForm: React.FC<ProductEditFormProps> = ({
  productDetail,
  mutate,
}) => {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [file, setFile] = React.useState<File | null>(null);

  const productForm = useForm<ProductModelForm, unknown, ProductModelFormOut>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: productDetail
      ? {
          category: productDetail.category,
          attributes: productDetail.attributes,
          brand: productDetail.brand,
          collection: productDetail.collection,
          description: productDetail.description,
          name: productDetail.name,
          price: productDetail.price,
          sku: productDetail.sku,
          isActive: productDetail.isActive,
          slug: productDetail.slug,
        }
      : {
          brand: {
            id: '',
            name: '',
          },
          category: {
            id: '',
            name: '',
          },
          attributes: [],
          collection: null,
          description: '',
          name: '',
          sku: '',
          slug: '',
          price: 1,
          isActive: true,
        },
  });

  const {
    reset,
    formState: { isDirty, isSubmitting },
  } = productForm;

  const handleDeleteProduct = async () => {
    if (!productDetail?.id) return;
    setIsDeleting(true);
    try {
      const { error } = await clientSideFetch<GenericResponse<unknown>>(
        ADMIN_API_PATHS.PRODUCT_DETAIL.replace(':id', productDetail.id),
        {
          method: 'DELETE',
        }
      );

      if (error) {
        toast.error(`Failed to delete product: ${error.details}`);
      } else {
        toast.success(`Product "${productDetail.name}" deleted successfully`);
        router.push('/admin/products');
      }
    } catch (err) {
      toast.error('An unexpected error occurred while deleting the product');
      console.error(err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  async function submitHandler(data: ProductModelFormOut) {
    let productID = productDetail?.id;
    let isAllSuccess = true;
    if (isDirty) {
      const rs = await onSubmitProductDetail(data);
      productID = rs;
      isAllSuccess &&= !!rs;
    }

    if (productID && file) {
      const rs = await onUploadImages(productID);
      isAllSuccess &&= rs;
    }

    if (!productDetail && productID) {
      redirect(`/admin/products/${productID}`);
    }
    if (isAllSuccess && mutate) {
      await mutate();
    }
    reset();
  }

  async function onUploadImages(productId: string) {
    const productImageFormData = new FormData();
    productImageFormData.append('file', file!);
    try {
      const { data } = await clientSideFetch<ProductModelForm>(
        ADMIN_API_PATHS.PRODUCT_IMAGES_UPLOAD.replaceAll(':id', productId),
        {
          method: 'POST',
          body: productImageFormData,
        }
      );

      if (data) {
        reset((prev) => ({ ...prev,  }));
        toast.success('Images uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload images');
      console.error(error);
      return false;
    }

    return true;
  }

  async function onSubmitProductDetail(
    payload: ProductModelFormOut
  ): Promise<string | undefined> {
    const { data, error } = await clientSideFetch<{ id: string }>(
      productDetail
        ? ADMIN_API_PATHS.PRODUCT_DETAIL.replace(':id', productDetail.id)
        : ADMIN_API_PATHS.PRODUCTS,
      {
        method: productDetail ? 'PUT' : 'POST',
        body: payload,
      }
    );

    if (error) {
      toast.error(
        <div>
          Failed to {productDetail ? 'update' : 'create'} product
          <br />
          {error.details}
        </div>
      );
      return undefined;
    }
    if (data) {
      toast.success(
        <div>
          {productDetail ? 'Updated' : 'Created'} product successfully
          <br />
          {data.id}
        </div>
      );
    }

    return data.id;
  }

  useEffect(() => {
    if (productDetail) {
      reset({
        category: productDetail.category,
        brand: productDetail.brand,
        collection: productDetail.collection,
        attributes: productDetail.attributes,
        description: productDetail.description,
        name: productDetail.name,
        shortDescription: productDetail.shortDescription,
        price: productDetail.price,
        sku: productDetail.sku,
        isActive: productDetail.isActive,
        slug: productDetail.slug,
      });
    }
  }, [productDetail, reset]);

  return (
    <div className='h-full px-6 py-3 overflow-auto'>
      <FormProvider {...productForm}>
        <Fieldset
          onSubmit={productForm.handleSubmit(submitHandler, console.error)}
          as='form'
        >
          <Link
            href={'/admin/products'}
            className='flex items-center mb-2 space-x-2'
          >
            <ArrowLeftCircleIcon className='size-6 text-primary' />
            <span className='text-primary text-lg hover:underline'>
              Back to Products
            </span>
          </Link>
          <Legend className='text-2xl flex justify-between font-bold text-primary mb-4'>
            {productDetail ? (
              <span>Edit Product: {productDetail.name}</span>
            ) : (
              <span>Create New Product</span>
            )}
            <ProductFormActions
              productDetail={productDetail}
              isSubmitting={isSubmitting}
              isDirty={isDirty || file !== null}
              isDeleting={isDeleting}
              onDeleteClick={() => setShowDeleteConfirm(true)}
            />
          </Legend>

          {/* Combined Product Details and Variants Section */}
          <div className='bg-white rounded-lg'>
            {/* Product Description Header */}
            <div className='mb-4'>
              <h2 className='text-xl font-semibold text-gray-700'>
                Product Details
              </h2>
              <p className='text-gray-500 mt-1'>
                {productDetail
                  ? 'Edit your product information, variants, and images below.'
                  : 'Fill in the details to create a new product in your inventory.'}
              </p>
            </div>

            <div className='mb-6'>
              <ProductInfoForm
                productDetail={productDetail}
                file={file}
                setFile={setFile}
              />
            </div>
          </div>
        </Fieldset>
      </FormProvider>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title='Delete Product'
        message={`Are you sure you want to delete "${productDetail?.name}"? This action cannot be undone.`}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteProduct}
        confirmStyle='bg-red-600 hover:bg-red-700'
      />
    </div>
  );
};
