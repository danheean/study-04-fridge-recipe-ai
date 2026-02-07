# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VibeCoding 홍공 스터디 프로젝트 - OpenRouter API를 사용한 Python LLM 실습 프로젝트

## Development Setup

1. Create virtual environment: `uv venv`
2. Activate: `source .venv/bin/activate`
3. Install dependencies: `uv pip install -r requirements.txt`
4. Set up `.env` file with `OPENROUTER_API_KEY`

## Common Commands

- **Run example**: `python example.py`
- **Install dependencies**: `uv pip install -r requirements.txt`
- **Add new package**: `uv pip install <package>` then update `requirements.txt`

## Architecture

### Configuration (`config.py`)
- Loads environment variables using `python-dotenv`
- Validates `OPENROUTER_API_KEY` presence
- Defines available models and API endpoints
- Centralizes all configuration for easy maintenance

### API Integration (`example.py`)
- `chat_completion()`: Main function for OpenRouter API calls
- Uses `requests` library for HTTP calls
- Includes error handling and response parsing
- Default model: `upstage/solar-pro-3:free`

## Security

- `.env` file contains sensitive API keys and is gitignored
- Never commit API keys or tokens
- Use `.env.example` as template for new developers
