from collections.abc import Sequence
from typing import Any

import pymysql
from pymysql.cursors import DictCursor

from qa_core.config.settings import get_settings


def get_connection():
    settings = get_settings()
    return pymysql.connect(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        database=settings.db_name,
        charset="utf8mb4",
        cursorclass=DictCursor,
        autocommit=True,
    )


def query_all(sql: str, params: Sequence[Any] | None = None) -> list[dict[str, Any]]:
    normalized = sql.strip().lower()
    if not normalized.startswith("select"):
        raise ValueError("Only SELECT statements are allowed in AI tools")

    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(sql, params or ())
            rows = cursor.fetchall()
            return list(rows)
