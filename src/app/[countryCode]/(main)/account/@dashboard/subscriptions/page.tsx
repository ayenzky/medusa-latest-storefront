import { Metadata } from "next"

import SubscriptionOrderOverview from "@modules/account/components/subscription-overview"
import { notFound } from "next/navigation"
import { listSubscriptions } from "@lib/data/orders"
import Divider from "@modules/common/components/divider"
import TransferRequestForm from "@modules/account/components/transfer-request-form"

export const metadata: Metadata = {
  title: "Subscriptions",
  description: "Overview of your previous subscriptions.",
}

export default async function Subscriptions() {
  const orders = await listSubscriptions()

  console.log("orderssss", orders)

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Subscriptions</h1>
        <p className="text-base-regular">
          View your previous orders and their status. You can also create
          returns or exchanges for your orders if needed.
        </p>
      </div>
      <div>
        <SubscriptionOrderOverview orders={orders} />
        <Divider className="my-16" />
        <TransferRequestForm />
      </div>
    </div>
  )
}
