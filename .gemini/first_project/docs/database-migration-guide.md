# Vercelデプロイに伴うデータベース（PostgreSQL）移行手順

現在のアプリは、手元のPC内で保存する「SQLite」というデータベースを使っています。
しかし、Vercel のようなクラウド環境ではこのファイルが保存できないため、クラウド用の「PostgreSQL」というデータベースに変更する必要があります。

この手順では、Vercel上の **Prisma Postgres** というデータベースを作成し、アプリと連携させます。

---

## 1. Vercel データベース (Prisma Postgres) の作成

1. [Vercelのダッシュボード](https://vercel.com/dashboard) を開き、今回デプロイしたプロジェクト（`salon-reservation-app-...`）をクリックします。
2. 上部メニューの **「Storage」** タブをクリックします。
3. 画面中央の **「Connect Database」** または **「Create a Database」** をクリックします。
4. **「Prisma Postgres」** を選択し、「Continue」を押します。
5. 作成画面が出るので、内容を確認して（Add connection to your project にチェックが入っているはずです） **「Create」** や **「Connect」** をクリックして進めます。
6. これで、プロジェクトの環境変数（Environment Variables）に、データベースの接続情報（`DATABASE_URL` など）が自動的に登録されます。

---

## 2. ローカルに環境変数を引っ張ってくる

Vercel上で作られたデータベースのパスワードなどの設定（環境変数）を、手元のPCにダウンロードして連携させます。
PCのターミナルで以下のコマンドを実行してください。

```bash
npx vercel env pull .env.local
```
※ 「Set up and develop "[ユーザー名]/[プロジェクト名]"?」と聞かれたら `y` (yes) を押して進めてください。（ブラウザでの連携が求められる場合もあります）

---

## 3. Prisma（プログラム）を PostgreSQL 用に書き換える

エディタで `prisma/schema.prisma` ファイルを開き、一番上の `datasource db` の部分を以下のように書き換えて保存します。

```prisma
// 変更後
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
※ 先ほどの `vercel env pull` によって `.env.local` ファイルに `DATABASE_URL` という変数が作られているため、それを利用する形になります。

---

## 4. データベースのテーブル（枠組み）を作る

先ほど作成したVercelの「空のデータベース」に対して、顧客情報などを保存するための「テーブルの枠組み（Schema）」を作ります。
ターミナルで以下のコマンドを実行します。

```bash
# Vercel上のデータベースに最新の枠組みを適用する
npx prisma db push
```

成功すると "🚀 Your database is now in sync with your schema." のような成功メッセージが表示されます。

---

## 5. 変更をGitHub（そしてVercel）へ送る

プログラム（`schema.prisma`）を書き換えたので、最新版をGitHubへアップロードします。
ターミナルで以下のコマンドを実行してください。

```bash
git add prisma/schema.prisma
git commit -m "Update DB to PostgreSQL"
git push
```

GitHubへアップロードされると、**Vercel は自動的にその変更を検知して、新しい「デプロイ」を開始**します。
数分待ってデプロイが完了したら、URLにアクセスしてアプリが開くか確認してみてください！
