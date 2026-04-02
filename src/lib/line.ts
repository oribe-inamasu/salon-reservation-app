export async function sendLineNotification(message: string) {
    const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const lineGroupIdString = process.env.LINE_GROUP_ID; // Comma separated Group IDs or User IDs

    if (!lineToken || !lineGroupIdString) {
        console.warn("LINE Configuration missing. Skipping notification.");
        return false;
    }

    // Split multiple IDs and clean them up
    const lineGroupIds = lineGroupIdString.split(",").map(id => id.trim()).filter(id => id.length > 0);

    if (lineGroupIds.length === 0) {
        console.warn("No valid LINE IDs found. Skipping notification.");
        return false;
    }

    let successCount = 0;

    for (const lineGroupId of lineGroupIds) {
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
                console.error(`LINE API Error for ID ${lineGroupId}:`, errorText);
            } else {
                successCount++;
            }
        } catch (error) {
            console.error(`Failed to send LINE message to ID ${lineGroupId}:`, error);
        }
    }

    return successCount > 0;
}
