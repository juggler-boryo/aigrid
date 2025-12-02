# CLAUDE_JP.md

このファイルは、このリポジトリでコードを扱う際のClaude Code (claude.ai/code) へのガイダンスを提供します。

## プロジェクト概要

これは「aigrid」（ジャグラ墓料のスマートホームシステム）と呼ばれるスマートホームシステムで、3つの主要コンポーネントから構成されています：

1. **Server** (`/server`) - FirebaseとDiscord統合を使用したGoバックエンドAPI
2. **App** (`/app`) - Vite、MUI Joy、TypeScriptを使用したReactフロントエンド
3. **Hub** (`/hub`) - 音声コマンド対応のPythonベースのホーム制御システム

## 開発コマンド

### フルスタックの実行
```bash
make run  # フロントエンドとバックエンドを同時に実行
```

### フロントエンド（Reactアプリ）
```bash
cd app
yarn        # 依存関係のインストール
yarn dev    # 開発サーバーの起動
yarn build  # プロダクション用ビルド
yarn lint   # ESLintの実行
```

### バックエンド（Goサーバー）
```bash
cd server
make run   # airを使用したホットリロード付き起動
make lint  # golangci-lintの実行
```

### Hub（Python）
```bash
cd hub
pip install -r requirements.txt
python main.py
```

## アーキテクチャ概要

### バックエンドアーキテクチャ
- **エントリーポイント**: `server/main.go` - FirebaseとDiscordを初期化し、HTTPサーバーをセットアップ
- **ルーティング**: `server/routes/routes.go` - 認証ミドルウェア付きAPIエンドポイントを定義
- **ハンドラー**: `server/handlers/` - 各エンドポイントのビジネスロジック
- **モデル**: `server/models/` - ユーザー、NFC、tamaki、入退室追跡のデータ構造
- **ミドルウェア**: 保護されたルート用のトークン認証
- **外部サービス**: Firebase（認証/データベース）、Discord（通知）

### フロントエンドアーキテクチャ
- **エントリーポイント**: `app/src/main.tsx` - ルーティング、テーマ、React Queryのセットアップ
- **ページ**: `app/src/pages/` - メインビュー（ホーム、ログイン、プロフィール、tamaki、ホワイトボード）
- **コンポーネント**: `app/src/components/` - 再利用可能なUIコンポーネント
- **API**: `app/src/apis/` - バックエンド通信用のAPIクライアント関数
- **状態管理**: サーバー状態にはReact Query、認証にはFirebaseフック
- **スタイリング**: カスタムテーマ付きMUI Joyコンポーネント

### 主要機能
- **ユーザー認証**: Firebaseベースのログインシステム
- **NFC入退室システム**: Suicaカードで入退室を追跡（`/nfc/{suica_id}`、`/inout/{uid}`）
- **Tamakiシステム**: tamakiエントリの作成と管理
- **分析**: 入退室時間の追跡と可視化
- **Discord統合**: 起床/就寝/ゴミ出しイベントの通知
- **スマートホームコントロール**: `/home/{homeId}`エンドポイント経由でホームシステムを制御

## デプロイメント
- **フロントエンド**: GitHubプッシュ時にVercelへ自動デプロイ
- **バックエンド**: server/readme.mdに記載のgcloudコマンドを使用してGoogle Cloud Runへデプロイ