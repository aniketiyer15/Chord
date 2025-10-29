# dao/audiobook_dao.py

def insert_audiobook(connection, title, duration, author, description):
    """
    Inserts an audiobook into the 'audioform_audiobook' table.
    Returns the generated audiobook_id.
    Ensures the description does not exceed 1028 characters.
    """
    max_length = 1028
    if description and len(description) > max_length:
        description = description[:max_length]
    
    sql = """
      INSERT INTO audioform_audiobook (title, author, publisher, total_chapters, description)
      VALUES (%s, %s, %s, %s, %s)
    """
    # For simplicity, we set publisher to the same as author and default total_chapters to 0.
    publisher = author
    total_chapters = 0
    with connection.cursor() as cursor:
        cursor.execute(sql, (title, author, publisher, total_chapters, description))
        audiobook_id = cursor.lastrowid
    connection.commit()
    return audiobook_id

def link_artist_audiobook(connection, artist_id, audiobook_id):
    """
    Inserts a link into artist_audiobook table.
    """
    sql = "INSERT INTO artist_audiobook (artist_id, audiobook_id) VALUES (%s, %s)"
    with connection.cursor() as cursor:
        cursor.execute(sql, (artist_id, audiobook_id))
    connection.commit()
