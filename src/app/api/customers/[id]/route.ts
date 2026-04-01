import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET a single customer
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const customer = await prisma.customer.findUnique({ where: { id } });
        if (!customer) {
            return NextResponse.json({ error: "顧客が見つかりません" }, { status: 404 });
        }
        return NextResponse.json(customer);
    } catch (error) {
        console.error("Customer fetch error:", error);
        return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
    }
}

import { normalizeBirthDate } from "@/lib/date-utils";

// PUT (update) a customer
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const data = await req.json();
        console.log(`📝 Updating customer ${id}:`, data);

        if (!data.name?.trim() || !data.furigana?.trim()) {
            return NextResponse.json(
                { success: false, error: "名前とフリガナは必須です" },
                { status: 400 }
            );
        }

        const customer = await prisma.customer.update({
            where: { id },
            data: {
                name: data.name,
                furigana: data.furigana,
                birth_date: normalizeBirthDate(data.birth_date),
                phone_number: data.phone_number || null,
                address: data.address || null,
                occupation: data.occupation || null,
                pain_area: data.pain_area || null,
                symptoms: data.symptoms || null,
                when_symptoms_felt: data.when_symptoms_felt || null,
                visited_hospital: data.visited_hospital || null,
                hospital_diagnosis: data.hospital_diagnosis || null,
                possible_cause: data.possible_cause || null,
                desired_duration: data.desired_duration || null,
                desired_treatment: data.desired_treatment || null,
                current_treatment: data.current_treatment || null,
                past_injury: data.past_injury || null,
                massage_frequency: data.massage_frequency || null,
                experienced_momikaeshi: data.experienced_momikaeshi || null,
                possible_pregnancy: data.possible_pregnancy || null,
                referral_source: data.referral_source || null,
                additional_concerns: data.additional_concerns || null,
                attribute_label: data.attribute_label || null,
            },
        });

        return NextResponse.json({ success: true, customer });
    } catch (error) {
        console.error("Customer update error:", error);
        return NextResponse.json(
            { success: false, error: "更新に失敗しました" },
            { status: 500 }
        );
    }
}

// DELETE a customer
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await prisma.customer.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Customer delete error:", error);
        return NextResponse.json(
            { success: false, error: "削除に失敗しました" },
            { status: 500 }
        );
    }
}
