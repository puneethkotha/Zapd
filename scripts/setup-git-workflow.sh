#!/bin/bash
# Creates 16 PRs from the 16 conventional commits on the current branch.
# Run from a branch that has 16 commits ahead of main (e.g. commit-changes).
# Uses squash merge, no co-authors. Requires gh CLI.
set -e

SOURCE_BRANCH=$(git branch --show-current)
COMMITS=(
  "feat: initialize Next.js 15 project with full tooling stack"
  "feat(db): add complete Supabase schema with RLS policies and seed data"
  "feat(auth): add auth flow with Supabase and Google OAuth"
  "feat(ui): add design system with dark theme and Radix components"
  "feat(layout): add root layout with ThemeProvider, QueryProvider, SupabaseProvider"
  "feat(map): add Mapbox map view with station markers and controls"
  "feat(dashboard): add dashboard with nearby stations and layout"
  "feat(station): add station card, grid, detail, and booking modal"
  "feat(booking): add Stripe checkout and webhook for payments"
  "feat(bookings): add bookings list and booking detail pages"
  "feat(host): add host dashboard, station management, and earnings chart"
  "feat(session): add live session card and timeline components"
  "feat(profile): add user profile page"
  "feat(stations): add public station detail page with client component"
  "chore: add upload API, Supabase functions, and tooling config"
  "docs: update README for ZAPD Next.js project"
)

# Get commit SHAs (oldest first) - 16 commits from main
COMMIT_SHAS=($(git log main.."$SOURCE_BRANCH" --reverse --format="%H"))
if [ ${#COMMIT_SHAS[@]} -ne 16 ]; then
  echo "Expected 16 commits, found ${#COMMIT_SHAS[@]}. Run from branch with 16 commits ahead of main."
  git log main.."$SOURCE_BRANCH" --oneline
  exit 1
fi

echo "Creating 16 PRs with squash merge (no co-authors)..."
for i in {0..15}; do
  n=$((i + 1))
  branch="feat/pr-${n}"
  title="${COMMITS[$i]}"
  echo ""
  echo "[$n/16] $title"

  git checkout main
  git pull origin main 2>/dev/null || true
  git branch -D "$branch" 2>/dev/null || true
  git checkout -b "$branch" main
  git cherry-pick "${COMMIT_SHAS[$i]}" --no-commit
  git commit -m "$title"
  git push origin "$branch" -f

  pr=$(gh pr create --base main --head "$branch" --title "$title" --body "Squash merge of PR #$n" 2>/dev/null || gh pr list --head "$branch" -q '.[0].number')
  gh pr merge "$pr" --squash --auto 2>/dev/null || gh pr merge "$pr" --squash

  git checkout main
  git pull origin main
done

echo ""
echo "✓ All 16 PRs created and squash-merged to main"
