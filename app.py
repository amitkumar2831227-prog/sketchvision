"""SketchVision Flask entry point.

Foundation stage: serves the single-page shell, the service worker (which must
live at the site root to control the whole scope) and a health endpoint.
Later modules plug in as Flask blueprints (auth, gallery, vision, progress).
"""
from flask import Flask, jsonify, render_template, send_from_directory
from config import Config


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/sw.js")
    def service_worker():
        # Served from "/" so the worker's scope covers the entire app.
        resp = send_from_directory(app.static_folder, "sw.js", mimetype="application/javascript")
        resp.headers["Cache-Control"] = "no-cache"   # always check for a new worker
        return resp

    @app.route("/api/health")
    def health():
        # The frontend uses this to tell "offline" apart from "server down".
        return jsonify(status="ok", app="SketchVision")

    @app.after_request
    def security_headers(resp):
        resp.headers["X-Content-Type-Options"] = "nosniff"
        resp.headers["X-Frame-Options"] = "DENY"
        resp.headers["Referrer-Policy"] = "same-origin"
        # Everything is self-hosted; no third-party scripts or APIs.
        resp.headers["Content-Security-Policy"] = (
            "default-src 'self'; img-src 'self' data: blob:; style-src 'self'; script-src 'self'"
        )
        return resp

    return app


if __name__ == "__main__":
    create_app().run(debug=True, host="0.0.0.0", port=5000)
