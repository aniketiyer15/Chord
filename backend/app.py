import datetime
import pymysql
from flask import Flask, request, jsonify
from database import get_connection

app = Flask(__name__)

def fetch_playlist_details(pid):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL get_playlist_stats(%s);", (pid,))
            header_result = cur.fetchall()

            if not header_result:
                return None, None
            header = header_result[0]
            cur.execute("CALL get_playlist_songs(%s);", (pid,))
            songs = cur.fetchall()

    finally:
        conn.close()

    return header, songs



def add_song_to_playlist(pid, song_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.callproc("sp_add_song_to_playlist", (pid, song_id))
        conn.commit()
    finally:
        conn.close()


def search_songs(term, limit=20):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL search_songs_by_title(%s, %s);", (term, limit))
            results = cur.fetchall()
            return results
    finally:
        conn.close()


@app.route("/api/playlists", methods=["GET"])
def api_list_playlists():
    """Return id + name for every playlist (used by PlaylistList page)."""
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL get_user_playlists(%s);", (user_id,))
            rows = cur.fetchall()
    finally:
        conn.close()

    return jsonify(rows), 200


@app.route("/api/playlists", methods=["POST"])
def create_playlist():
    data = request.get_json()
    user_id = data.get("user_id")
    playlist_name = data.get("playlist_name")
    playlist_type = data.get("playlist_type", True) 

    if not user_id or not playlist_name:
        return jsonify({"error": "Missing user_id or playlist_name"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.callproc("sp_create_playlist", (user_id, playlist_name, playlist_type))
            result = cur.fetchone()
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

    return jsonify({"playlist_id": result.get("playlist_id")}), 201

@app.route("/api/playlists/<int:pid>/songs/<int:song_id>", methods=["DELETE"])
def api_delete_song(pid, song_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.callproc("sp_delete_song_from_playlist", (pid, song_id))
        conn.commit()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
    return jsonify({"message": "Song deleted"}), 200

@app.route("/api/playlists/<int:pid>", methods=["DELETE"])
def api_delete_playlist(pid):
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "Missing user ID"}), 400
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.callproc("sp_delete_playlist", (pid, user_id))
        conn.commit()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
    return jsonify({"message": "Playlist deleted"}), 200



@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email_id")
    password = data.get("pass")

    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("CALL get_artist_by_credentials(%s, %s);", (email, password))
            artist = cursor.fetchone()
            if artist:
                print("Artist logging in")
                return jsonify({
                    "id": artist["id"],
                    "name": artist["first_name"],
                    "role": "artist"
                }), 200

            cursor.execute("CALL get_user_by_credentials(%s, %s);", (email, password))
            user = cursor.fetchone()
            if user:
                print("User logging in")
                return jsonify({
                    "id": user["id"],
                    "name": user["first_name"],
                    "role": "user"
                }), 200
            
            cursor.execute(
                "SELECT admin_id AS id, first_name FROM admin WHERE email_id = %s AND pass = %s",
                (email, password)
            )
            admin = cursor.fetchone()
            if admin:
                print("Admin logging in")
                return jsonify({
                    "id": admin["id"],
                    "name": admin["first_name"],
                    "role": "admin"
                }), 200

    finally:
        conn.close()

    return jsonify({"error": "Invalid credentials"}), 401


@app.route("/api/users", methods=["POST"])
def create_user():
    data = request.get_json()

    required = ["email_id", "pass", "first_name", "last_name", "telephone_number", "account_creation_date", "role"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing {field}"}), 400

    email_id = data["email_id"]
    password = data["pass"]
    first_name = data["first_name"]
    last_name = data["last_name"]
    telephone_number = data["telephone_number"]
    creation_date = data["account_creation_date"]
    role = data["role"]

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            if role == "artist":
                artist_type = data.get("type")
                description = data.get("description")

                if not artist_type or not description:
                    return jsonify({"error": "Missing artist type or description"}), 400

                cur.execute("CALL create_artist(%s, %s, %s, %s, %s, %s, %s, %s);", (
                    email_id, password, first_name, last_name, telephone_number, creation_date,
                    artist_type, description
                ))
            else:
                cur.execute("CALL create_user(%s, %s, %s, %s, %s, %s);", (
                    email_id, password, first_name, last_name, telephone_number, creation_date
                ))

        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

    return jsonify({"message": "User created successfully"}), 201




@app.route("/api/playlists/<int:pid>/rename", methods=["PUT"])
def rename_playlist(pid):
    data = request.get_json()
    new_name = data.get("new_name")
    if not new_name:
        return jsonify({"error": "New name required"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.callproc("sp_rename_playlist", (pid, new_name))
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

    return jsonify({"message": "Playlist renamed"}), 200


@app.route("/api/playlists/<int:pid>", methods=["GET"])
def api_get_playlist(pid):
    header, songs = fetch_playlist_details(pid)
    if not header:
        return jsonify({"error": "Playlist not found"}), 404
    return jsonify({
        "playlist_id": pid,
        "playlist_name": header["playlist_name"],
        "total_songs": int(header["total_songs"]),
        "total_duration": int(header["total_duration"]),
        "creator" : header["creator"],
        "songs": songs
    }), 200


@app.route("/api/playlists/<int:pid>/songs", methods=["POST"])
def api_add_song(pid):
    song_id = request.get_json().get("song_id")
    if not song_id:
        return jsonify({"error": "song_id required"}), 400
    add_song_to_playlist(pid, song_id)
    return jsonify({"message": "Song added"}), 200


@app.route("/api/songs", methods=["GET"])
def api_search_songs():
    term = request.args.get("query", "")
    return jsonify(search_songs(term)), 200


@app.route("/api/artist/audioforms", methods=["GET"])
def artist_audioforms():
    artist_id = request.args.get("artist_id", type=int)
    if not artist_id:
        return jsonify({"error": "Missing artist_id"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            audioforms = []

            cur.execute("""
                SELECT s.song_id AS id, s.title, 'Song' AS type,
                       s.duration, s.loudness, s.genre_id,
                       (SELECT album_id FROM album_song WHERE song_id = s.song_id LIMIT 1) AS album_id
                FROM audioform_song s
                JOIN artist_song a ON s.song_id = a.song_id
                WHERE a.artist_id = %s
            """, (artist_id,))
            audioforms.extend(cur.fetchall())

            cur.execute("""
                SELECT al.album_id AS id, al.title, 'Album' AS type, al.release_date
                FROM album al
                WHERE al.artist_id = %s
            """, (artist_id,))
            audioforms.extend(cur.fetchall())

            cur.execute("""
                SELECT p.podcast_id AS id, p.title, 'Podcast' AS type,
                       p.description, p.language, p.publisher, p.total_episodes
                FROM audioform_podcast p
                JOIN artist_podcast a ON p.podcast_id = a.podcast_id
                WHERE a.artist_id = %s
            """, (artist_id,))
            audioforms.extend(cur.fetchall())

            cur.execute("""
                SELECT ab.audiobook_id AS id, ab.title, 'Audiobook' AS type,
                       ab.description, ab.author, ab.publisher, ab.total_chapters
                FROM audioform_audiobook ab
                JOIN artist_audiobook a ON ab.audiobook_id = a.audiobook_id
                WHERE a.artist_id = %s
            """, (artist_id,))
            audioforms.extend(cur.fetchall())

    finally:
        conn.close()

    return jsonify(audioforms), 200





@app.route("/api/home-recommendations", methods=["GET"])
def home_recommendations():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL get_random_songs(%s);", (3,))
            songs = cur.fetchall()
            cur.nextset() 

            cur.execute("CALL get_random_albums(%s);", (3,))
            albums = cur.fetchall()
            cur.nextset()

            cur.execute("CALL get_random_genres(%s);", (3,))
            genres = cur.fetchall()

        return jsonify({
            "songs": songs,
            "albums": albums,
            "genres": genres
        }), 200

    finally:
        conn.close()

@app.route("/api/search", methods=["GET"])
def search_all():
    query = request.args.get("q", "").strip()
    user_id = request.args.get("user_id", type=int)
    if not query:
        return jsonify({"error": "Query required"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            def qlike(): return f"%{query}%"

            cur.execute("CALL search_liked_songs_by_user(%s, %s);", (user_id, query))
            songs = cur.fetchall()

            cur.execute("CALL search_albums_by_title_with_artist(%s);", (query,))
            albums = cur.fetchall()

            cur.execute("CALL search_public_playlists_by_name(%s);", (query,))
            playlists = cur.fetchall()

            cur.execute("CALL search_liked_podcasts_by_user(%s, %s);", (user_id, query))
            podcasts = cur.fetchall()

            cur.execute("CALL search_liked_audiobooks_by_user(%s, %s);", (user_id, query))
            audiobooks = cur.fetchall()

            cur.execute("CALL search_artists_by_name_random(%s);", (query,))
            artists = cur.fetchall()

            cur.execute("CALL search_users_by_name_or_email(%s);", (query,))
            users = cur.fetchall()

            cur.execute("CALL search_genres_by_name(%s);", (query,))
            genres = cur.fetchall()

    finally:
        conn.close()

    return jsonify({
        "songs": songs,
        "albums": albums,
        "playlists": playlists,
        "podcasts": podcasts,
        "audiobooks": audiobooks,
        "artists": artists,
        "users": users,
        "genres": genres
    }), 200

@app.route("/api/update-phone", methods=["POST"])
def update_phone():
    data = request.get_json()
    user_id = data.get("user_id")
    phone = data.get("telephone_number")

    if not user_id or phone is None:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL update_user_phone(%s, %s);", (user_id, phone))
        conn.commit()
    finally:
        conn.close()

    return jsonify({"message": "Phone updated successfully"}), 200


@app.route("/api/follow", methods=["POST"])
def follow_user():
    data = request.get_json()
    user_id = data.get("user_id")          
    follower_id = data.get("follower_id")   

    if user_id == follower_id:
        return jsonify({"error": "You cannot follow yourself"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL follow_user(%s, %s);", (user_id, follower_id))
        conn.commit()
    finally:
        conn.close()

    return jsonify({"message": "Followed successfully"}), 200

@app.route("/api/unfollow", methods=["POST"])
def unfollow_user():
    data = request.get_json()
    user_id = data.get("user_id")           
    follower_id = data.get("follower_id")  

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL unfollow_user(%s, %s);", (user_id, follower_id))
        conn.commit()
    finally:
        conn.close()

    return jsonify({"message": "Unfollowed successfully"}), 200


@app.route("/api/following", methods=["GET"])
def get_following_users():
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL get_followed_users(%s);", (user_id,))
            following = cur.fetchall()
    finally:
        conn.close()

    return jsonify(following), 200



@app.route("/api/profile", methods=["GET"])
def get_user_profile():
    user_id = request.args.get("user_id")

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL get_user_profile(%s);", (user_id,))
            user = cur.fetchone()
            if not user:
                return jsonify({"error": "User not found"}), 404

            cur.execute("CALL count_public_playlists_by_user(%s);", (user_id,))
            playlists = cur.fetchone()

            cur.execute("CALL get_user_follow_stats(%s);", (user_id,))
            follow_data = cur.fetchone()

    finally:
        conn.close()

    return jsonify({
        "name": user["first_name"],
        "joinedDate": user["account_creation_date"].isoformat(),
        "playlistsCount": playlists["count"],
        "followers": follow_data["followers"],
        "following": follow_data["following"],
        "telephone_number": user["telephone_number"]
    }), 200


@app.route("/api/albums/<int:album_id>", methods=["GET"])
def get_album_details(album_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL get_album_details(%s);", (album_id,))
            album = cur.fetchone()
            if not album:
                return jsonify({"error": "Album not found"}), 404

            cur.execute("CALL get_songs_in_album(%s);", (album_id,))
            songs = cur.fetchall()

    finally:
        conn.close()

    return jsonify({
        "id": album_id,
        "title": album["title"],
        "artist": album["artist_name"],
        "year": album["release_date"],
        "duration": "Unknown",  
        "songs": songs
    })

@app.route("/api/genres", methods=["GET"])
def get_genres():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT genre_id, name FROM genre")
            genres = cur.fetchall()
    finally:
        conn.close()
    return jsonify(genres), 200

@app.route("/api/create-song", methods=["POST"])
def create_song():
    data = request.get_json()
    required = ["title", "duration", "loudness", "genre_id", "artist_id"]
    if not all(data.get(k) for k in required):
        return jsonify({"error": "Missing fields"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.callproc("sp_create_song", (
                data["artist_id"], data["title"], data["duration"],
                data["loudness"], data["genre_id"]
            ))
        conn.commit()
    finally:
        conn.close()
    return jsonify({"message": "Song created"}), 201

@app.route("/api/create-podcast", methods=["POST"])
def create_podcast():
    data = request.get_json()
    required = ["title", "description", "language", "publisher", "total_episodes", "artist_id"]
    if not all(data.get(k) for k in required):
        return jsonify({"error": "Missing fields"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.callproc("sp_create_podcast", (
                data["artist_id"], data["title"], data["description"],
                data["language"], data["publisher"], data["total_episodes"]
            ))
        conn.commit()
    finally:
        conn.close()
    return jsonify({"message": "Podcast created"}), 201

@app.route("/api/create-audiobook", methods=["POST"])
def create_audiobook():
    data = request.get_json()
    required = ["title", "description", "author", "publisher", "total_chapters", "artist_id"]
    if not all(data.get(k) for k in required):
        return jsonify({"error": "Missing fields"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.callproc("sp_create_audiobook", (
                data["artist_id"], data["title"], data["description"],
                data["author"], data["publisher"], data["total_chapters"]
            ))
        conn.commit()
    finally:
        conn.close()
    return jsonify({"message": "Audiobook created"}), 201

@app.route("/api/create-album", methods=["POST"])
def create_album():
    data = request.get_json()
    required = ["title", "release_date", "artist_id"]
    if not all(data.get(k) for k in required):
        return jsonify({"error": "Missing fields"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.callproc("sp_create_album", (
                data["artist_id"], data["title"], data["release_date"]
            ))
        conn.commit()
    finally:
        conn.close()
    return jsonify({"message": "Album created"}), 201

@app.route("/api/albums/<int:album_id>/songs", methods=["POST"])
def add_song_to_album(album_id):
    data = request.get_json()
    artist_id = data.get("artist_id")
    title = data.get("title")
    duration = data.get("duration")
    loudness = data.get("loudness")
    genre_id = data.get("genre_id")
    
    if not all([artist_id, title, duration, loudness, genre_id]):
        return jsonify({"error": "Missing song data"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.callproc("sp_create_song_in_album", (artist_id, album_id, title, duration, loudness, genre_id))
        conn.commit()
        return jsonify({"message": "Song added to album"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route("/api/albums/<int:album_id>", methods=["GET"])
def get_album(album_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT title, release_date FROM album WHERE album_id = %s", (album_id,))
            album = cur.fetchone()
            
            cur.execute("CALL get_album_songs_with_genre(%s);", (album_id,))
            songs = cur.fetchall()
    finally:
        conn.close()

    return jsonify({ "album": album, "songs": songs }), 200


@app.route("/api/albums/<int:album_id>", methods=["DELETE"])
def delete_album(album_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            
            cur.execute("CALL delete_album_and_songs(%s);", (album_id,))
        conn.commit()
    finally:
        conn.close()
    return jsonify({"message": "Album deleted"}), 200



@app.route("/api/albums/<int:album_id>/songs/<int:song_id>", methods=["DELETE"])
def remove_song_from_album(album_id, song_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL remove_song_from_album(%s, %s);", (album_id, song_id))
        conn.commit()
    finally:
        conn.close()
    return jsonify({"message": "Song removed from album"}), 200


@app.route("/api/albums/<int:album_id>", methods=["PUT"])
def update_album(album_id):
    data = request.get_json()
    required = ["title", "release_date"]
    if not all(data.get(k) for k in required):
        return jsonify({"error": "Missing album data"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL update_album_details(%s, %s, %s);",(album_id, data["title"], data["release_date"]))
        conn.commit()
    finally:
        conn.close()

    return jsonify({"message": "Album updated"}), 200



@app.route("/api/songs/<int:song_id>", methods=["PUT"])
def update_song(song_id):
    data = request.get_json()
    required = ["title", "duration", "loudness", "genre_id"]
    if not all(data.get(k) for k in required):
        return jsonify({"error": "Missing song data"}), 400

    new_album_id = data.get("album_id") 
    if new_album_id == "":
        new_album_id = None


    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE audioform_song
                SET title = %s, duration = %s, loudness = %s, genre_id = %s
                WHERE song_id = %s
            """, (data["title"], data["duration"], data["loudness"], data["genre_id"], song_id))

            cur.execute("SELECT album_id FROM album_song WHERE song_id = %s", (song_id,))
            current_album_row = cur.fetchone()
            current_album_id = current_album_row["album_id"] if current_album_row else None

            if new_album_id and new_album_id != current_album_id:
                cur.execute("DELETE FROM album_song WHERE song_id = %s", (song_id,))
                cur.execute("INSERT INTO album_song (album_id, song_id) VALUES (%s, %s)",
                            (new_album_id, song_id))
            elif new_album_id is None and current_album_id:
                cur.execute("DELETE FROM album_song WHERE song_id = %s", (song_id,))

        conn.commit()
    finally:
        conn.close()

    return jsonify({"message": "Song updated"}), 200



@app.route("/api/podcasts/<int:podcast_id>", methods=["PUT"])
def update_podcast(podcast_id):
    data = request.get_json()
    required = ["title", "description", "language", "publisher", "total_episodes"]
    if not all(data.get(k) for k in required):
        return jsonify({"error": "Missing podcast data"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "CALL update_podcast_details(%s, %s, %s, %s, %s, %s);",
                (
                    podcast_id,
                    data["title"],
                    data["description"],
                    data["language"],
                    data["publisher"],
                    data["total_episodes"]
                )
            )
        conn.commit()
    finally:
        conn.close()

    return jsonify({"message": "Podcast updated"}), 200


@app.route("/api/podcasts/<int:podcast_id>", methods=["DELETE"])
def delete_podcast(podcast_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL delete_podcast(%s);", (podcast_id,))
        conn.commit()
    finally:
        conn.close()
    return jsonify({"message": "Podcast deleted"}), 200


@app.route("/api/audiobooks/<int:audiobook_id>", methods=["PUT"])
def update_audiobook(audiobook_id):
    data = request.get_json()
    required = ["title", "description", "author", "publisher", "total_chapters"]
    if not all(data.get(k) for k in required):
        return jsonify({"error": "Missing audiobook data"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "CALL update_audiobook_details(%s, %s, %s, %s, %s, %s);",
                (
                    audiobook_id,
                    data["title"],
                    data["description"],
                    data["author"],
                    data["publisher"],
                    data["total_chapters"]
                )
            )
        conn.commit()
    finally:
        conn.close()

    return jsonify({"message": "Audiobook updated"}), 200


@app.route("/api/audiobooks/<int:audiobook_id>", methods=["DELETE"])
def delete_audiobook(audiobook_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL delete_audiobook(%s);", (audiobook_id,))
        conn.commit()
    finally:
        conn.close()
    return jsonify({"message": "Audiobook deleted"}), 200



@app.route("/api/songs/<int:song_id>", methods=["DELETE"])
def delete_song(song_id):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL delete_song(%s);", (song_id,))
        conn.commit()
    finally:
        conn.close()
    return jsonify({"message": "Song deleted"}), 200

@app.route("/api/like-song", methods=["POST"])
def like_song():
    data = request.get_json()
    print(data)
    user_id = data.get("user_id")
    song_id = data.get("song_id")

    if not user_id or not song_id:
        return jsonify({"error": "Missing user_id or song_id"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL like_song(%s, %s);", (user_id, song_id))
        conn.commit()
    finally:
        conn.close()

    return jsonify({"message": "Song liked"}), 200

@app.route("/api/like-audiobook", methods=["POST"])
def like_audiobook():
    data = request.get_json()
    user_id = data.get("user_id")
    audiobook_id = data.get("audiobook_id")
    if not user_id or not audiobook_id:
        return jsonify({"error": "Missing data"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL like_audiobook(%s, %s);", (user_id, audiobook_id))
        conn.commit()
    finally:
        conn.close()
    return jsonify({"message": "Audiobook liked"}), 201

@app.route("/api/like-podcast", methods=["POST"])
def like_podcast():
    data = request.get_json()
    user_id = data.get("user_id")
    podcast_id = data.get("podcast_id")
    if not user_id or not podcast_id:
        return jsonify({"error": "Missing data"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL like_podcast(%s, %s);", (user_id, podcast_id))
        conn.commit()
    finally:
        conn.close()
    return jsonify({"message": "Podcast liked"}), 201


@app.route("/api/artist/albums", methods=["GET"])
def get_artist_albums_grouped():
    artist_id = request.args.get("artist_id")
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL get_albums_by_artist(%s);", (artist_id,))
            albums = cur.fetchall()

            for album in albums:
                cur.execute("CALL get_songs_by_album(%s);", (album["album_id"],))
                album["songs"] = cur.fetchall()

    finally:
        conn.close()
    return jsonify(albums)

@app.route("/api/artist/albums/songs", methods=["GET"])
def get_artist_albums_with_songs():
    artist_id = request.args.get("artist_id")
    if not artist_id:
        return jsonify({"error": "artist_id is required"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("CALL get_album_summaries_by_artist(%s);", (artist_id,))
            albums = cur.fetchall()

            album_map = {album['album_id']: {**album, "songs": []} for album in albums}
            album_ids = tuple(album_map.keys())

            if album_ids:
                cur.execute(f"""
                    SELECT a.album_id, s.song_id, s.title, s.duration, s.loudness, g.name AS genre
                    FROM album_song a
                    JOIN audioform_song s ON a.song_id = s.song_id
                    JOIN genre g ON s.genre_id = g.genre_id
                    WHERE a.album_id IN {album_ids if len(album_ids) > 1 else f"({album_ids[0]})"}
                """)
                for song in cur.fetchall():
                    album_map[song['album_id']]['songs'].append(song)
    finally:
        conn.close()

    return jsonify(list(album_map.values()))

@app.route("/api/admin/statistics", methods=["GET"])
def get_admin_statistics():
    conn = get_connection()
    try:
        
        cursor = conn.cursor()
        cursor.execute("CALL get_dashboard_stats();")
        stats = cursor.fetchone()

        print("stats :", stats)
        cursor.close()
        return jsonify(stats), 200

    except Exception as e:
        print("error handling")
        return jsonify({"error": str(e)}), 500


@app.route("/api/admin/users", methods=["GET"])
def get_all_users():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("CALL get_all_users_basic_info();")
        users = cursor.fetchall()
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/admin/delete-user', methods=['POST'])
def delete_user():
    data = request.get_json()
    user_id = data.get('user_id')

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.callproc('delete_user', [user_id])
        conn.commit()
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/admin/songs", methods=["GET"])

def get_all_songs():

    conn = get_connection()

    cur = conn.cursor()

    try:

        

        cur.execute("SELECT song_id, title FROM audioform_song")

        songs = cur.fetchall()

        return jsonify(songs), 200

    except Exception as e:

        return jsonify({"error": str(e)}), 500

    finally:

        cur.close()

        conn.close()



@app.route("/api/admin/delete-song", methods=["POST"])

def delete_song_admin():

    data = request.get_json()

    song_id = data.get("song_id")

    print("song id",data)

    conn = get_connection()

    try:

        cur = conn.cursor()

        cur.execute("CALL delete_song_by_id(%s)", (song_id,))

        conn.commit()

        return jsonify({"message": "Song deleted successfully"}), 200

    except Exception as e:

        return jsonify({"error": str(e)}), 500

    finally:

        cur.close()

        conn.close()



@app.route("/api/admin/albums", methods=["GET"])

def get_admin_albums():

    conn = get_connection()

    try:


        cursor = conn.cursor()

        cursor.execute("SELECT album_id, title FROM album")

        albums = cursor.fetchall()

        cursor.close()

        return jsonify(albums), 200

    finally:

        conn.close()


if __name__ == "__main__":
    app.run(debug=True)