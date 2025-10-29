# database.py
import pymysql
from db_config import DB_HOST, DB_USER, DB_PASS, DB_NAME

def get_connection():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )
