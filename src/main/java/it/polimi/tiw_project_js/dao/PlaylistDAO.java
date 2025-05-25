package it.polimi.tiw_project_js.dao;

import it.polimi.tiw_project_js.beans.Playlist;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class PlaylistDAO {
    private final Connection connection;

    public PlaylistDAO(Connection connection) {
        this.connection = connection;
    }

    /**
     * Gets all the playlists created by the given user
     *
     * @param userId id of the user
     * @return a list of playlists, with the songs attribute as null
     * @throws SQLException
     */
    public List<Playlist> getPlaylists(int userId) throws SQLException {
        String query = "SELECT id, title, date " +
                "FROM playlists " +
                "WHERE user_id = ? " +
                "GROUP BY id, date " +
                "ORDER BY title, date DESC ";

        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, userId);

            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.isBeforeFirst()) {
                    return null;
                }

                List<Playlist> playlists = new ArrayList<>();
                while (resultSet.next()) {
                    Playlist playlist = new Playlist();
                    playlist.setId(resultSet.getInt("id"));
                    playlist.setName(resultSet.getString("title"));
                    playlist.setDate(resultSet.getDate("date"));
                    playlists.add(playlist);
                }

                return playlists;
            }
        }
    }

    /**
     * Given a playlist ID, returns all the information of that playlist
     *
     * @param playlistId ID of the playlist
     * @return Playlist object with all the information
     * @throws SQLException
     */
    public Playlist getPlaylist(int playlistId) throws SQLException {
        String query = "SELECT * " +
                "FROM playlists " +
                "WHERE id = ?";

        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, playlistId);

            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.isBeforeFirst() || !resultSet.next()) {
                    return null;
                }

                Playlist playlist = new Playlist();
                playlist.setId(resultSet.getInt("id"));
                playlist.setUserId(resultSet.getInt("user_id"));
                playlist.setName(resultSet.getString("title"));
                playlist.setDate(resultSet.getDate("date"));

                return playlist;
            }
        }
    }

    /**
     * Creates a new playlist with the given infos and today as date
     *
     * @param userId  id of the user
     * @param title   title of the playlist
     * @param songsId List of songs id to add to playlist_contents. If songsId is null or empty, doesn't update playlist_contents
     * @throws SQLException
     */
    public void insertPlaylist(int userId, String title, List<Integer> songsId) throws SQLException {
        String query = "INSERT INTO playlists (user_id, title) VALUES (?, ?)";

        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, userId);
            statement.setString(2, title);
            statement.executeUpdate();
        }

        if (songsId != null && !songsId.isEmpty()) {
            addSongsToPlaylist(getPlaylistId(userId, title), songsId);
        }
    }

    /**
     * Adds the couple (playlistId, songId) to playlist_contents for every id in the list
     *
     * @param playlistId id of the playlist
     * @param songsId    list of songs id to add to the playlist
     * @throws SQLException
     */
    public void addSongsToPlaylist(int playlistId, List<Integer> songsId) throws SQLException {
        String query = "INSERT INTO playlist_contents (playlist, song) VALUES (?, ?)";

        try (PreparedStatement statement = connection.prepareStatement(query)) {
            for (Integer songId : songsId) {
                statement.setInt(1, playlistId);
                statement.setInt(2, songId);
                statement.executeUpdate();
            }
        }
    }

    /**
     * Returns the id of the playlist given the user id and title
     *
     * @param userId id of the user
     * @param title  title of the playlist
     * @return id of the playlist
     * @throws SQLException
     */
    public int getPlaylistId(int userId, String title) throws SQLException {
        String query = "SELECT id " +
                "FROM playlists " +
                "WHERE user_id = ? AND title = ?";

        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, userId);
            statement.setString(2, title);

            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.isBeforeFirst() || !resultSet.next()) {
                    return -1;
                }
                return resultSet.getInt("id");
            }
        }
    }

    /**
     * @param playlistId id of the playlist
     * @return id of user who created the playlist, -1 if not found
     * @throws SQLException
     */
    public int getUserId(int playlistId) throws SQLException {
        String query = "SELECT user_id FROM playlists WHERE id = ?";

        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, playlistId);

            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.isBeforeFirst() || !resultSet.next()) {
                    return -1;
                }
                return resultSet.getInt("user_id");
            }
        }
    }
}
