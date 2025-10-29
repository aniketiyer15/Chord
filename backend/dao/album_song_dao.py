# dao/album_song_dao.py

def insert_album_song(connection, song_id, album_db_id):
    """
    Inserts a row into album_song table linking a song with an album.
    """
    sql = "INSERT INTO album_song (song_id, album_id) VALUES (%s, %s)"
    with connection.cursor() as cursor:
        cursor.execute(sql, (song_id, album_db_id))
    connection.commit()
