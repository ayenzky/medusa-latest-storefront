import { clx } from "@medusajs/ui"
import { useState } from "react"
import { RadioGroup, Label, Text } from "@medusajs/ui"
import { getProduct } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { useQuery } from "@tanstack/react-query"

type PurchaseOption = "one-time" | "subscription"

export default function ProductSubscription({
  product,
  variant,
  variantSubscription,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  variantSubscription?: any
}) {
  const [purchaseOption, setPurchaseOption] = useState<PurchaseOption>("one-time")

  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })
  
  const { data: subscriptionProduct } = useQuery({    
    queryKey: ["subscriptionProduct", product.id],
    queryFn: () => getProduct(product.id).then((product) => {
      return product
    }),
    refetchInterval: (data) => {
      console.log("data", data)
      if (data) {
        return false
      }
      return 1000 
    },
  })

  console.log("subscriptionProductzz", subscriptionProduct)
  console.log("variant", variant)
  
  const selectedPrice = variant ? variantPrice : cheapestPrice

    

  const subscriptionPricez = variantSubscription && variantSubscription?.prices[variant?.calculated_price?.currency_code as string].toFixed(2)  / 100


  console.log("subscriptionPricez", subscriptionPricez)
  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  // Get subscription price from the data if available, or calculate a 20% discount
  let subscriptionPriceNumber = selectedPrice.calculated_price_number * 0.8;
  
  // If we have subscription data and it has a price field for this variant, use it
  if (subscriptionProduct && variant) {
    try {
      // Try to safely get variant subscription price if it exists
      const subscriptionData = subscriptionProduct as any;
      if (subscriptionData?.variants && Array.isArray(subscriptionData.variants)) {
        const matchingVariant = subscriptionData.variants.find(
          (v: any) => v.id === variant.id
        );
        
        if (matchingVariant?.subscription_price) {
          subscriptionPriceNumber = matchingVariant.subscription_price;
        }
      }
    } catch (error) {
      console.error("Error processing subscription data:", error);
      // Fall back to the default 20% discount calculation
    }
  }

  // Calculate subscription price (using either API data or 20% discount)
  const subscriptionPrice = {
    ...selectedPrice,
    calculated_price: `${subscriptionPriceNumber.toFixed(2)} ${selectedPrice.currency_code}`,
    calculated_price_number: subscriptionPriceNumber
  }

  console.log("subscriptionPrice", subscriptionPrice)
  // Select the appropriate price based on the purchase option
  const displayPrice = purchaseOption === "subscription" ? subscriptionPrice : selectedPrice

  const handlePurchaseOptionChange = (value: string) => {
    setPurchaseOption(value as PurchaseOption)
  }

  return (
    <div className="flex flex-col text-ui-fg-base gap-y-4">
      <div className="flex flex-col">
        <span
          className={clx("text-xl-semi", {
            "text-ui-fg-interactive": displayPrice.price_type === "sale",
          })}
        >
          {!variant && "From "}
          <span
            data-testid="product-price"
            data-value={displayPrice.calculated_price_number}
          >
            {displayPrice.calculated_price}
          </span>
          {purchaseOption === "subscription" && <span className="text-sm ml-1">/month</span>}
        </span>
        {displayPrice.price_type === "sale" && (
          <>
            <p>
              <span className="text-ui-fg-subtle">Original: </span>
              <span
                className="line-through"
                data-testid="original-product-price"
                data-value={displayPrice.original_price_number}
              >
                {displayPrice.original_price}
              </span>
            </p>
            <span className="text-ui-fg-interactive">
              -{displayPrice.percentage_diff}%
            </span>
          </>
        )}
      </div>

      <div className="rounded-lg border border-ui-border-base p-4">
        <RadioGroup 
          value={purchaseOption} 
          onValueChange={handlePurchaseOptionChange}
          className="flex flex-col gap-y-3"
          disabled={!variant}
        >
          <Text className="font-medium text-sm text-ui-fg-base">How would you like to pay?</Text>
          
          <div className="flex flex-col gap-y-2">
          <div className={`flex flex-col items-start gap-3 p-3 rounded-md hover:bg-ui-bg-subtle cursor-pointer ${purchaseOption === "one-time" ? "bg-ui-bg-subtle" : ""}`} onClick={() => setPurchaseOption("one-time")}>
            <div className="flex items-start gap-x-3">
              <RadioGroup.Item value="one-time" id="one-time" className="mt-0.5" />
              <div className="flex flex-col">
                <Label htmlFor="one-time" className="cursor-pointer font-medium">
                  One-time purchase
                </Label>
                <Text className="text-sm text-ui-fg-subtle">
                  Pay once and own it forever
                </Text>
              </div>
              
            </div>
            <div className="ml-auto">
                <Text className="font-medium">{selectedPrice.calculated_price}</Text>
              </div>
            </div>
            
            <div className={`flex flex-col items-start gap-3 p-3 rounded-md hover:bg-ui-bg-subtle cursor-pointer ${purchaseOption === "subscription" ? "bg-ui-bg-subtle" : ""}`} onClick={() => setPurchaseOption("subscription")}>
              <div className="flex items-start gap-x-3">
              <RadioGroup.Item value="subscription" id="subscription" className="mt-0.5" disabled={!variant} />
                <div className="flex flex-col">
                <Label htmlFor="subscription" className="cursor-pointer font-medium flex items-center">
                  Monthly subscription
                  
                </Label>
                <Text className="text-sm text-ui-fg-subtle">
                  Flexible plan, cancel anytime
                </Text>
              </div>
              
            </div>
            <div className="w-full flex justify-end ml-auto gap-x-2">
            <span className="ml-2 text-xs bg-ui-bg-interactive text-ui-fg-on-interactive px-2 py-0.5 rounded-full">Save 20%</span>
                <Text className="font-medium">{subscriptionPrice.calculated_price}<span className="text-sm text-ui-fg-subtle">/month</span></Text>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}
