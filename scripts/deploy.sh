#!/bin/bash
source "$(dirname "$0")/config.sh"

gcloud builds submit --tag "$IMAGE_NAME"

gcloud run deploy "$SERVICE_NAME" \
    --image "$IMAGE_NAME" \
    --platform managed \
    --region "$REGION" \
    --allow-unauthenticated \
    --service-account="$SERVICE_ACCOUNT" \
    --memory="$MEMORY"
