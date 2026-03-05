import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendLineNotification } from "@/lib/line";

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Mapping Google Form answers to our Prisma model
        // GAS (Google Apps Script) will send a JSON object mapping questions to answers
        const customer = await prisma.customer.create({
            data: {
                name: data["01. お名前"] || "未入力",
                furigana: data["02. フリガナ"] || "未入力",
                birth_date: data["03.生年月日"] || null,
                occupation: data["04. ご職業"] || null,
                address: data["05.ご住所"] || null,
                phone_number: data["06.電話番号"] || null,
                pain_area: data["07. 痛みや違和感のある部分はどこですか？"] || null,
                symptoms: data["08. どんな症状ですか？"] || null,
                when_symptoms_felt: data["09. どんなときに異変を感じますか？"] || null,
                visited_hospital: data["10. 病院で診察を受けましたか？"] || null,
                hospital_diagnosis: data["11. ※「はい」とお答えの方、診断名がわかれば教えてください"] || null,
                possible_cause: data["12. 考えられる原因はありますか？"] || null,
                desired_duration: data["13. ご希望の施術時間はありますか？"] || null,
                desired_treatment: data["14. ご希望の施術内容はありますか？"] || null,
                current_treatment: data["15. 現在、治療中の怪我や病気があれば教えてください"] || null,
                past_injury: data["16. これまでに大きなケガや病気をしたことがあれば教えてください"] || null,
                massage_frequency: data["17. マッサージなどの施術はどのくらいの頻度で受けますか？"] || null,
                experienced_momikaeshi: data["18. 揉み返しが出たことがありますか？"] || null,
                possible_pregnancy: data["19. 妊娠している可能性がありますか？"] || null,
                referral_source: data["20. 当院を何でお知りになりましたか？"] || null,
                additional_concerns: data["21. お身体で不安に思っている事、またお身体以外でもお気づきの事、どんな事でもご記入ください"] || null,
            },
        });

        const isLineSent = await sendLineNotification(
            `🔔 新規の予診票が届きました！\n\nお名前: ${customer.name} 様\n症状: ${customer.pain_area || "未入力"}\n\nWebアプリから詳細をご確認ください。`
        );

        return NextResponse.json({ success: true, customerId: customer.id, lineNotified: isLineSent }, { status: 200 });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process webhook" },
            { status: 500 }
        );
    }
}
