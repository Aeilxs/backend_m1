#!/bin/bash

# GCP
export PROJECT_ID="contract-central-c710c"
export REGION="europe-west1"
export SERVICE_NAME="contract-central-backend-nestjs"

# Cloud Run
export MEMORY="1Gi"
export IMAGE_NAME="gcr.io/$PROJECT_ID/backend-gcp-pubsub"
export SERVICE_ACCOUNT="nest-backend@$PROJECT_ID.iam.gserviceaccount.com"

# Load Balancer
export LB_STATIC_IP_NAME="lb-static-ip"
export LB_BACKEND_NAME="lb-backend-service"
export LB_URL_MAP="lb-url-map"
export LB_PROXY="lb-http-proxy"
export LB_FWD_RULE="lb-forwarding-rule"

# Cloud Armor
export ARMOR_POLICY_NAME="cloud-armor-setting-nest-js"
