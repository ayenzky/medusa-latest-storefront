"use client"

import { Button, clx, Heading, Text, RadioGroup, Label } from "@medusajs/ui"
import { CheckCircleSolid } from "@medusajs/icons"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import Divider from "../../../common/components/divider"
import Input from "../../../common/components/input"
import NativeSelect from "../../../common/components/native-select"
import { capitalize } from "lodash"
import { updateSubscriptionData } from "../../../../lib/data/cart"
import { SubscriptionInterval, SubscriptionIntervalType } from "../../../../types/global"

const SubscriptionForm = () => {
  const [interval, setInterval] = useState<SubscriptionIntervalType>(
    SubscriptionInterval.MONTHLY
  )
  const [period, setPeriod] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [paymentType, setPaymentType] = useState("one-time")

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "subscription"

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "subscription"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    if (paymentType === "subscription") {
      updateSubscriptionData(interval, period)
      .then(() => {
        setIsLoading(false)
        router.push(pathname + "?step=delivery", { scroll: false })
      })
    } else {
      setIsLoading(false)
      router.push(pathname + "?step=delivery", { scroll: false })
    }
    
   
  }

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen,
            }
          )}
        >
          Subscription Details
          {!isOpen && <CheckCircleSolid />}
        </Heading>
        {!isOpen && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-payment-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          <div className="flex flex-col gap-4">
          <RadioGroup onValueChange={(value) => setPaymentType(value)}>
              <div className="flex items-center gap-x-3">
                <RadioGroup.Item value="one-time" id="one-time" />
                <Label htmlFor="one-time" weight="plus">
                  One time payment
                </Label>
              </div>
              <div className="flex items-center gap-x-3">
                <RadioGroup.Item value="subscription" id="subscription" />
                <Label htmlFor="subscription" weight="plus">
                  Subscription
                </Label>
              </div>
            </RadioGroup>
            
            {paymentType === "subscription" && (
              <>
                <NativeSelect 
                  placeholder="Interval" 
                  value={interval} 
                  onChange={(e) => 
                    setInterval(e.target.value as SubscriptionIntervalType)
                  }
                  required
                  autoComplete="interval"
                >
                  {Object.values(SubscriptionInterval).map(
                    (intervalOption, index) => (
                      <option key={index} value={intervalOption}>
                        {capitalize(intervalOption)}
                      </option>
                    )
                  )}
                </NativeSelect>
                <Input
                  label="Period"
                  name="period"
                  autoComplete="period"
                  value={period}
                  onChange={(e) => 
                    setPeriod(parseInt(e.target.value))
                  }
                  required
                  type="number"
                />
              </>
            )}
          </div>
          
          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!interval || !period}
          >
            Continue to delivery
          </Button>
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default SubscriptionForm
