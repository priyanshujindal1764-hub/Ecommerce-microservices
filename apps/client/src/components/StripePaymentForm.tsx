"use client";

import { loadStripe } from "@stripe/stripe-js";
import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { CartItemsType, ShippingFormInputs } from "@repo/types";
import CheckoutForm from "./CheckoutForm";
import useCartStore from "@/stores/cartStore";

const stripe = loadStripe(
  "pk_test_51StkCcJag0W3Aj8HwUzEK6ddcEzHQptJiSk0TTrwg8W0NHviPLvOwwbccQP759M4noulX8bAfb02ypukhnFjrT8S00jG83iUtK"
);

const fetchClientSecret = async (cart: CartItemsType, token: string) => {
  return fetch(
    `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/sessions/create-checkout-session`,
    {
      method: "POST",
      body: JSON.stringify({
        cart,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => response.json())
    .then((json) => json.checkoutSessionClientSecret);
};


const StripePaymentForm = ({
  shippingForm,
}: {
  shippingForm: ShippingFormInputs;
}) => {
  const { cart } = useCartStore();
  const [token, setToken] = useState<string | null>(null);
  const { getToken } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const authToken = await getToken();
      if (!authToken) return;

      setToken(authToken);

      const secret = await fetchClientSecret(cart, authToken);
      setClientSecret(secret);
    };

    init();
  }, [cart, getToken]);


  if (!token) {
    return <div className="">Loading...</div>;
  }
  if (!clientSecret) {
    return <div className="">Loading...</div>;
  }

  return (
    <CheckoutProvider
      stripe={stripe}
      options={{ clientSecret }}
    >
      <CheckoutForm shippingForm={shippingForm} />
    </CheckoutProvider>
  );
};

export default StripePaymentForm;