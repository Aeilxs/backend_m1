#!/bin/bash
source "$(dirname "$0")/config.sh"

gcloud compute security-policies create "$ARMOR_POLICY_NAME" \
    --description="Autoriser uniquement la France et limiter le spam"

gcloud compute security-policies rules create 1000 \
    --security-policy="$ARMOR_POLICY_NAME" \
    --expression="origin.region_code == 'FR'" \
    --action="allow" \
    --description="Autorise uniquement la France"

gcloud compute security-policies rules create 1100 \
    --security-policy="$ARMOR_POLICY_NAME" \
    --expression="true" \
    --action=rate-based-ban \
    --rate-limit-threshold-count=100 \
    --rate-limit-threshold-interval-sec=60 \
    --ban-duration-sec=600 \
    --ban-threshold-count=200 \
    --ban-threshold-interval-sec=300 \
    --description="Limiter les abus"

gcloud compute security-policies rules create 2147483647 \
    --security-policy="$ARMOR_POLICY_NAME" \
    --expression="true" \
    --action="deny(403)" \
    --description="Blocage par défaut"
