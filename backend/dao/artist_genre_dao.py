# dao/artist_genre_dao.py

def link_artist_genre(connection, artist_id, genre_id):
    """
    Inserts a link into the artist_genre table.
    """
    sql = "INSERT INTO artist_genre (artist_id, genre_id) VALUES (%s, %s)"
    with connection.cursor() as cursor:
        cursor.execute(sql, (artist_id, genre_id))
    connection.commit()
