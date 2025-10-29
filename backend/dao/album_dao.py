# dao/album_dao.py
import datetime

def insert_album(connection, title, artist_db_id, release_date_str):
    """
    Inserts an album into the 'album' table.
    Parses release_date_str into a date.
    Returns the DB album_id (auto-incremented integer).
    """
    release_date = None
    if release_date_str:
        for fmt in ("%Y-%m-%d", "%Y-%m", "%Y"):
            try:
                release_date = datetime.datetime.strptime(release_date_str, fmt).date()
                break
            except ValueError:
                continue
    sql = "INSERT INTO album (title, artist_id, release_date) VALUES (%s, %s, %s)"
    with connection.cursor() as cursor:
        cursor.execute(sql, (title, artist_db_id, release_date))
        album_db_id = cursor.lastrowid  # Capture the DB-generated album id.
    connection.commit()
    return album_db_id
