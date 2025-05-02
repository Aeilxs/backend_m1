#!/bin/bash
source "$(dirname "$0")/config.sh"

gcloud compute backend-services add-backend "$LB_BACKEND_NAME" \
    --global \
    --network-endpoint-group-type=SERVERLESS \
    --network-endpoint-group="$SERVICE_NAME" \
    --network-endpoint-group-region="$REGION"
