'use client';

import { ADMIN_API_PATHS } from '@/app/lib/constants/api';
import {
  AttributeFormModel,
  AttributeFormSchema,
  AttributeValueModel,
} from '@/app/lib/definitions';

import { Button, Input } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { use, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { clientSideFetch } from '@/app/lib/api/apiClient';
import { AttrValueModal } from './_components/AddValueModal';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const form = useForm<AttributeFormModel>({
    resolver: zodResolver(AttributeFormSchema),
    defaultValues: {
      name: '',
      values: [],
    },
  });

  // Modal state
  const [selectedVal, setSelectedVal] = useState<undefined | null | number>(
    undefined
  );

  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    undefined
  );
  const { register, control, reset, handleSubmit } = form;

  const { fields, update, append, remove } = useFieldArray({
    control,
    name: 'values',
    keyName: 'fieldId',
  });

  const { data: attribute } = useSWR(
    id ? ADMIN_API_PATHS.ATTRIBUTE.replace(':id', id) : null,
    async (url) => {
      const response = await clientSideFetch<AttributeFormModel>(url, {});
      if (response.error) {
        toast('Failed to fetch attribute', { type: 'error' });
        return;
      }
      return response.data;
    },
    {
      refreshInterval: 0,
      dedupingInterval: 60000, // 1 minute deduplication
    }
  );

  async function onAdd(value: string) {
    try {
      const resp = await clientSideFetch<AttributeValueModel>(
        ADMIN_API_PATHS.CREATE_ATTRIBUTE_VALUE.replace(':id', id),
        {
          method: 'POST',
          body: { value: value },
        }
      );

      const val = resp.data;
      append({ id: val.id, value: val.value || '' });
      toast.success('Value added successfully');
    } catch (error) {
      console.log(error);
      toast.error('Failed to add value');
    }
  }

  async function onUpdate(value: string) {
    if (!selectedVal) return;
    const idx = fields.findIndex((f) => f.id === selectedVal);
    try {
      const resp = await clientSideFetch<AttributeValueModel>(
        ADMIN_API_PATHS.UPDATE_ATTRIBUTE_VALUE.replace(':id', id).replace(
          ':valueId',
          selectedVal.toString()
        ),
        {
          method: 'PUT',
          body: { value: value },
        }
      );
      const val = resp.data;
      update(idx, { id: val.id, value: val.value || '' });
      setSelectedVal(undefined);
      toast.success('Value updated successfully');
    } catch (error) {
      console.log(error);
      toast.error('Failed to update value');
    }
  }

  async function onRemove(idx: number) {
    try {
      await clientSideFetch(
        ADMIN_API_PATHS.DELETE_ATTRIBUTE_VALUE.replace(':id', id).replace(
          ':valueId',
          fields[idx].id!.toString()
        ),
        {
          method: 'DELETE',
        }
      );
      toast.success('Value removed successfully');
      setSelectedVal(undefined);
      setSelectedValue(undefined);
    } catch (error) {
      console.log(error);
    }
  }

  async function submitHandler(data: AttributeFormModel) {
    const response = await clientSideFetch<AttributeFormModel>(
      ADMIN_API_PATHS.ATTRIBUTE.replace(':id', id),
      {
        method: 'PUT',
        body: data,
      }
    );
    if (response.error) {
      toast('Failed to update attribute', { type: 'error' });
      return;
    }
    toast('Attribute updated successfully', { type: 'success' });
    reset(response.data);
  }

  useEffect(() => {
    if (attribute) {
      reset(attribute);
    }
  }, [attribute, reset]);

  return (
    <div style={{ padding: 20 }}>
      <Link
        href='/admin/attributes'
        className='inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm mb-4'
      >
        <ArrowLeftIcon style={{ width: 20, height: 20, marginRight: 8 }} />
        Back to Attributes
      </Link>
      <form onSubmit={handleSubmit(submitHandler)}>
        <div style={{ marginBottom: 16 }}>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Name
          </label>
          <Input
            {...register('name')}
            className='block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500'
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <label className='text-sm font-medium text-gray-700'>Values</label>
            <Button
              type='button'
              onClick={() => setSelectedVal(null)}
              className='px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            >
              Add Value
            </Button>
          </div>
          <ul style={{ marginTop: 8 }}>
            {fields.map((value, idx) => {
              return (
                <li
                  key={value.fieldId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 8,
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                  }}
                >
                  <span className='flex-1 text-sm font-medium text-gray-900'>
                    {value.value}
                  </span>
                  <Button
                    type='button'
                    onClick={() => {
                      setSelectedVal(value.id);
                      setSelectedValue(value.value);
                    }}
                    className='px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  >
                    Edit
                  </Button>
                  <Button
                    type='button'
                    onClick={() => {
                      onRemove(idx).then(() => {
                        remove(idx);
                      });
                    }}
                    className='px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  >
                    Remove
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      </form>

      {/* Add Value Modal */}
      {selectedVal !== undefined && (
        <AttrValueModal
          valId={selectedVal}
          onSubmit={selectedVal === null ? onAdd : onUpdate}
          value={selectedValue}
          onClose={() => {
            setSelectedVal(undefined);
          }}
        />
      )}
    </div>
  );
}
