#!/bin/bash
source "$(dirname "$0")/config.sh"

gcloud run services delete "$SERVICE_NAME" --region "$REGION" --quiet
