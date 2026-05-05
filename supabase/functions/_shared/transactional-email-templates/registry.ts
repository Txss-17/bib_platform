/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as sellerWelcome } from './seller-welcome.tsx'
import { template as kycSubmitted } from './kyc-submitted.tsx'
import { template as newOrderNotification } from './new-order-notification.tsx'
import { template as customerOrderConfirmation } from './customer-order-confirmation.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'seller-welcome': sellerWelcome,
  'kyc-submitted': kycSubmitted,
  'new-order-notification': newOrderNotification,
  'customer-order-confirmation': customerOrderConfirmation,
}