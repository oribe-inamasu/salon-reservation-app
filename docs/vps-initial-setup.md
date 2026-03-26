# VPSサーバー初期セットアップ手順 (Xserver VPS)

サーバーのIPアドレスが発行された後の、初回ログインからアプリケーション起動までの手順です。

## 1. サーバーへの初ログイン
手元のMacのターミナルを開き、ダウンロードした秘密鍵（例: `server-key.pem`）を使ってログインします。

```bash
# 秘密鍵の権限を変更（初回のみ必須）
chmod 400 /path/to/server-key.pem

# SSHでログイン（Xserver VPSの初期ユーザーは通常 root です）
ssh -i /path/to/server-key.pem root@サーバーのIPアドレス
```

---

## 2. システムの更新と必須ツールのインストール
OSを最新の状態にし、Gitなどをインストールします。

```bash
apt update && apt upgrade -y
apt install -y git curl build-essential
```

---

## 3. Node.js のインストール (nvm経由)
柔軟にバージョン管理ができる `nvm` を使い、Node.js 20系をインストールします。

```bash
# nvmのインストール
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# Node.js 20系のインストール
nvm install 20
node -v # v20.x.x と表示されればOK
```

---

## 4. PostgreSQL のインストールと設定
Vercel環境と合わせるため、データベースとして PostgreSQL を導入します。

```bash
apt install -y postgresql postgresql-contrib

# データベースとユーザーの作成
sudo -u postgres psql
# --- psqlプロンプト内 ---
CREATE DATABASE salon_app;
CREATE USER salon_user WITH PASSWORD '強力なパスワードを設定';
GRANT ALL PRIVILEGES ON DATABASE salon_app TO salon_user;
\q
```

---

## 5. アプリケーションのデプロイ
GitHubからコードを取得し、セットアップします。

```bash
# プロジェクトの取得
git clone https://github.com/oribe-inamasu/salon-reservation-app.git
cd salon-reservation-app

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
nano .env # DATABASE_URL や AUTH_SECRET を設定
# 記述例: DATABASE_URL="postgresql://salon_user:パスワード@localhost:5432/salon_app"

# データベースの初期化とビルド
npx prisma db push
npm run build
```

---

## 6. PM2 による永続化
サーバーを閉じてもアプリが動き続けるようにします。

```bash
npm install -g pm2
pm2 start npm --name "salon-app" -- start

# サーバー再起動時に自動起動するように設定
pm2 startup
pm2 save
```

---

## 7. お疲れ様でした！
ブラウザで `http://サーバーのIPアドレス:3000` にアクセスして動作を確認してください。
（※ポート3000を開放していない場合は、Xserverの管理画面でパケットフィルター設定を確認してください）
