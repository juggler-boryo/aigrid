# aigrid server impl

## dev

- go install golang.org/dl/go1.22.7@latest && go1.22.7 download

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
