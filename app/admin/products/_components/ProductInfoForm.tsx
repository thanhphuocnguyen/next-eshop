'use client';
import React, { useEffect } from 'react';
import { TextField } from '@/app/components/FormFields';
import { LoadingSpinner } from '@/app/components/Common/Loadings/Loading';
import { StyledComboBoxController } from '@/app/components/FormFields/StyledComboBoxController';
import { StyledMultipleComboBox } from '@/app/components/FormFields/StyledMultipleComboBox';
import { TiptapController } from '@/app/components/Common';
import { Field, Label, Switch } from '@headlessui/react';
import { useCollections } from '../../hooks/useCollections';
import { useBrands } from '../../hooks/useBrands';
import { useAttributes } from '../../hooks/useAttributes';
import { useCategories } from '../../hooks/useCategories';
import {
  ManageProductModel,
  ProductModelForm,
  ProductModelFormOut,
} from '@/app/lib/definitions';
import { useFormContext } from 'react-hook-form';
import clsx from 'clsx';
import ImageUploader from '@/app/components/ImageUploader';

export const ProductInfoForm: React.FC<{
  file: File | null;
  setFile: (file: File | null) => void;
  productDetail?: ManageProductModel;
}> = ({ setFile, productDetail }) => {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { collections, isLoading: collectionLoading } = useCollections();
  const { brands, isLoading: brandsLoading } = useBrands();
  const { attributes, attributesLoading } = useAttributes();
  const { register, control, watch, formState, setValue } = useFormContext<
    ProductModelForm,
    unknown,
    ProductModelFormOut
  >();

  useEffect(() => {
    if (!productDetail && categories && categories.length > 0) {
      setValue('category', categories[0], {
        shouldDirty: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  useEffect(() => {
    if (!productDetail && collections && collections.length > 0) {
      setValue('collection', collections[0], {
        shouldDirty: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collections]);

  useEffect(() => {
    if (!productDetail && brands && brands.length > 0) {
      setValue('brand', brands[0], {
        shouldDirty: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brands]);

  return (
    <>
      <div className='flex gap-4 items-center mb-4'>
        <h2 className='text-xl font-bold text-primary'>Product Information</h2>
        <Field className='flex items-center gap-2'>
          <Switch
            checked={watch('isActive')}
            onChange={(value) => setValue('isActive', value)}
            className={({ checked }) =>
              clsx(
                'relative inline-flex h-6 w-11 items-center rounded-full',
                checked ? 'bg-primary' : 'bg-gray-200'
              )
            }
          >
            {({ checked }) => (
              <span
                className={clsx(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition',
                  checked ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            )}
          </Switch>
          <Label htmlFor='isActive' className='font-semibold cursor-pointer'>
            Active
          </Label>
        </Field>
      </div>
      <div className='flex gap-x-4'>
        {/* Basic Information */}
        <div className='grid grid-cols-2 gap-4 flex-1'>
          <TextField
            label={'Product name'}
            {...register('name')}
            error={formState.errors.name?.message}
            placeholder='Enter product name...'
            type='text'
            required
          />
          <TextField
            {...register('sku')}
            label={'Sku'}
            placeholder='Enter sku...'
            type='text'
            error={formState.errors.sku?.message}
          />
          <TextField
            {...register('price', {
              valueAsNumber: true,
            })}
            label={'Price'}
            placeholder='Enter price...'
            type='number'
            error={formState.errors.price?.message}
          />
          <TextField
            label={'Slug'}
            placeholder='Enter slug...'
            type='text'
            error={formState.errors.slug?.message}
            {...register('slug')}
          />
          {attributesLoading ? (
            <div className='flex justify-center items-center'>
              <LoadingSpinner />
            </div>
          ) : attributes ? (
            <StyledMultipleComboBox<{
              id: number;
              name: string;
            }>
              label='Select an attribute'
              setSelected={(values) => {
                setValue(
                  'attributes',
                  values.map((e) => e.id),
                  {
                    shouldDirty: false,
                  }
                );
              }}
              options={attributes}
              getDisplayValue={(option) => {
                return option?.name || '';
              }}
              selected={watch('attributes', []).map((e) => {
                const attribute = attributes.find((a) => a.id === e)!;
                return {
                  id: attribute.id,
                  name: attribute.name,
                };
              })}
            />
          ) : null}
          {/* Category, Collections, Brand */}
          {categoriesLoading ? (
            <div className='flex justify-center items-center'>
              <LoadingSpinner />
            </div>
          ) : (
            <StyledComboBoxController
              control={control}
              name='category'
              label='Category'
              error={formState.errors.category?.message}
              options={
                categories?.map((e) => ({
                  id: e.id,
                  name: e.name,
                })) ?? []
              }
            />
          )}
          {brandsLoading ? (
            <div className='flex justify-center items-center'>
              <LoadingSpinner />
            </div>
          ) : (
            <StyledComboBoxController
              name='brand'
              nullable
              control={control}
              error={formState.errors.brand?.message}
              label='Brand'
              options={
                brands?.map((e) => ({
                  id: e.id,
                  name: e.name,
                })) ?? []
              }
            />
          )}
          {collectionLoading ? (
            <div className='flex justify-center items-center'>
              <LoadingSpinner />
            </div>
          ) : (
            <StyledComboBoxController
              control={control}
              name='collection'
              nullable
              label='Collection'
              error={formState.errors.brand?.message}
              options={
                collections?.map((e) => ({
                  id: e.id,
                  name: e.name,
                })) ?? []
              }
            />
          )}
        </div>
        <div className='w-1/3'>
          <ImageUploader
            imageUrl={productDetail?.imageUrl}
            name='image'
            label='Upload image'
            onChange={(newFile) => {
              setFile(newFile);
            }}
            maxFileSizeMB={2.5}
          />
        </div>
      </div>
      {/* Short Description */}
      <Field className='w-full my-4'>
        <TextField
          label='Short Description'
          {...register('shortDescription')}
          placeholder='Enter short product description...'
          type='text'
          error={formState.errors.shortDescription?.message}
          className='w-full'
        />
      </Field>
      {/* Description */}
      <Field className='w-full'>
        <Label className='font-semibold'>Description</Label>
        <TiptapController
          name='description'
          control={control}
          error={formState.errors.description?.message}
        />
      </Field>
    </>
  );
};
