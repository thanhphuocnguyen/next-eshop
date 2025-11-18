'use client';
import React from 'react';
import clsx from 'clsx';
import { Field, Switch } from '@headlessui/react';
import { useForm, useWatch } from 'react-hook-form';
import {
  VariantFormSchema,
  VariantModelForm,
  VariantModelFormOut,
} from '@/app/lib/definitions';
import { TextField } from '@/app/components/FormFields';
import { StyledComboBoxController } from '@/app/components/FormFields/StyledComboBoxController';
import { useAttributes } from '../../hooks/useAttributes';
import { zodResolver } from '@hookform/resolvers/zod';

interface AttributeFormProps {
  productAttributes: number[];
}
export const VariantForm: React.FC<AttributeFormProps> = ({
  productAttributes,
}) => {
  const {
    control,
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<VariantModelForm, unknown, VariantModelFormOut>({
    resolver: zodResolver(VariantFormSchema),
    defaultValues: {
      attributes: [],
      id: undefined,
      isActive: true,
      price: 0,
      sku: '',
      stockQty: -1,
      weight: -1,
    },
  });
  const { attributes } = useAttributes();

  const isActive = useWatch({
    control,
    name: `isActive`,
  });

  return (
    <div className='w-full'>
      <div className='flex w-full justify-between px-2 py-1 text-left mb-0'>
        <div className='flex items-center gap-5'>
          <span className='text-lg font-semibold'>
            {getValues('sku') ?? `New Variant`}
          </span>
          <Field className='flex items-center gap-2'>
            <Switch
              checked={!!isActive}
              onChange={(checked) => setValue(`isActive`, checked)}
              className={clsx(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isActive ? 'bg-primary' : 'bg-gray-200'
              )}
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
              className='font-semibold cursor-pointer'
              onClick={() => {
                setValue(`isActive`, !isActive);
              }}
            >
              Active
            </span>
          </Field>
        </div>
        <div className='flex items-center'>
          <button
            type='button'
            className={clsx(
              'btn btn-danger btn-sm transition-all duration-300 hover:scale-105'
            )}
            onClick={() => {}}
          >
            Remove
          </button>
        </div>
      </div>

      <div className='px-2 pt-2 pb-0'>
        <div className='grid grid-cols-5 gap-x-3'>
          {productAttributes?.map((attribute, idx) => {
            const attr = attributes?.find((e) => e.id === attribute);
            return attribute ? (
              <StyledComboBoxController
                control={control}
                key={attribute}
                error={errors.attributes?.[idx]?.valueObject?.id?.message}
                getDisplayValue={(attrOpt) =>
                  attr && attr.name.toLowerCase().startsWith('color')
                    ? attrOpt?.name
                    : attrOpt.code
                }
                name={`attributes.${idx}.valueObject`}
                label={attr?.name ?? ''}
                options={
                  attributes?.find((e) => e.id === attr?.id)?.values ?? []
                }
              />
            ) : null;
          })}
          <TextField
            {...register(`price`)}
            label='Price'
            placeholder='Enter Price'
            error={errors.price?.message}
            type='number'
            disabled={false}
          />
          <TextField
            {...register(`stockQty`)}
            label='Stock'
            placeholder='Enter Stock'
            error={errors.stockQty?.message}
            type='number'
            disabled={false}
          />
          <TextField
            {...register(`weight`)}
            label='Weight'
            placeholder='Enter Weight'
            type='number'
            disabled={false}
          />
        </div>
      </div>
    </div>
  );
};
