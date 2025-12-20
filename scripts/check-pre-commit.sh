#!/bin/sh

if ! command -v pre-commit > /dev/null 2>&1; then
    printf "\033[0;31mError: you should install pre-commit first:\033[0m\n"
    printf "  pip install pre-commit\n"
    printf "or\n"
    printf "  pipx install pre-commit\n"
    printf "  uv tool install pre-commit\n\n"
    printf "then run \033[0;33mpre-commit install\033[0m\n\n"
    exit 1
fi
