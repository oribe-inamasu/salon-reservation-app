# 今後のアプリ修正・デプロイ手順

アプリケーションを修正し、VPS（本番環境）に反映させるための標準的な流れをまとめました。

## 1. ローカルでの開発と確認 (Mac)

1.  **コードの修正**: VS Code などで通常通り開発を行います。
2.  **動作確認**: ターミナルで `npm run dev` を実行し、ブラウザで動作を確認します。
3.  **ビルド確認**: （推奨）本番と同じビルドが通るか `npm run build` を実行して確認します。

## 2. GitHub への反映 (Mac)

修正が完了したら、Git で変更を保存し、GitHub へプッシュします。

```bash
git add .
git commit -m "修正内容のメッセージ"
git push origin main
```

## 3. VPS への反映 (VPS ターミナル)

SSH でサーバーにログインし、以下の手順で最新コードを反映・再起動します。

```bash
# プロジェクトディレクトリに移動
cd ~/salon-reservation-app

# 1. 最新コードを取得
git pull origin main

# 2. 依存関係のインストール（新しいライブラリを追加した場合のみ必須）
npm install

# 3. データベースの更新（Prismaのスキーマを変更した場合のみ必須）
npx prisma db push

# 4. アプリのビルド（これを忘れると反映されません）
npm run build

# 5. アプリの再起動
pm2 restart salon-app
```

---

## 💡 効率化のヒント：自動デプロイコマンドの作成

毎回上記のコマンドを打つのは大変なので、サーバー側に `deploy.sh` というファイルを作っておくと便利です。

1. **スクリプトの作成**:
   ```bash
   nano ~/deploy.sh
   ```
2. **以下の内容を貼り付け**:
   ```bash
   #!/bin/bash
   cd ~/salon-reservation-app
   git pull origin main
   npm install
   npx prisma db push
   npm run build
   pm2 restart salon-app
   echo "Deployment successful!"
   ```
3. **実行権限の付与**:
   ```bash
   chmod +x ~/deploy.sh
   ```

今後は、VPSで **`./deploy.sh`** と打つだけで、最新状態への更新が完了するようになります！
