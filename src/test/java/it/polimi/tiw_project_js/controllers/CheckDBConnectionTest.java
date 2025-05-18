package it.polimi.tiw_project_js.controllers;

import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.DriverManager;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.fail;

class CheckDBConnectionTest {
    @Test
    void testCheckDBConnection() {
        final String DATABASE = "tiw_project";
        final String USER = "mssuperlol";
        final String PASSWORD = "bruh";
        Connection connection = null;

        try {
            Class.forName("org.mariadb.jdbc.Driver");
            System.out.println("Driver loaded");
        } catch (ClassNotFoundException e) {
            System.err.println("Driver not found");
            e.printStackTrace();
            fail();
        }
        try {
            connection = DriverManager.getConnection
                    ("jdbc:mariadb://localhost:3306/" + DATABASE, USER, PASSWORD);
            System.out.println("Database connection successful");
            connection.close();
        } catch (Exception e) {
            System.err.println("Connection failed");
            e.printStackTrace();
            fail();
        }

        assertNotNull(connection);
    }
}