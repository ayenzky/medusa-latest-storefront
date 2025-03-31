import { clx } from "@medusajs/ui"
import { useMemo, useState } from "react"
import { RadioGroup, Label, Text, Button, Input } from "@medusajs/ui"
import { getProduct } from "@lib/data/products"
import { getCurrency } from "@lib/data/regions"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { useQuery } from "@tanstack/react-query"
import { Minus, Plus } from "@medusajs/icons"

type PurchaseOption = "one-time" | "subscription"

export default function ProductPrice({
  product,
  variant,
  variantSubscription,
  purchaseOption,
  setPurchaseOption,
  quantity,
  setQuantity,
  subscriptionVariant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  variantSubscription?: any
  purchaseOption: PurchaseOption
  setPurchaseOption: (purchaseOption: PurchaseOption) => void
  quantity: number
  setQuantity: (quantity: number) => void
  subscriptionVariant: any
}) {
  // const [purchaseOption, setPurchaseOption] = useState<PurchaseOption>("one-time")
  

  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })
  
  // const { data: subscriptionProduct } = useQuery({    
  //   queryKey: ["subscriptionProduct", product.id],
  //   queryFn: () => getProduct(product.id).then((product) => {
  //     return product
  //   }),
  //   refetchInterval: (data) => {
  //     console.log("data", data)
  //     if (data) {
  //       return false
  //     }
  //     return 1000 
  //   },
  // })

  const { data: currency } = useQuery({
    queryKey: ["currency"],
    queryFn: () => getCurrency(selectedPrice?.currency_code as string),
  })

  console.log("subscriptionVariant Pricey", subscriptionVariant && subscriptionVariant["subscription_product"]["subscriptionProduct"]!)
  console.log("variant", variant)
  console.log("currency", currency)
  const selectedPrice = variant ? variantPrice : cheapestPrice

  const { subscriptionPlan } = subscriptionVariant && subscriptionVariant["subscription_product"] || {}
  const { subscriptionProduct } = subscriptionVariant && subscriptionVariant["subscription_product"] || {}

    

  const subscriptionPricez = variantSubscription && variantSubscription?.prices[variant?.calculated_price?.currency_code as string].toFixed(2)

  console.log("subscriptionPricez subscriptionPricez", variantSubscription)

  const subscription_price = useMemo(() => {
    return variantSubscription && variantSubscription?.prices[variant?.calculated_price?.currency_code as string].toFixed(2)
  }, [variantSubscription, variant, purchaseOption])


  console.log("subscription_price", subscriptionProduct)
  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  // Get subscription price from the data if available, or calculate a 20% discount
  let subscriptionPriceNumber = selectedPrice.calculated_price_number * 0.8;
  
  // If we have subscription data and it has a price field for this variant, use it
  if (subscriptionVariant && variant) {
    try {
      // Try to safely get variant subscription price if it exists
      const subscriptionData = subscriptionVariant as any;
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
  const subscriptionPrice = useMemo(() => {
    return {
      ...selectedPrice,
      calculated_price: `${currency?.symbol}${subscription_price}`,
      calculated_price_number: subscription_price
    }
  }, [currency, selectedPrice, subscription_price, purchaseOption])

  
  // Select the appropriate price based on the purchase option
  const displayPrice = purchaseOption !== "one-time" ? subscriptionPrice : selectedPrice


  console.log("displayPrice", selectedPrice)
  const handlePurchaseOptionChange = (value: string) => {
    console.log("valuesss", value)
    setPurchaseOption(value as PurchaseOption)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setQuantity(value)
    }
  }
  const incrementQuantity = () => {
    setQuantity(quantity + 1)
  }

  const decrementQuantity = () => {
    setQuantity(quantity - 1)
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
              <RadioGroup.Item value="one-time" id="one-time" className="mt-0.5" disabled={!variant} />
              <div className="flex flex-col">
                <Label htmlFor="one-time" className="cursor-pointer font-medium">
                  One-time purchase
                </Label>
                <Text className="text-sm text-ui-fg-subtle">
                  Pay once and own it forever
                </Text>
              </div>
              
            </div>
            <div className="w-full flex justify-end items-center gap-x-3">
              <Text className="font-medium">{selectedPrice.calculated_price}</Text>
            </div>
          </div>


          {subscriptionPlan && (

            subscriptionPlan.map((plan: any) => {

              const price = subscriptionProduct.find((p: any) => p.interval === plan.interval && p.variant_id === variant?.id)?.prices[variant?.calculated_price?.currency_code as string].toFixed(2)
              const defaultPrice = subscriptionProduct.find((p: any) => p.interval === plan.interval)?.prices[selectedPrice?.currency_code as string].toFixed(2)
              

              const calculatedPrice = price ? price : defaultPrice
              const discount = (Number(selectedPrice.calculated_price_number) - Number(calculatedPrice)) / Number(selectedPrice.calculated_price_number) * 100

              const selectedPlan = {
                ...selectedPrice,
                calculated_price: `${currency?.symbol}${calculatedPrice}`,
                calculated_price_number: calculatedPrice
              }

              console.log("price", discount)
              return  (
                <div key={plan.id}>
                  <div className={`flex flex-col items-start gap-3 p-3 rounded-md hover:bg-ui-bg-subtle cursor-pointer ${purchaseOption === plan.interval ? "bg-ui-bg-subtle" : ""}`} onClick={() => variant && setPurchaseOption(plan.interval)}>
                    <div className="flex items-start gap-x-3">
                    <RadioGroup.Item value={plan.interval} id={plan.interval} className="mt-0.5" disabled={!variant} />
                      <div className="flex flex-col">
                      <Label htmlFor={plan.interval} className="cursor-pointer font-medium flex items-center">
                        {plan.interval} subscription
                        
                      </Label>
                      <Text className="text-sm text-ui-fg-subtle">
                        Flexible plan, cancel anytime
                      </Text>
                    </div>
                    
                  </div>
                  <div className="w-full flex justify-end ml-auto gap-x-2">
                  <span className="ml-2 text-xs bg-ui-bg-interactive text-ui-fg-on-interactive px-2 py-0.5 text-white rounded-full">Save {Math.round(discount)}%</span>
                      <Text className="font-medium">{selectedPlan?.calculated_price}<span className="text-sm text-ui-fg-subtle">/{plan.interval}</span></Text>
                    </div>
                  </div>
                </div>
              )
            })

          )}

          </div>
        </RadioGroup>
      </div>

      <div className="flex items-center gap-x-2 mb-4">
        <div className="flex items-center gap-x-2 h-9">
          <Button 
            variant="transparent" 
            size="small" 
            className="h-full px-2 border border-ui-border-base rounded"
            onClick={(e) => {
              e.stopPropagation();
              decrementQuantity();
            }}
            disabled={quantity <= 1}
          >
            <Minus />
          </Button>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            onClick={(e) => e.stopPropagation()}
            className="w-20 h-full text-center border-none focus:ring-0 h-9"
          />
          <Button 
            variant="transparent" 
            size="small" 
            className="h-full px-2 border border-ui-border-base rounded"
            onClick={(e) => {
              e.stopPropagation();
              incrementQuantity();
            }}
          >
            <Plus />
          </Button>
        </div>
      </div>
    </div>
  )
}
