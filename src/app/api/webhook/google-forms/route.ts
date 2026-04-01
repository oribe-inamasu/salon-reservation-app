import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { sendLineNotification } from "@/lib/line";

import { normalizeBirthDate } from "@/lib/date-utils";

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Mapping Google Form answers to our Prisma model
        // GAS (Google Apps Script) will send a JSON object mapping questions to answers
        const customer = await prisma.customer.create({
            data: {
                name: data["01. お名前"] || "未入力",
                furigana: data["02. フリガナ"] || "未入力",
                birth_date: normalizeBirthDate(data["03.生年月日"]),
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

        const messageText = `🔔 新規の予診票が届きました！

【基本情報】
お名前: ${customer.name} 様 (${customer.furigana})
生年月日: ${customer.birth_date || "未入力"}
電話番号: ${customer.phone_number || "未入力"}
ご職業: ${customer.occupation || "未入力"}
ご住所: ${customer.address || "未入力"}

【問診内容】
痛みや違和感のある部分:
${customer.pain_area || "未入力"}

どんな症状ですか？:
${customer.symptoms || "未入力"}

どんなときに異変を感じますか？:
${customer.when_symptoms_felt || "未入力"}

病院で診察を受けましたか？: ${customer.visited_hospital || "未入力"}
診断名: ${customer.hospital_diagnosis || "未入力"}

考えられる原因はありますか？:
${customer.possible_cause || "未入力"}

【ご希望内容】
ご希望の施術時間: ${customer.desired_duration || "未入力"}
ご希望の施術内容: ${customer.desired_treatment || "未入力"}

【既往歴・体質など】
現在治療中の怪我や病気:
${customer.current_treatment || "未入力"}

これまでに大きなケガや病気をしたこと:
${customer.past_injury || "未入力"}

マッサージ等の頻度: ${customer.massage_frequency || "未入力"}
揉み返しが出たこと: ${customer.experienced_momikaeshi || "未入力"}
妊娠している可能性: ${customer.possible_pregnancy || "未入力"}

当院を知ったきっかけ: ${customer.referral_source || "未入力"}

【身体で不安に思っていること、その他】
${customer.additional_concerns || "未入力"}

🌐 Webアプリからカルテ一覧をご確認ください。`;

        const isLineSent = await sendLineNotification(messageText);

        return NextResponse.json({ success: true, customerId: customer.id, lineNotified: isLineSent }, { status: 200 });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process webhook" },
            { status: 500 }
        );
    }
}
