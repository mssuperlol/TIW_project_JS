package it.polimi.tiw_project_js.controllers;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import it.polimi.tiw_project_js.beans.Song;
import it.polimi.tiw_project_js.beans.User;
import it.polimi.tiw_project_js.dao.PlaylistDAO;
import it.polimi.tiw_project_js.dao.SongDAO;
import it.polimi.tiw_project_js.utils.DBConnectionHandler;
import jakarta.servlet.UnavailableException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.Serial;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

@WebServlet("/GetSongsNotInPlaylist")
public class GetSongsNotInPlaylist extends HttpServlet {
    @Serial
    private static final long serialVersionUID = 1L;
    private Connection connection = null;

    public GetSongsNotInPlaylist() {
        super();
    }

    @Override
    public void init() throws UnavailableException {
        connection = DBConnectionHandler.getConnection(this.getServletContext());
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession();
        response.setContentType("application/json");
        User user = (User) session.getAttribute("user");
        PlaylistDAO playlistDAO = new PlaylistDAO(connection);
        int playlistId;

        try {
            playlistId = Integer.parseInt(request.getParameter("playlistId"));
        } catch (NumberFormatException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Invalid playlist id");
            return;
        }

        SongDAO songDAO = new SongDAO(connection);
        List<Song> songs;

        try {
            if (user.getId() != playlistDAO.getUserId(playlistId)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().println("You do not have permission to access this playlist");
                return;
            }

            songs = songDAO.getSongsNotInPlaylist(user.getId(), playlistId);
        } catch (SQLException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Not possible to recover playlist's song");
            return;
        }

        JsonArray jArray = new JsonArray();
        JsonObject jSonObject;
        String json = "";

        if (songs != null && !songs.isEmpty()) {
            for (Song song : songs) {
                jSonObject = new JsonObject();

                jSonObject.addProperty("id", song.getId());
                jSonObject.addProperty("title", song.getTitle());

                jArray.add(jSonObject);
            }

            json = new GsonBuilder().create().toJson(jArray);
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
        }

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().println(json);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        doGet(request, response);
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
