"""ASGI entry point for Vercel serverless deployment"""
import sys
from app import app

# For Vercel serverless
__all__ = ["app"]
