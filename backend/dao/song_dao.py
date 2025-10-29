# dao/song_dao.py

def insert_song(connection, title, duration, loudness, genre_id):
    """
    Inserts a song into audioform_song.
    Returns the generated song_id.
    """
    sql = """
      INSERT INTO audioform_song (title, duration, loudness, genre_id)
      VALUES (%s, %s, %s, %s)
    """
    with connection.cursor() as cursor:
        cursor.execute(sql, (title, duration, loudness, genre_id))
        song_id = cursor.lastrowid
    connection.commit()
    return song_id
