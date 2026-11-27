"""Shared Firebase Admin initialization for Vercel and Google Cloud runtimes."""

from __future__ import annotations

import os
from typing import Any


def get_firebase_admin_app() -> Any:
    import firebase_admin

    try:
        return firebase_admin.get_app()
    except ValueError:
        from firebase_admin import credentials

        project_id = (
            os.getenv("FIREBASE_PROJECT_ID")
            or os.getenv("GOOGLE_CLOUD_PROJECT")
            or os.getenv("GCLOUD_PROJECT")
            or "examhub-india-6ba59"
        )
        email = os.getenv("FIREBASE_CLIENT_EMAIL", "").strip()
        private_key = os.getenv("FIREBASE_PRIVATE_KEY", "").strip().replace("\\n", "\n")
        if email and private_key:
            credential = credentials.Certificate({
                "type": "service_account",
                "project_id": project_id,
                "client_email": email,
                "private_key": private_key,
                "token_uri": "https://oauth2.googleapis.com/token",
            })
            return firebase_admin.initialize_app(credential, {"projectId": project_id})

        # Google Cloud runtimes may use their attached service identity instead.
        return firebase_admin.initialize_app(options={"projectId": project_id})
