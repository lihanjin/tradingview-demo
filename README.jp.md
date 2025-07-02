[English](./README.en.md) | [中文](./README.md) | [日本語](./README.jp.md)

# AllTick TradingView マルチマーケット チャートデモ（オープンソース）

## プロジェクト概要

本プロジェクトは AllTick のマーケットデータおよび TradingView Charting Library に基づいて構築され、米国株、香港株、中国A株、為替、貴金属、暗号資産など、さまざまな金融商品のリアルタイムK線・分足チャートを提供します。すぐに利用可能で、二次開発や学習、商用統合にも適しています。

- 🚀 **グローバル市場対応**：米国株・香港株・中国A株・FX・貴金属・暗号資産を一括サポート
- 🔥 **リアルタイム配信**：ミリ秒単位のデータ配信、マルチタイムフレーム対応
- 🛠️ **TradingView ネイティブ体験**：公式チャートライブラリを統合、スムーズな操作性
- 🧩 **拡張性の高い設計**：カスタムデータソース・銘柄リスト・テーマなどに対応
- 🌏 **完全オープンソース**：誰でも無料で使用・Star・Forkが可能

## クイックスタート

### 動作環境

- Node.js 16以上
- npm または yarn

### 依存関係のインストール

```bash
npm install
# または
yarn install
```

### AllTick API トークンの設定

1. AllTick に登録：[https://www.alltick.co](https://www.alltick.co)
2. ログイン後、コンソールから API トークンを取得
3. プロジェクトのルートディレクトリにある `.env` ファイルを開き、以下のように設定：

    ```
    API_TOKEN=あなたの AllTick トークン
    ```

    ⚠️ 有効なトークンを設定していない場合、データ取得が正常に行われません。

### 開発サーバーの起動

```
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスして確認してください。

### 本番環境のビルド

```
npm run build
npm run start
```

## ディレクトリ構成

```
├── config/           # 銘柄リストの設定
├── pages/            # Next.js ページおよび API エンドポイント
├── section/          # TradingView チャートのコアコンポーネント
├── public/           # 静的リソース
├── .env              # 環境変数（API_TOKEN の設定）
└── README.md         # プロジェクトドキュメント
```

## よくある質問

- API_TOKEN を取得できない？
  → AllTick の公式サイトでアカウントを登録・ログインし、ユーザーセンターから取得してください。

- データが取得できない？
  → `.env` ファイルの API_TOKEN が正しく設定されているか確認してください。

- 銘柄リストをカスタマイズしたい
  → `config/symbols.ts` ファイルを編集してください。

## 公式サイト & API ドキュメント

- AllTick 公式サイト：[https://www.alltick.co](https://www.alltick.co)
- API ドキュメント：ログイン後、ユーザーセンターから確認可能
