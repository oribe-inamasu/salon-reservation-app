/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Google Forms to Next.js Webhook Integration
 * 
 * このスクリプトはGoogleフォームの送信データをNext.jsのWebhookに送信します。
 * 送信後にLINE通知がNext.js側から行われる想定です。
 */

// ==========================================
// 設定項目 (変更が必要な項目)
// ==========================================
// Webhook URLを設定してください (デプロイ後のNext.jsアプリのURL)
// ローカルテストの場合は ngrok などのURLを使用してください
const WEBHOOK_URL = 'https://YOUR_NEXTJS_APP_URL.com/api/webhook/google-forms';

// ==========================================
// スクリプト本体 (通常は変更不要)
// ==========================================
function onSubmit(e) {
    // イベントオブジェクト(e)から回答を取得
    var itemResponses = e.response.getItemResponses();
    var payload = {};

    // 各質問とその回答をマッピング
    for (var i = 0; i < itemResponses.length; i++) {
        var itemResponse = itemResponses[i];
        var question = itemResponse.getItem().getTitle();
        var answer = itemResponse.getResponse();

        // 複数選択(チェックボックス)の場合は配列で返ってくるため、カンマ区切りの文字列に変換
        if (Array.isArray(answer)) {
            answer = answer.join(', ');
        }

        payload[question] = answer;
    }

    // WebhookにPOSTリクエストを送信
    var options = {
        'method': 'post',
        'contentType': 'application/json',
        'payload': JSON.stringify(payload)
    };

    try {
        UrlFetchApp.fetch(WEBHOOK_URL, options);
        Logger.log('Webhookへの送信に成功しました。');
    } catch (error) {
        Logger.log('Webhookへの送信に失敗しました: ' + error);
    }
}

/**
 * 初回設定用のダミー関数
 * 認証(Permissions)を許可するために一度実行する必要があります。
 */
function testPermissions() {
    Logger.log('認証が完了しました。');
}
