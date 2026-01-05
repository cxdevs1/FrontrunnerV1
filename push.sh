#!/bin/bash
# Quick push script - run: ./push.sh "your message"
git add .
git commit -m "${1:-Update progress}"
git push
echo "✓ Pushed to GitHub!"
