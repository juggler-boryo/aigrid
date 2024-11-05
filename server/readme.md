# aigrid server impl

ジャグラー墓料のメインサーバ

## running locally

1. 依存関係の解決
```bash
pip install -r requirements.txt
```

2. サーバの起動
```bash
python main.py
```

## deployment

1. サブモジュールを更新
```bash
git submodule update --init --recursive
```

2. デプロイ
// TODO: デプロイ方法
```bash
gcloud deploy 
```
