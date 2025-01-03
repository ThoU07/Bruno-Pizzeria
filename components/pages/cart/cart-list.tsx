"use client";

import { currency } from "@/shared/constants";
import CartEmpty from "./cart-empty";
import CartItem from "./cart-item";
import useCartStore from "@/lib/stores/use-cart-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/use-auth-store";
import { useMemo, useState } from "react";
import { EVoucherType } from "@/types/voucher";
import { getVoucherByCode } from "@/lib/actions/voucher.action";
import { toast } from "sonner";
import { Check, DollarSign, Landmark, Loader2 } from "lucide-react";
import {
  EDeliveryType,
  EOrderStatus,
  EPaymentMethod,
  EPaymentStatus,
  IOrder,
} from "@/types/order";
import { Checkbox } from "@/components/ui/checkbox";
import { ICartItem } from "@/types/cart-item";
import { cn } from "@/lib/utils";
import QRDialog from "./qr-dialog";
import { createOrderWithCartItems } from "@/lib/actions/order.action";
import { useHistoryOrder } from "@/lib/stores/use-history-order";

export default function CartList() {
  const { items, clearCart, getTotalPrice, cartStatus } = useCartStore();
  const { user } = useAuthStore();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryAddress, setAddress] = useState("");
  const [voucher, setVoucher] = useState("");
  const [deliveryType, setDeliveryType] = useState(EDeliveryType.SHIP);
  const [paymentMethod, setPaymentMethod] = useState(EPaymentMethod.CASH);
  const [qrCode, setQrCode] = useState({
    cartId: "",
    price: 0,
  });
  const { ids, setIds } = useHistoryOrder();

  const [isLoading, setLoading] = useState({
    checkVoucher: false,
    process: false,
  });
  const [discount, setDiscount] = useState({
    isValid: false,
    type: EVoucherType.PERCENTAGE,
    value: 0,
    code: "",
  });

  const finalPrice = useMemo(() => {
    if (discount.isValid) {
      // Kiểm tra loại voucher
      if (discount.type == EVoucherType.PERCENTAGE) {
        return getTotalPrice() - (getTotalPrice() * discount.value) / 100;
      } else {
        return getTotalPrice() - discount.value;
      }
    } else {
      // Nếu voucher không hợp lệ
      return getTotalPrice();
    }
  }, [items, discount]);

  const handleCheckVoucher = async () => {
    if (!voucher) {
      return toast.error("Voucher Code not provided");
    }
    setLoading({ ...isLoading, checkVoucher: true });
    try {
      const res = await getVoucherByCode(voucher);
      if (!res?.$id) {
        setDiscount((prev) => ({ ...prev, isValid: false }));
        return toast.error("Voucher is expired or invalid");
      }
      setDiscount({
        isValid: true,
        type: res.type,
        value: res.value,
        code: res.code,
      });
    } catch (error) {
      console.log(error);
      toast.error("Check voucher Error!");
    } finally {
      setLoading({ ...isLoading, checkVoucher: false });
    }
  };

  const handleProcess = async () => {
    if (!phoneNumber) return toast.warning("Please fill your phone number");
    if (deliveryType === EDeliveryType.SHIP && !deliveryAddress)
      return toast.warning("Please fill your address");
    if (!user && !name) return toast.warning("Please fill your name");

    setLoading({ ...isLoading, process: true });
    try {
      // Chuẩn hóa đầu vào
      // @ts-expect-error refactor relationship id only
      const cartItems: Omit<ICartItem, "$id">[] = items.map((item) => ({
        pizzas: item.pizzas.$id,
        selectedSize: item.selectedSize.$id,
        quantity: item.quantity,
        selectedToppings: item.selectedToppings.map((t) => t.$id),
        totalPrice: item.totalPrice,
      }));

      const isVoucherValid = await getVoucherByCode(voucher);
      if (isVoucherValid?.$id) {
        setDiscount({
          code: isVoucherValid.code,
          type: isVoucherValid.type,
          value: isVoucherValid.value,
          isValid: true,
        });
      }

      const prices = {
        totalPrice: finalPrice,
        discountPrice: isVoucherValid?.$id
          ? discount.type === EVoucherType.PERCENTAGE
            ? (finalPrice * discount.value) / 100
            : discount.value
          : 0,
        finalPrice:
          finalPrice -
          (isVoucherValid?.$id
            ? discount.type === EVoucherType.PERCENTAGE
              ? (finalPrice * discount.value) / 100
              : discount.value
            : 0),
      };

      const orderData: Omit<
        IOrder,
        "$createdAt" | "$updatedAt" | "$id" | "items"
      > = {
        name: user?.fullName || name,
        phoneNumber,
        deliveryAddress,
        deliveryType,
        paymentMethod,
        totalPrice: prices.totalPrice,
        discountPrice: prices.discountPrice,
        finalPrice: prices.finalPrice,
        // @ts-expect-error refactor
        appliedVoucher: isVoucherValid?.$id,
        status: EOrderStatus.PENDING,
        paymentStatus: EPaymentStatus.UNPAID,
      };

      const res = await createOrderWithCartItems(
        cartItems,
        orderData,
        user?.$id
      );

      if (paymentMethod === EPaymentMethod.BANKING) {
        setQrCode({
          cartId: res.cartItems[0].$id,
          price: prices.finalPrice,
        });
      }

      if (paymentMethod === EPaymentMethod.CASH) {
        toast.success(
          "Your order has been created! You can check your order history in your profile"
        );
      } else {
        console.log(res.cartItems[0].$id);
        setQrCode({
          cartId: res.cartItems[0].$id,
          price: prices.finalPrice,
        });
        toast.success("Order created! Please check you payment");
      }

      setIds([...ids, res.order.$id]);
    } catch (error) {
      console.log(error);
      toast.error("Create order Error!");
    } finally {
      setLoading({ ...isLoading, process: false });
    }
  };

  const handlePhoneChange = (e: string) => {
    const regex = /^[0-9\b]+$/;
    if (e.length === 0) setPhoneNumber(e);

    if (regex.test(e)) {
      setPhoneNumber(e);
    }
  };

  return items.length == 0 ? (
    <CartEmpty />
  ) : (
    <div>
      <QRDialog qrCode={qrCode} setQrCode={setQrCode} />
      <div className="space-y-4">
        {items.map((item) => {
          const itemKey = `${item.pizzas.$id}-${
            item.selectedSize.name
          }-${item.selectedToppings.map((t) => t.name).join("-")}`;

          return <CartItem item={item} key={itemKey} />;
        })}
      </div>
      <div className="h-[1px] bg-gray-200 mt-8 mb-1" />
      <div className="flex justify-end items-center mb-1">
        <button
          className="text-brand/80 hover:text-brand-100 transition-colors"
          onClick={clearCart}
          type="button"
        >
          Delete All Items
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="justify-between flex items-center gap-2">
          <span className="font-semibold">Name: </span>
          <Input
            className="flex-1"
            value={user?.fullName || name}
            disabled={!!user}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Order Method: </span>
          <Checkbox
            id="take-away"
            className="checked:!bg-brand"
            onCheckedChange={() => setDeliveryType(EDeliveryType.TAKE_AWAY)}
            checked={deliveryType == EDeliveryType.TAKE_AWAY}
          />
          <label htmlFor="take-away">Take Away</label>
          <Checkbox
            className="checked:!bg-brand"
            id="ship"
            onCheckedChange={() => setDeliveryType(EDeliveryType.SHIP)}
            checked={deliveryType == EDeliveryType.SHIP}
          />
          <label htmlFor="ship">Delivery</label>
        </div>
        {deliveryType === EDeliveryType.SHIP && (
          <div className="justify-between flex items-center gap-2">
            <p className="text-red font-bold">*</p>
            <span className="font-semibold">Address: </span>
            <Input
              className="flex-1"
              value={deliveryAddress}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
        )}
        <div className="justify-between flex items-center gap-2">
          <p className="text-red font-bold">*</p>
          <span className="font-semibold">Phone Number: </span>
          <Input
            className="flex-1"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            required
          />
        </div>
        <div className="justify-between flex items-center gap-2">
          <span className="font-semibold">Voucher: </span>
          <Input
            className="flex-1"
            value={voucher}
            onChange={(e) => {
              setDiscount((prev) => ({ ...prev, isValid: false }));
              setVoucher(e.target.value);
            }}
          />
          <Button
            variant={"outline"}
            onClick={handleCheckVoucher}
            disabled={isLoading.checkVoucher || discount.isValid}
            className={`bg-green hover:bg-green/60 disabled:bg-green/60 text-white`}
          >
            {isLoading.checkVoucher && (
              <Loader2 size={16} className="animate-spin mr-2" />
            )}
            {discount.code === voucher && discount.isValid ? (
              <>
                <Check size={16} className="mr-2" /> Valid
              </>
            ) : (
              "Check"
            )}
          </Button>
        </div>
        {discount.isValid && (
          <div className="flex items-center gap-2 text-green">
            <Check size={16} className="mr-2" />
            <span>
              Voucher discount{" "}
              {discount.type == EVoucherType.PERCENTAGE
                ? `${discount.value}%`
                : `${discount.value} ${currency}`}
            </span>
          </div>
        )}
        <div className="h-[1px] bg-gray-200 my-4" />
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold">Total:</span>
          <span className="text-xl font-bold text-brand">
            {finalPrice.toLocaleString()} {currency}
          </span>
        </div>
        <div>
          <div className="">
            <p className="font-semibold">Payment Method</p>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={cn(
                  "flex flex-col gap-2 justify-center items-center rounded-md border border-gray-400 py-2 cursor-pointer hover:bg-black/10 text-green",
                  {
                    "bg-green text-white":
                      paymentMethod === EPaymentMethod.CASH,
                  }
                )}
                onClick={() => setPaymentMethod(EPaymentMethod.CASH)}
              >
                <DollarSign size={40} />
                <span className="text-sm">Cash</span>
              </div>
              <div
                onClick={() => setPaymentMethod(EPaymentMethod.BANKING)}
                className={cn(
                  "flex flex-col gap-2 justify-center items-center rounded-md border border-gray-400 py-2 cursor-pointer hover:bg-black/10",
                  {
                    "bg-brand text-white":
                      paymentMethod === EPaymentMethod.BANKING,
                  }
                )}
              >
                <Landmark size={40} />
                <span className="text-sm">Banking</span>
              </div>
            </div>
          </div>
        </div>
        <button
          className="bg-brand rounded-full w-full text-white py-3 disabled:bg-brand/70 disabled:cursor-not-allowed"
          onClick={handleProcess}
          disabled={
            isLoading.process ||
            cartStatus === EOrderStatus.DELIVERING ||
            cartStatus === EOrderStatus.PENDING
          }
        >
          {isLoading.process && (
            <Loader2 size={16} className="animate-spin mr-2 inline-block" />
          )}
          {cartStatus === EOrderStatus.DELIVERING
            ? "Delivering"
            : cartStatus === EOrderStatus.PENDING
            ? "Pending"
            : "Order Now"}
        </button>
      </div>
    </div>
  );
}
