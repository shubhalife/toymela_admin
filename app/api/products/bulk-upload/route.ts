import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/mongoDB";
import Product from "@/lib/models/Product";

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = auth();

    // if (!userId) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    await connectToDB();

    const products = await req.json();

    if (!Array.isArray(products) || products.length === 0) {
      return new NextResponse("Invalid product data.", { status: 400 });
    }

    const createdProducts = [];

    for (const product of products) {
      const {
        title,
        description,
        media,
        category,
        collections,
        tags,
        sizes,
        colors,
        price,
        expense,
      } = product;

      if (!title || !description || !media || !category || !price || !expense) {
        return new NextResponse("Not enough data to create products", {
          status: 400,
        });
      }

      const newProduct = await Product.create({
        title,
        description,
        media,
        category,
        collections,
        tags,
        sizes,
        colors,
        price,
        expense,
      });

      await newProduct.save();
      createdProducts.push(newProduct);
    }

    return NextResponse.json(
      { message: "Bulk upload successful", products: createdProducts },
      { status: 200 }
    );
  } catch (err) {
    console.error("[products_BULK_POST]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";
