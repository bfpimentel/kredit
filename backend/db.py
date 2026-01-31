import os
import psycopg2
from psycopg2.extras import RealDictCursor


def get_db_connection():
    conn = psycopg2.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        database=os.environ.get("DB_NAME", "kredit"),
        user=os.environ.get("DB_USER", "postgres"),
        password=os.environ.get("DB_PASSWORD", "postgres"),
        port=os.environ.get("DB_PORT", 5432),
    )
    return conn


def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL);"
    )
    conn.commit()
    cur.close()
    conn.close()
