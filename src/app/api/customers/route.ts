import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const data = await req.json();

        if (!data.name || !data.furigana) {
            return NextResponse.json(
                { success: false, error: "名前とフリガナは必須です" },
                { status: 400 }
            );
        }

        const customer = await prisma.customer.create({
            data: {
                name: data.name,
                furigana: data.furigana,
                birth_date: data.birth_date || null,
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

        return NextResponse.json({ success: true, customerId: customer.id }, { status: 201 });
    } catch (error) {
        console.error("Customer creation error:", error);
        return NextResponse.json(
            { success: false, error: "顧客の登録に失敗しました" },
            { status: 500 }
        );
    }
}
