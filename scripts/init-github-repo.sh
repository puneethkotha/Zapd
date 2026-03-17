#!/bin/bash
set -e

echo "Initializing ZAPD GitHub repository..."

# Create the repo (skip if exists)
gh repo create zapd --public --description "P2P EV charging marketplace" 2>/dev/null || echo "Repo may already exist"

# Get repo owner
OWNER=$(gh repo view --json owner -q .owner.login)
echo "Repository owner: $OWNER"

# Set branch protection (0 reviewers for solo open source)
gh api "repos/${OWNER}/zapd/branches/main/protection" \
  --method PUT \
  -f required_pull_request_reviews='{"required_approving_review_count":0}' \
  -f enforce_admins=false \
  -f required_status_checks=null \
  -f restrictions=null \
  2>/dev/null || echo "Branch protection may already be set"

# Create labels
for label in "bug" "enhancement" "documentation" "performance" "good first issue"; do
  gh label create "$label" 2>/dev/null || echo "Label $label exists"
done

# Add repo topics
gh repo edit --add-topic ev-charging --add-topic nextjs --add-topic supabase --add-topic stripe --add-topic mapbox --add-topic typescript 2>/dev/null || echo "Topics may already exist"

echo "✓ GitHub repository initialized"
