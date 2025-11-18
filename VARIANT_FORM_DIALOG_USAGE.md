# VariantFormDialog Component Usage

## Overview

The `VariantForm` component has been converted into a dialog-based component called `VariantFormDialog` for creating and editing product variants. The original `VariantForm` component is still available for backward compatibility.

## Features

✅ **Dialog-based UI** - Professional modal interface with backdrop and animations
✅ **Create/Edit modes** - Single component handles both variant creation and editing
✅ **Form validation** - Built-in validation with Zod schema
✅ **Loading states** - Proper loading indicators during API calls
✅ **Responsive design** - Works well on desktop and mobile devices
✅ **Accessibility** - Proper focus management and keyboard navigation
✅ **Error handling** - Toast notifications for success and error states

## Usage

### Basic Implementation

```tsx
import { VariantFormDialog } from '@/app/admin/products/_components';
import { useState } from 'react';

function MyComponent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<VariantDetailModel | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitVariant = async (data: VariantModelFormOut) => {
    setIsSubmitting(true);
    try {
      // Your API call logic here
      await createOrUpdateVariant(data);
      toast.success('Variant saved successfully');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save variant');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsDialogOpen(true)}>
        Create Variant
      </button>
      
      <VariantFormDialog
        open={isDialogOpen}
        variant={selectedVariant} // undefined for create mode
        productAttributes={productAttributes}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmitVariant}
        isLoading={isSubmitting}
      />
    </>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | ✅ | Controls dialog visibility |
| `variant` | `VariantDetailModel \| undefined` | ❌ | Existing variant for edit mode (undefined for create) |
| `productAttributes` | `AttributeFormModel[]` | ✅ | Available product attributes for variant |
| `onClose` | `() => void` | ✅ | Callback when dialog should close |
| `onSubmit` | `(data: VariantModelFormOut) => Promise<void>` | ✅ | Callback when form is submitted |
| `isLoading` | `boolean` | ❌ | Shows loading state (default: false) |

### Data Types

```tsx
interface VariantDetailModel {
  id: string;
  price: number;
  stockQty: number;
  sku: string;
  weight: number;
  isActive: boolean;
  attributes: ProductVariantAttributeModel[];
}

interface AttributeFormModel {
  id: number;
  name: string;
  values: AttributeValueModel[];
}

type VariantModelFormOut = {
  id?: string;
  price: number;
  stockQty: number;
  weight?: number | null;
  isActive: boolean;
  attributes: {
    id?: string;
    name?: string;
    valueObject: {
      id?: number;
      name?: string;
    };
  }[];
};
```

## Integration with VariantList

The `VariantList` component has been updated to use the new dialog:

```tsx
// Updated VariantList automatically includes the dialog
<VariantList
  productDetail={productDetail}
  productAttributes={productAttributes}
/>
```

The VariantList component now:
- Shows "Add New Variant" button that opens the dialog
- Has edit buttons for each variant that open the dialog in edit mode
- Handles all API calls and state management internally

## Form Fields

The dialog includes the following form fields:

### Attribute Selection
- Dynamic attribute dropdowns based on `productAttributes`
- Each attribute shows available values to choose from
- Required validation for attribute values

### Basic Information
- **Price**: Number input with validation (required, > 0)
- **Stock Quantity**: Number input with validation (required, >= 0)
- **Weight**: Optional number input for product weight in grams

### Status
- **Active/Inactive Toggle**: Switch to control variant availability

## Styling

The dialog uses Tailwind CSS classes and follows the existing design system:

- **Colors**: Indigo for primary actions, gray for secondary
- **Layout**: Responsive grid layout that adapts to screen size
- **Animations**: Smooth transitions using HeadlessUI Transition components
- **Typography**: Consistent font sizes and weights

## API Integration

The dialog expects the parent component to handle API calls. Example integration:

```tsx
const handleSubmitVariant = async (data: VariantModelFormOut) => {
  setIsSubmitting(true);
  try {
    const url = selectedVariant
      ? `api/products/${productId}/variants/${selectedVariant.id}`
      : `api/products/${productId}/variants`;
    
    const method = selectedVariant ? 'PUT' : 'POST';
    
    const response = await clientSideFetch(url, {
      method,
      body: data,
    });

    if (response.error) {
      throw new Error(response.error);
    }

    toast.success(`Variant ${selectedVariant ? 'updated' : 'created'} successfully`);
    mutate(); // Refresh data
    handleCloseDialog();
  } catch (error) {
    toast.error(`Failed to ${selectedVariant ? 'update' : 'create'} variant`);
  } finally {
    setIsSubmitting(false);
  }
};
```

## Migration from Old VariantForm

If you're migrating from the old `VariantForm` component:

### Before
```tsx
<VariantForm productAttributes={attributes} />
```

### After
```tsx
<VariantFormDialog
  open={isOpen}
  variant={variantToEdit}
  productAttributes={attributes}
  onClose={() => setIsOpen(false)}
  onSubmit={handleSubmit}
  isLoading={isSubmitting}
/>
```

## Backward Compatibility

The original `VariantForm` component is still available and exported from the same file for backward compatibility. However, it's recommended to migrate to the new dialog-based approach for better UX.

## Notes

- The dialog automatically resets the form when opened/closed
- Form validation is handled by Zod schema (`VariantFormSchema`)
- All form state is managed internally by react-hook-form
- The component uses HeadlessUI for accessible dialog implementation
- Toast notifications should be handled by the parent component