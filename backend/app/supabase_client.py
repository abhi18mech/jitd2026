import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ENV_PATH, encoding="utf-8-sig")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client | None = None

if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_supabase() -> Client:
    if supabase is None:
        raise RuntimeError("Supabase credentials are not configured.")
    return supabase


def test_connection():
    client = get_supabase()
    response = client.table("identity_records").select("id").limit(1).execute()
    return {
        "connected": True,
        "table": "identity_records",
        "accessible": response.data is not None
    }
