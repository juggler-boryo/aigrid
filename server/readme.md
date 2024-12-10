# aigrid server impl

## dev

```bash
make run
```

## lint

```bash
make lint
```

## deploy

```bash
gcloud run deploy aigrid \
  --source . \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --project aigrid-23256
```
