#!/bin/bash
cd /workspace/tvrf-command-center
echo "Committing pnpm-lock.yaml removal..."
git add -A
git commit -m "Remove pnpm-lock.yaml - fix Railway deployment

- Deleted pnpm-lock.yaml to resolve ERR_PNPM_OUTDATED_LOCKFILE error
- Using npm instead of pnpm for Railway deployment  
- Simple package.json with only express and cors dependencies
- .gitignore already excludes pnpm-lock.yaml
- Ready for Railway deployment"
git push
echo "Done!"