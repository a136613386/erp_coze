from functools import lru_cache
import os

from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()


def _env(*names: str, default: str | None = None) -> str | None:
    for name in names:
        value = os.getenv(name)
        if value:
            return value
    return default


class Settings(BaseModel):
    db_host: str = _env("ERP_DB_HOST", "MYSQL_HOST", default="127.0.0.1") or "127.0.0.1"
    db_port: int = int(_env("ERP_DB_PORT", "MYSQL_PORT", default="3306") or "3306")
    db_user: str = _env("ERP_DB_USER", "MYSQL_USER", default="root") or "root"
    db_password: str = _env("ERP_DB_PASSWORD", "MYSQL_PASSWORD", default="") or ""
    db_name: str = _env("ERP_DB_NAME", "MYSQL_DATABASE", default="erp_db") or "erp_db"


@lru_cache
def get_settings() -> Settings:
    return Settings()
