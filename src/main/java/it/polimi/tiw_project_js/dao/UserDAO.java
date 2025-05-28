package it.polimi.tiw_project_js.dao;

import it.polimi.tiw_project_js.beans.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class UserDAO {
    private final Connection connection;

    public UserDAO(Connection connection) {
        this.connection = connection;
    }

    /**
     * Checks whether a user with the given username and password is present in the database
     *
     * @param username to check
     * @param password to check
     * @return user information if found, null otherwise
     * @throws SQLException
     */
    public User checkLogin(String username, String password) throws SQLException {
        String query = """
                SELECT id, username, name, surname
                FROM users
                WHERE username = ? AND password = ?
                """;

        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, username);
            statement.setString(2, password);

            try (ResultSet resultSet = statement.executeQuery()) {
                if (!resultSet.isBeforeFirst()) {
                    return null;
                }
                resultSet.next();
                User user = new User();
                user.setId(resultSet.getInt("id"));
                user.setUsername(resultSet.getString("username"));
                user.setName(resultSet.getString("name"));
                user.setSurname(resultSet.getString("surname"));
                return user;
            }
        }
    }
}
