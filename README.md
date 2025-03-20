# Backend master project

lancer en local

```sh
docker build -f Dockerfile.dev -t backend_m1:dev .
docker run -p 3000:3000 backend_m1:dev
```

logs

```sh
gcloud run services logs read contract-central-backend-gcp-pubsub --region europe-west1
```
