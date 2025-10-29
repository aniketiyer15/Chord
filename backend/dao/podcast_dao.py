# dao/podcast_dao.py

def insert_podcast(connection, title, duration, description):
    """
    Inserts a podcast into the audioform_podcast table.
    Returns the generated podcast_id.
    """
    # Set maximum length for description to 2048 characters.
    max_length = 2048
    if description and len(description) > max_length:
        description = description[:max_length]
    
    # Use default values for publisher, language, and total_episodes.
    # You can adjust these as needed.
    publisher = "Unknown"
    language = "en"
    total_episodes = 0
    
    sql = """
      INSERT INTO audioform_podcast (title, publisher, language, total_episodes, description)
      VALUES (%s, %s, %s, %s, %s)
    """
    with connection.cursor() as cursor:
        cursor.execute(sql, (title, publisher, language, total_episodes, description))
        podcast_id = cursor.lastrowid
    connection.commit()
    return podcast_id

def link_artist_podcast(connection, artist_id, podcast_id):
    """
    Inserts a link into the artist_podcast table.
    """
    sql = "INSERT INTO artist_podcast (artist_id, podcast_id) VALUES (%s, %s)"
    with connection.cursor() as cursor:
        cursor.execute(sql, (artist_id, podcast_id))
    connection.commit()
