import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { orderId, amount, customerDetails } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const baseUrl = "https://app.sandbox.midtrans.com";

    if (!serverKey || !orderId || !amount || !customerDetails) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(amount),
      },
      credit_card: {
        secure: true,
      },
      customer_details: customerDetails,
      item_details: [
        {
          id: orderId,
          price: Math.round(amount),
          quantity: 1,
          name: "Warung Nusantara Order",
        },
      ],
    };

    const authString = Buffer.from(serverKey + ":").toString("base64");

    const response = await fetch(`${baseUrl}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(parameter),
    });

    const result = await response.json();

    if (response.ok) {
      return NextResponse.json({
        token: result.token,
        redirect_url: result.redirect_url,
      });
    } else {
      return NextResponse.json(
        { error: result.error_messages },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in create payment API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
