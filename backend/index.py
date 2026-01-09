"""ASGI entry point for Vercel serverless deployment"""
from app import app

# Vercel serverless handler
__all__ = ["app"]
