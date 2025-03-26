# Backend master project

lancer en local

```sh
docker build -f Dockerfile.dev -t backend_m1:dev .
docker run -p 3000:3000 backend_m1:dev
```

logs

```sh
gcloud run services logs read contract-central-backend-gcp-pubsub --region europe-west1

#####

 gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="contract-central-backend-nestjs"' \
  --project=contract-central-c710c \
  --limit=20 \
  --order=desc \
  --format=json > errs.log

```
