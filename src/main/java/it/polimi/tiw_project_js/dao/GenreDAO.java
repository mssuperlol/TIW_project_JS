package it.polimi.tiw_project_js.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class GenreDAO {
    private final Connection connection;

    public GenreDAO(Connection connection) {
        this.connection = connection;
    }

    /**
     * Gets all the genres
     *
     * @return a List of the genres as strings
     * @throws SQLException
     */
    public List<String> getGenres() throws SQLException {
        String query = "SELECT name FROM genres";

        try (PreparedStatement statement = connection.prepareStatement(query)) {
            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.isBeforeFirst()) {
                    return null;
                }

                List<String> genres = new ArrayList<>();
                while (resultSet.next()) {
                    genres.add(resultSet.getString("name"));
                }

                return genres;
            }
        }
    }
}
