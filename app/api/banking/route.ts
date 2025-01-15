import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { EPaymentMethod, EPaymentStatus, IOrder } from "@/types/order";
import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";

export interface SepayWebhook {
  id: number;
  gateway: string;
  transactionDate: Date;
  accountNumber: string;
  code: null;
  content: string;
  transferType: string;
  transferAmount: number;
  accumulated: number;
  subAccount: null;
  referenceCode: string;
  description: string;
}
// Sepay call to this API everytime a transaction is made
export const POST = async (req: NextRequest) => {
  // Sepay sends the transaction details in the body
  const body = (await req.json()) as SepayWebhook;
  const { databases } = await createAdminClient();
  try {
    // Get all orders that are unpaid and paid with banking
    const orders = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.ordersCollectionId,
      [
        Query.equal("paymentMethod", EPaymentMethod.BANKING),
        Query.equal("paymentStatus", EPaymentStatus.UNPAID),
      ]
    );
    // Loop through all orders and check if the content of the order is in the body of the request
    orders.documents.forEach(async (item: any) => {
      if (
        body.content.includes(item.$id) &&
        (item as IOrder).finalPrice === body.transferAmount
      ) {
        // Update the payment status to paid if the content of transaction and transfer amount match
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.ordersCollectionId,
          item.$id,
          {
            paymentStatus: EPaymentStatus.PAID,
          }
        );
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
};
