"use client"

import { XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Help from "@modules/subscription/components/help"
import Items from "@modules/subscription/components/items"
import OrderDetails from "@modules/subscription/components/order-details"
import OrderSummary from "@modules/subscription/components/order-summary"
import ShippingDetails from "@modules/subscription/components/shipping-details"
import React from "react"

type SubscriptionDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const SubscriptionDetailsTemplate: React.FC<SubscriptionDetailsTemplateProps> = ({
  order,
}) => {
  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-2xl-semi">Subscription details</h1>
        <LocalizedClientLink
          href="/account/subscriptions"
          className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
          data-testid="back-to-overview-button"
        >
          <XMark /> Back to overview
        </LocalizedClientLink>
      </div>
      <div
        className="flex flex-col gap-4 h-full bg-white w-full"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus />
        <Items order={order} />
        <ShippingDetails order={order} />
        <OrderSummary order={order} />
        {/* <Help /> */}
      </div>
    </div>
  )
}

export default SubscriptionDetailsTemplate