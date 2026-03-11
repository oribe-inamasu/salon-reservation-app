import prisma from "@/lib/prisma";
import CustomerListClient from "./CustomerListClient";

export const dynamic = "force-dynamic";

import { getAppSettings } from "@/lib/settings";

export default async function Home() {
  const customers = await prisma.customer.findMany({
    include: {
      visitHistories: {
        orderBy: { visit_date: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize data for client component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedCustomers = customers.map((c: any) => ({
    id: c.id,
    name: c.name,
    furigana: c.furigana,
    phone_number: c.phone_number,
    createdAt: c.createdAt.toISOString(),
    lastVisitDate: c.visitHistories[0]?.visit_date.toISOString() || null,
    visitCount: c.visitHistories.length,
    attributeLabel: c.attribute_label || null,
    birthDate: c.birth_date || null,
  }));

  const { customerLabels } = await getAppSettings();

  return <CustomerListClient customers={serializedCustomers} customerLabels={customerLabels} />;
}
