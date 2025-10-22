"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveItemAction(data: { name: string }) {
  //   await .item.create({ data });
  revalidatePath("/"); // Refresh the parent page data
}
