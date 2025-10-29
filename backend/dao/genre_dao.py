# dao/genre_dao.py

def insert_genre_if_not_exists(connection, genre_name):
    """
    Inserts a genre if it doesn't exist in the 'genre' table.
    Returns the genre_id.
    """
    select_sql = "SELECT genre_id FROM genre WHERE name = %s"
    insert_sql = "INSERT INTO genre (name, description) VALUES (%s, %s)"
    with connection.cursor() as cursor:
        cursor.execute(select_sql, (genre_name,))
        row = cursor.fetchone()
        if row:
            return row["genre_id"]
        cursor.execute(insert_sql, (genre_name, "Inserted from Spotify data"))
        new_genre_id = cursor.lastrowid
    connection.commit()
    return new_genre_id
