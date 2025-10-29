import random
import datetime

def insert_artist(connection, name, artist_type="singer"):
    """
    Inserts an artist into the 'artist' table.
    Splits the name into first and last (if possible) and uses a dummy email (with a 4-digit random number).
    Returns the generated artist_id.
    """
    parts = name.strip().split()
    first_name = parts[0][:32] if parts else ""
    last_name = " ".join(parts[1:])[:32] if len(parts) > 1 else ""
    
    # Create a dummy email by appending a random 4-digit number.
    random_digits = random.randint(1000, 9999)
    email_id = (name.replace(" ", "").lower() + str(random_digits) + "@spotify.com")[:64]
    
    password = "defaultpass"
    telephone_number = None
    account_creation_date = datetime.date.today()
    description = "Auto-inserted from Spotify data"
    
    sql = """
      INSERT INTO artist (email_id, pass, first_name, last_name, telephone_number, account_creation_date, type, description)
      VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    with connection.cursor() as cursor:
        cursor.execute(sql, (
            email_id,
            password,
            first_name,
            last_name,
            telephone_number,
            account_creation_date,
            artist_type,
            description
        ))
        artist_id = cursor.lastrowid
    connection.commit()
    return artist_id
