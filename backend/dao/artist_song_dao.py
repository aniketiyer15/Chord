# dao/artist_song_dao.py

def insert_artist_song(connection, artist_id, song_id):
    """
    Inserts a link into the artist_song table.
    """
    sql = "INSERT INTO artist_song (artist_id, song_id) VALUES (%s, %s)"
    with connection.cursor() as cursor:
        cursor.execute(sql, (artist_id, song_id))
    connection.commit()
