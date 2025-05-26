package it.polimi.tiw_project_js.controllers;

import it.polimi.tiw_project_js.beans.User;
import it.polimi.tiw_project_js.dao.PlaylistDAO;
import it.polimi.tiw_project_js.dao.SongDAO;
import it.polimi.tiw_project_js.utils.DBConnectionHandler;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.Serial;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/CreatePlaylist")
public class CreatePlaylist extends HttpServlet {
    @Serial
    private static final long serialVersionUID = 1L;
    private Connection connection;

    @Override
    public void init() throws ServletException {
        connection = DBConnectionHandler.getConnection(this.getServletContext());
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("user");
        response.setContentType("application/json");

        PlaylistDAO playlistDAO = new PlaylistDAO(connection);
        SongDAO songDAO = new SongDAO(connection);
        int userId = user.getId();
        String title = request.getParameter("title");
        List<Integer> songs = new ArrayList<>(), userSongsId;

        if (title == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Missing playlist title");
            return;
        }

        try {
            userSongsId = songDAO.getSongsIdFromUserId(userId);
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Database error: couldn't retrieve user songs");
            return;
        }

        for (Integer songId : userSongsId) {
            String currSongId = request.getParameter("songId" + songId.toString());
            if (currSongId != null) {
                songs.add(songId);
            }
        }

        try {
            playlistDAO.insertPlaylist(userId, title, songs);
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Database error: couldn't create playlist");
            return;
        }

        response.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    public void destroy() {
        try {
            if (connection != null) {
                connection.close();
            }
        } catch (SQLException ignored) {
        }
    }
}
