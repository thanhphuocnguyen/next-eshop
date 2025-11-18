import { z } from 'zod';

export const BaseOptionSchema = z.object({
  name: z.string(),
});

export const NumIdOptionSchema = BaseOptionSchema.extend({
  id: z.number(),
});

export const StrIdOptionSchema = BaseOptionSchema.extend({
  id: z.string(),
});

export enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Delivering = 'delivering',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
  Refunded = 'refunded',
  Completed = 'completed',
}
