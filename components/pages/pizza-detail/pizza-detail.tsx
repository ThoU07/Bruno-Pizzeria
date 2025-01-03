"use client";
import SelectSize from "@/components/select-size";
import SelectTopping from "@/components/select-topping";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, Pizza } from "lucide-react";
import { Button } from "../../ui/button";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "nextjs-toploader/app";
import { currency } from "@/shared/constants";
import Link from "next/link";
import { IPizza } from "@/types/pizza";
import useCartStore, { StoreCartItem } from "@/lib/stores/use-cart-store";
import { ITopping } from "@/types/topping";
import { IPizzaSize } from "@/types/size";
import Image from "next/image";

interface Props {
  pizza: IPizza;
}

export default function PizzaDetail({ pizza }: Props) {
  const isCustom = pizza.sizes[0].name.toLowerCase() === "custom";
  const [selectedSize, setSelectedSize] = useState<IPizzaSize>(pizza.sizes[0]);
  const [toppingSelected, setToppingSelected] = useState<ITopping[]>(
    isCustom ? pizza.toppings : []
  );
  const { addItem } = useCartStore();
  const router = useRouter();

  const finalPrice = useMemo(() => {
    return (
      pizza.price +
      selectedSize.price +
      toppingSelected.reduce((total, topping) => total + topping.price, 0)
    );
  }, [pizza.price, toppingSelected, selectedSize]);

  const handleAddToCart = () => {
    const finalPizza: StoreCartItem = {
      pizzas: pizza,
      selectedSize: selectedSize,
      selectedToppings: toppingSelected,
      quantity: 1,
      totalPrice: finalPrice,
      listToppings: pizza.toppings,
    };

    addItem(finalPizza);
    toast.success("Added to Cart", {
      action: {
        label: "To Cart",
        onClick: () => router.push("/cart"),
      },
      actionButtonStyle: {
        backgroundColor: "green",
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 pt-0">
      <div>
        <Link href="/menu">
          <Button variant="ghost" className="mb-4">
            <ChevronLeft /> Back
          </Button>
        </Link>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Pizza Image */}
        <div className="h-full flex items-center justify-center">
          <div className="relative w-full aspect-square">
            <Image
              src={pizza.images[0] ?? "/assets/images/photo.png"}
              alt="Pizza"
              objectFit="cover"
              className="rounded-md shadow-2xl"
              fill
            />
          </div>
        </div>

        {/* Right Column - Customization Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 h2">
              <Pizza size={32} />
              Delicious <span className="text-brand">{pizza.name}</span>
            </CardTitle>
            <CardDescription className="">
              More information: {pizza.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Size</h3>
              <SelectSize
                sizes={pizza.sizes}
                onChange={setSelectedSize}
                selectedValue={selectedSize}
              />
            </div>

            {/* Toppings Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Crust</h3>
              <SelectTopping
                toppings={pizza.toppings}
                onChange={setToppingSelected}
                selectedValue={toppingSelected}
                isMultiple={false}
                isCustom={isCustom}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-xl font-bold">
              Total: {finalPrice.toLocaleString()}
              {currency}
            </div>
            <Button
              className="w-full bg-brand hover:bg-brand/80"
              size="lg"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
