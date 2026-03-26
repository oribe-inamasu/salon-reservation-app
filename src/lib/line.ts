export async function sendLineNotification(message: string) {
    const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const lineGroupId = process.env.LINE_GROUP_ID; // The Group ID or User ID of the salon staff

    if (!lineToken || !lineGroupId) {
        console.warn("LINE Configuration missing. Skipping notification.");
        return false;
    }

    try {
        const response = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${lineToken}`,
            },
            body: JSON.stringify({
                to: lineGroupId,
                messages: [
                    {
                        type: "text",
                        text: message,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("LINE API Error:", errorText);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Failed to send LINE message:", error);
        return false;
    }
}
