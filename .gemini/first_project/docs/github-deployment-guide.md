# GitHubへのソースコードのアップロードとVercel連携手順

手元（PC上）にある `first_project` のソースコードを GitHub にアップロード（Push）し、それを Vercel に連携させるための手順です。

## ステップ 1: GitHubでのリポジトリ（保管庫）作成
1. [GitHub](https://github.com/) にログインします。
2. 画面右上の **「+」** アイコンをクリックし、**「New repository」** を選択します。
3. 以下の項目を入力・選択します。
   *   **Repository name:** （例: `salon-reservation-app` など、わかりやすい英数字の名前）
   *   **Public / Private:** どちらでも構いませんが、ソースコードを公開したくない場合は **「Private」** を選択してください。
   *   *※「Add a README file」などのチェックボックスは全てチェックを外したままにしておいてください。（エラーの原因になります）*
4. 一番下の緑色の **「Create repository」** ボタンをクリックします。
5. 「Quick setup」という画面が表示されるので、そのまま開いておきます。

## ステップ 2: 手元のPCからGitHubへ送信（Push）
ここからは、お使いのエディタのターミナルで作業します。

1. 以下のコマンドを順番に、1行ずつコピー＆ペーストして実行してください。（※「npm run dev」などでサーバーが動いている場合は、一度`Ctrl+C`で停止してから実行してください）

```bash
# 1. 変更された全てのファイルを送信対象として登録する
git add .
```

```bash
# 2. 変更内容に「最初のコミット」というラベルを付ける
git commit -m "first commit"
```

```bash
# 3. メインのブランチ名を「main」に設定する
git branch -M main
```

```bash
# 4. アップロード先（先ほど作ったGitHub）のURLを設定する
# ※ 「https://github.com/あなたのユーザー名/リポジトリ名.git」の部分は、
# ステップ1の最後に表示されたご自身のURLに書き換えて実行してください！
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

```bash
# 5. 実際にGitHubへ送信する
git push -u origin main
```
*※ 途中、GitHubの認証ダイアログ（ブラウザ）が開いた場合は、ログインして許可（Authorize）してください。*

## ステップ 3: Vercel と GitHub をつなぐ
GitHubへの送信が成功したら、次はVercel側の設定です。

1. [Vercelのダッシュボード](https://vercel.com/) にログインします。
2. 右上の **「Add New...」** から **「Project」** を選択します。
3. 左側の **「Import Git Repository」** の部分で、ご自身のGitHubアカウントが見えない場合は連携（Install/Connect）します。
4. 連携ができると、先ほどGitHubに作ったリポジトリ（例: `salon-reservation-app`）が表示されるので、**「Import」** ボタンをクリックします。
5. プロジェクトの設定画面が開きますが、特に名前などは変更せず、そのまま下にある青い **「Deploy」** ボタンをクリックします。
6. 数分待つと、紙吹雪の画面が表示され、デプロイ（インターネット上への公開）が完了します！

---
これで、Vercel上に正しい（手元のPCと全く同じ）Next.jsアプリができあがり、GASからのデータを受け取るWebhookエンドポイント（`/api/webhook/google-forms`）も存在する状態になります。

最後に、Vercelで発行された**新しいURL**を使って、GASスクリプト（`WEBHOOK_URL`）のURLを書き換えて、Googleフォームをテストしてください！
