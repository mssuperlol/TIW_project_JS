package it.polimi.tiw_project_js.controllers;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import it.polimi.tiw_project_js.beans.Song;
import it.polimi.tiw_project_js.beans.User;
import it.polimi.tiw_project_js.dao.SongDAO;
import it.polimi.tiw_project_js.utils.DBConnectionHandler;
import it.polimi.tiw_project_js.utils.GetEncoding;
import jakarta.servlet.UnavailableException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.File;
import java.io.IOException;
import java.io.Serial;
import java.sql.Connection;
import java.sql.SQLException;

@WebServlet("/GetSong")
public class GetSong extends HttpServlet {
    @Serial
    private static final long serialVersionUID = 1L;
    private Connection connection = null;

    public GetSong() {
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
        int songId;

        try {
            songId = Integer.parseInt(request.getParameter("songId"));
        } catch (NumberFormatException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Invalid song id");
            return;
        }

        SongDAO songDAO = new SongDAO(connection);
        Song song;

        try {
            song = songDAO.getSong(songId);
        } catch (SQLException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Not possible to recover song");
            return;
        }

        if (user.getId() != song.getUser_id()) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().println("Access to the song denied");
            return;
        }

        JsonObject jObj = new JsonObject();

        jObj.addProperty("id", song.getId());
        jObj.addProperty("title", song.getTitle());
        jObj.addProperty("album_title", song.getAlbum_title());
        jObj.addProperty("performer", song.getPerformer());
        jObj.addProperty("year", song.getYear());
        jObj.addProperty("genre", song.getGenre());
        try {
            jObj.addProperty("imageContent", GetEncoding.getFileEncoding(user.getId() + File.separator + song.getImage_file_name(), getServletContext()));
        } catch (IOException e) {
            jObj.addProperty("imageContent", "");
        }
        try {
            jObj.addProperty("songContent", GetEncoding.getFileEncoding(user.getId() + File.separator + song.getMusic_file_name(), getServletContext()));
        } catch (IOException e) {
            jObj.addProperty("songContent", "");
        }

        String json = new GsonBuilder().create().toJson(jObj);

        System.out.println(json);

        response.setStatus(HttpServletResponse.SC_OK);
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
