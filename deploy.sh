#!/bin/bash

PROJECT_ID="contract-central-c710c"
REGION="europe-west1"
SERVICE_NAME="contract-central-backend-gcp-pubsub"
SERVICE_ACCOUNT="nest-vertex-ai@contract-central-c710c.iam.gserviceaccount.com"
IMAGE_NAME="gcr.io/$PROJECT_ID/backend-gcp-pubsub"
MEMORY="1Gi"

usage() {
    echo "Usage: $0 {start|stop}"
    echo "  start | on   Build & Deploy to Cloud Run"
    echo "  stop | off   Delete Cloud Run service"
    exit 1
}

build_and_deploy() {
    if [ ! -f Dockerfile ]; then
        echo "Erreur : Aucun Dockerfile trouvé."
        exit 1
    fi

    gcloud builds submit --tag "$IMAGE_NAME"

    gcloud run deploy "$SERVICE_NAME" \
        --image "$IMAGE_NAME" \
        --platform managed \
        --region "$REGION" \
        --allow-unauthenticated \
        --service-account="$SERVICE_ACCOUNT" \
        --memory="$MEMORY"
}

delete_service() {
    gcloud run services delete "$SERVICE_NAME" --region "$REGION" --quiet
}

if [ $# -ne 1 ]; then
    usage
fi

case "$(echo "$1" | tr '[:upper:]' '[:lower:]')" in
start | on)
    build_and_deploy
    ;;
stop | off)
    delete_service
    ;;
*)
    usage
    ;;
esac
