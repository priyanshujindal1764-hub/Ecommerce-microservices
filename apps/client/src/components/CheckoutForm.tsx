"use client";

import { ShippingFormInputs } from "@repo/types";

import { PaymentElement, useCheckout } from '@stripe/react-stripe-js/checkout';
import { ConfirmError } from "@stripe/stripe-js";
import { useState } from "react";

const CheckoutForm = ({
  shippingForm,
}: {
  shippingForm: ShippingFormInputs;
}) => {
  const checkoutState = useCheckout();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ConfirmError | null>(null);

  const handleClick = async () => {
    setLoading(true);
    if (checkoutState.type !== "success") {
      return null;
    }
    await checkoutState.checkout.updateEmail(shippingForm.email);
    await checkoutState.checkout.updateShippingAddress({
      name: "shipping_address",
      address: {
        line1: shippingForm.address,
        city: shippingForm.city,
        country: "US",
      },
    });

    const res = await checkoutState.checkout.confirm();
    if (res.type === "error") {
      setError(res.error);
    }
    setLoading(false);
  };
  return (
    <form>
      <PaymentElement options={{ layout: "accordion" }} />
      <button type="button" disabled={loading} onClick={handleClick}>
        {loading ? "Loading..." : "Pay"}
      </button>
      {error && <div className="">{error.message}</div>}
    </form>
  );
};

export default CheckoutForm;