'use client';
import React, { Fragment, useEffect } from 'react';
import clsx from 'clsx';
import {
  Field,
  Switch,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
  Button,
} from '@headlessui/react';
import { useForm, useWatch } from 'react-hook-form';
import {
  AttributeFormModel,
  VariantFormSchema,
  VariantModelForm,
  VariantModelFormOut,
  VariantDetailModel,
} from '@/app/lib/definitions';
import { TextField } from '@/app/components/FormFields';
import { StyledComboBoxController } from '@/app/components/FormFields/StyledComboBoxController';
import ImageUploader from '@/app/components/ImageUploader';
import { zodResolver } from '@hookform/resolvers/zod';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { clientSideFetch } from '@/app/lib/api/apiClient';
import { ADMIN_API_PATHS } from '@/app/lib/constants/api';
import { useVariants } from '../_hooks/useVariatns';

interface VariantFormDialogProps {
  productId: string;
  basePrice?: number;
  productAttributes: AttributeFormModel[];
  open: boolean;
  variant?: VariantDetailModel; // For editing existing variant
  onClose: () => void;
}

export const VariantFormDialog: React.FC<VariantFormDialogProps> = ({
  productAttributes,
  open,
  variant,
  onClose,
  productId,
  basePrice,
}) => {
  const [file, setFile] = React.useState<File | null>(null);
  const {
    control,
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<VariantModelForm, unknown, VariantModelFormOut>({
    resolver: zodResolver(VariantFormSchema),
    defaultValues: {
      attributeValues: productAttributes.map((e) => e.values[0]),
      id: undefined,
      isActive: true,
      price: basePrice || 1,
      stockQty: 1,
      weight: 0,
    },
  });

  const { mutate } = useVariants(productId);

  const [isActive, imageUrl] = useWatch({
    control,
    name: ['isActive', 'imageUrl'],
  });
  // Reset form when variant changes or dialog opens/closes
  useEffect(() => {
    if (open && variant) {
      clientSideFetch<VariantDetailModel>(
        ADMIN_API_PATHS.PRODUCT_VARIANT_BY_ID.replace(
          ':productId',
          productId
        ).replace(':variantId', variant.id)
      )
        .then((resp) => {
          const variantData = resp.data;
          reset({
            id: variantData.id,
            attributeValues: variantData.attributeValues.map((attr) => ({
              id: attr.id,
              value: attr.value,
            })),
            isActive: variantData.isActive,
            price: variantData.price,
            stockQty: variantData.stock,
            imageId: variantData.imageId,
            imageUrl: variantData.imageUrl,
            weight: variantData.weight || 0,
          });
        })
        .catch((error) => {
          console.error('Error fetching variant details:', error);
          toast.error('Failed to load variant details.');
        });
    }
  }, [open, variant, reset, productId]);

  const handleFormSubmit = async (data: VariantModelFormOut) => {
    try {
      // For now, we'll use the same endpoint for both create and update
      // In a real application, you might need different endpoints
      const url = !variant
        ? ADMIN_API_PATHS.PRODUCT_VARIANTS.replace(':productId', productId)
        : ADMIN_API_PATHS.PRODUCT_VARIANT_BY_ID.replace(
            ':productId',
            productId
          ).replace(':variantId', variant.id);

      const method = variant ? 'PUT' : 'POST';
      const requestBody = variant ? { ...data, id: variant.id } : data;

      const response = await clientSideFetch<VariantModelFormOut>(url, {
        method,
        body: requestBody,
      });

      if (response.error) {
        toast.error(`Failed to ${variant ? 'update' : 'create'} variant`);
        return;
      }

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadUrl = ADMIN_API_PATHS.VARIANT_IMAGE_UPLOAD.replace(
          ':productId',
          productId
        ).replace(':variantId', response.data.id!);

        const uploadResponse = await clientSideFetch<{
          imageUrl: string;
          imageId: string;
        }>(uploadUrl, {
          method: 'POST',
          body: formData,
        });
        if (uploadResponse.error) {
          toast.error('Variant created but failed to upload image');
        }
      }

      toast.success(`Variant ${variant ? 'updated' : 'created'} successfully`);
      mutate();
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Error submitting variant form:', error);
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as='div'
        className='relative z-50 focus:outline-none'
        onClose={() => {
          onClose();
        }}
      >
        <TransitionChild
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black/25 backdrop-blur-sm' />
        </TransitionChild>

        <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4'>
            <TransitionChild
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <DialogPanel className='w-full max-w-7xl rounded-xl bg-white shadow-2xl p-6 transform transition-all'>
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                  <div className='flex items-center justify-between mb-6'>
                    <DialogTitle
                      as='h3'
                      className='text-2xl font-semibold text-gray-900'
                    >
                      {variant ? 'Edit Variant' : 'Create New Variant'}
                    </DialogTitle>
                    <Button
                      onClick={onClose}
                      className='rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors'
                      disabled={isSubmitting}
                    >
                      <XMarkIcon className='h-6 w-6' />
                    </Button>
                  </div>

                  <div className='flex gap-6'>
                    <div className='flex-1 space-y-6'>
                      <div className='bg-gray-50 rounded-lg p-4'>
                        <div className='flex items-center justify-between mb-4'>
                          <div className='flex items-center gap-3'>
                            <h4 className='text-lg font-medium text-gray-900'>
                              {variant?.sku || 'New Variant'}
                            </h4>
                          </div>
                          <Field className='flex items-center gap-3'>
                            <Switch
                              checked={!!isActive}
                              onChange={(checked) =>
                                setValue('isActive', checked)
                              }
                              className={clsx(
                                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                                isActive ? 'bg-indigo-600' : 'bg-gray-200'
                              )}
                              disabled={isSubmitting}
                            >
                              <span className='sr-only'>Active Variant</span>
                              <span
                                className={clsx(
                                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                  isActive ? 'translate-x-6' : 'translate-x-1'
                                )}
                              />
                            </Switch>
                            <span
                              className='font-medium text-gray-700 cursor-pointer'
                              onClick={() =>
                                !isSubmitting && setValue('isActive', !isActive)
                              }
                            >
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          </Field>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4'>
                          {productAttributes.map((attribute, idx) => (
                            <StyledComboBoxController
                              control={control}
                              key={attribute.id}
                              error={errors.attributeValues?.[idx]?.id?.message}
                              placeholder={
                                attribute.values.length === 0
                                  ? 'No values available'
                                  : 'Select ${attribute.name}'
                              }
                              getDisplayValue={(opt) => opt?.value || ''}
                              name={`attributeValues.${idx}`}
                              label={attribute.name}
                              options={attribute.values}
                              disabled={isSubmitting}
                            />
                          ))}
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
                          <TextField
                            {...register('price')}
                            label='Price ($)'
                            placeholder='0.00'
                            error={errors.price?.message}
                            type='number'
                            step='0.01'
                            min='0'
                            disabled={isSubmitting}
                          />
                          <TextField
                            {...register('stockQty')}
                            label='Stock Quantity'
                            placeholder='0'
                            error={errors.stockQty?.message}
                            type='number'
                            min='0'
                            disabled={isSubmitting}
                          />
                          <TextField
                            {...register('weight')}
                            label='Weight (g)'
                            placeholder='0'
                            type='number'
                            step='0.01'
                            min='0'
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image Uploader */}
                    <div className='w-80 flex-shrink-0'>
                      <div className='bg-gray-50 rounded-lg p-4'>
                        <h4 className='text-lg font-medium text-gray-900 mb-4'>
                          Variant Image
                        </h4>
                        <ImageUploader
                          name='variantImage'
                          label='Upload variant image'
                          imageUrl={imageUrl}
                          onChange={(file) => {
                            setFile(file);
                          }}
                          maxFileSizeMB={2}
                          className='w-full'
                        />
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
                    <Button
                      type='button'
                      onClick={onClose}
                      disabled={isSubmitting}
                      className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      disabled={isSubmitting || (!isDirty && !file)}
                      className={clsx(
                        'px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2',
                        'bg-indigo-600 hover:bg-indigo-700'
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                          {variant ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <CheckIcon className='h-4 w-4' />
                          {variant ? 'Update Variant' : 'Create Variant'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
