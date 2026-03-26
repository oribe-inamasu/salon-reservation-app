# Nginx & SSL セットアップ手順 (Xserver VPS)

Next.js アプリケーション（ポート3000）を HTTP(S) で公開するための設定手順です。

## 1. Nginx のインストール

```bash
sudo apt update
sudo apt install -y nginx

# 起動確認
sudo systemctl status nginx
```

## 2. Nginx 設定ファイルの作成

この作業は、**VPS に SSH でログインした状態で**行います。

コマンドラインエディタ `nano` を使って新規ファイルを作成します：

```bash
sudo nano /etc/nginx/sites-available/salon-karte
```

エディタが開いたら、以下の内容をコピーして貼り付けてください。
（`<your-domain.com>` は実際のドメイン名に書き換えてください）

```nginx
server {
    listen 80;
    server_name <your-domain.com>;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**保存方法 (nano エディタの場合):**
1.  `Ctrl + O` (保存) を押し、そのまま `Enter`
2.  `Ctrl + X` (閉じる) で元の画面に戻る

### 2.1 作成されたか確認する方法

ファイルが正しく作成・保存されたか不安な場合は、以下のコマンドをターミナルで実行してください。

```bash
# ファイルの中身を表示する
cat /etc/nginx/sites-available/salon-karte
```

設定した内容が画面に表示されれば、正しく保存されています！

## 3. 設定の有効化

```bash
# 既存のデフォルト設定を削除（任意）
sudo rm /etc/nginx/sites-enabled/default

# 作成した設定のシンボリックリンクを作成
sudo ln -s /etc/nginx/sites-available/salon-karte /etc/nginx/sites-enabled/

# 構文チェック
sudo nginx -t

# Nginx 再起動
sudo systemctl restart nginx
```

## 3. SSL (HTTPS) の設定 (Certbot)

Let's Encrypt を使用して無料で SSL 化します。

```bash
sudo apt install -y certbot python3-certbot-nginx

# 証明書の取得と自動設定
# (途中でメールアドレスの入力や規約への同意を求められます)
sudo certbot --nginx -d <your-domain.com>
```

実行後、HTTP から HTTPS への自動リダイレクトを有効にするか聞かれるので、`2: Redirect` を選択することをお勧めします。

## 4. ファイアウォールの確認

Xserver VPS の管理パネル、または `ufw` を使用している場合は、80 (HTTP) と 443 (HTTPS) が許可されているか確認してください。

```bash
sudo ufw allow 'Nginx Full'
```

---

## 5. アプリケーションの環境変数更新

HTTPS 化に伴い、`.env` ファイルの `AUTH_URL` も更新が必要です。

```bash
cd ~/salon-reservation-app
nano .env
```

以下のように書き換えてください：
```env
AUTH_URL="https://<your-domain.com>"
```

書き換え後、アプリを再起動します：
```bash
pm2 restart salon-app
```

これで `https://<your-domain.com>` でアプリにアクセスできるようになります！
