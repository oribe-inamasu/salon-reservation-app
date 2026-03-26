import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Starting dummy data generation (200 records)...");

    // 1. Fetch latest settings
    const settings = await prisma.appSetting.findMany();
    const settingsMap = settings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as any);

    const staffMembers = settingsMap.staff_members || [];
    const serviceCourses = settingsMap.service_courses || [];
    const paymentMethods = ["現金", "カード", "電子マネー", "その他"];

    if (staffMembers.length === 0 || serviceCourses.length === 0) {
        console.error("Settings are incomplete. Please set staff and courses first.");
        return;
    }

    // 2. Fetch existing customers
    const customers = await prisma.customer.findMany({ select: { id: true } });
    if (customers.length === 0) {
        console.error("No customers found. Please add some customers first.");
        return;
    }

    // 3. Delete existing records for Feb/March 2026
    const startDate = new Date("2026-02-01T00:00:00Z");
    const endDate = new Date("2026-04-01T00:00:00Z");

    const deletedVisits = await prisma.visitHistory.deleteMany({
        where: {
            visit_date: {
                gte: startDate,
                lt: endDate,
            },
        },
    });
    console.log(`Deleted ${deletedVisits.count} existing visit records.`);

    const deletedBookings = await prisma.booking.deleteMany({
        where: {
            start_time: {
                gte: startDate,
                lt: endDate,
            },
        },
    });
    console.log(`Deleted ${deletedBookings.count} existing booking records.`);

    // 4. Generate 200 records
    const recordsToGenerate = 200;
    const startMs = startDate.getTime();
    const endMs = endDate.getTime();

    for (let i = 0; i < recordsToGenerate; i++) {
        const randomMs = startMs + Math.random() * (endMs - startMs);
        const date = new Date(randomMs);
        date.setMinutes(0, 0, 0); // Round to hour

        const customer = customers[Math.floor(Math.random() * customers.length)];
        const staff = staffMembers[Math.floor(Math.random() * staffMembers.length)];
        const course = serviceCourses[Math.floor(Math.random() * serviceCourses.length)];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        // Create Booking first
        const booking = await prisma.booking.create({
            data: {
                customerId: customer.id,
                start_time: date,
                end_time: new Date(date.getTime() + (course.duration || 60) * 60000),
                treatment_category: course.category || null,
                treatment_content: course.name,
                price: course.price,
                staff: staff.name,
                status: "completed",
                payment_method: paymentMethod,
            },
        });

        // Create corresponding VisitHistory
        await prisma.visitHistory.create({
            data: {
                customerId: customer.id,
                bookingId: booking.id,
                visit_date: date,
                treatment_category: course.category || null,
                treatment_content: course.name,
                price: course.price,
                staff: staff.name,
                payment_method: paymentMethod,
            },
        });

        if ((i + 1) % 50 === 0) {
            console.log(`Generated ${i + 1} records...`);
        }
    }

    console.log("Dummy data generation completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
