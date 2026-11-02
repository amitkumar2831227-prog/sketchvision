"""Central configuration. Secrets come from the environment, never from git."""
import os

class Config:
    # Set SECRET_KEY in the environment for any real deployment.
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-only-change-me")
    MAX_CONTENT_LENGTH = 8 * 1024 * 1024          # 8 MB upload limit (enforced by Flask)
    SESSION_COOKIE_HTTPONLY = True                  # JS cannot read the session cookie
    SESSION_COOKIE_SAMESITE = "Lax"                 # basic CSRF protection
    SESSION_COOKIE_SECURE = os.environ.get("FLASK_ENV") == "production"
    DATABASE = os.path.join(os.path.dirname(__file__), "instance", "sketchvision.db")
