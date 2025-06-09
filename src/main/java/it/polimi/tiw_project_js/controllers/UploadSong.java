package it.polimi.tiw_project_js.controllers;

import it.polimi.tiw_project_js.beans.User;
import it.polimi.tiw_project_js.dao.SongDAO;
import it.polimi.tiw_project_js.utils.DBConnectionHandler;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.Serial;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.Connection;
import java.sql.SQLException;

@MultipartConfig
@WebServlet("/UploadSong")
public class UploadSong extends HttpServlet {
    @Serial
    private static final long serialVersionUID = 1L;
    private Connection connection = null;
    String folderPath;

    @Override
    public void init() throws ServletException {
        connection = DBConnectionHandler.getConnection(this.getServletContext());
        folderPath = getServletContext().getInitParameter("musicPath");
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doPost(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("user");

        Part imageFilePart = request.getPart("image_file");
        if (imageFilePart == null || imageFilePart.getSize() == 0) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Missing image file");
            return;
        }
        if (!imageFilePart.getContentType().startsWith("image")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Image file format not permitted");
            return;
        }

        Part musicFilePart = request.getPart("music_file");
        if (musicFilePart == null || musicFilePart.getSize() == 0) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Missing music file");
            return;
        }
        if (!musicFilePart.getContentType().startsWith("audio")) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Music file format not permitted");
            return;
        }

        SongDAO songDAO = new SongDAO(connection);
        int userID = user.getId();
        String title = request.getParameter("title");
        String imageFileName = Paths.get(imageFilePart.getSubmittedFileName()).getFileName().toString();
        String albumTitle = request.getParameter("album_title");
        String performer = request.getParameter("performer");
        int year;
        String genre = request.getParameter("genre");
        String musicFileName = Paths.get(musicFilePart.getSubmittedFileName()).getFileName().toString();

        try {
            year = Integer.parseInt(request.getParameter("year"));
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Invalid year");
            return;
        }

        if (year <= 0) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Invalid year");
            return;
        }

        if (title != null && albumTitle != null && performer != null && genre != null) {
            //saves the files to /home/mssuperlol/Documents/TIW_project_resources/ID/
            String outputPath = folderPath + user.getId() + File.separator + imageFileName;
            File outputFile = new File(outputPath);
            try (InputStream fileContent = imageFilePart.getInputStream()) {
                Files.copy(fileContent, outputFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
            }

            outputPath = folderPath + user.getId() + File.separator + musicFileName;
            outputFile = new File(outputPath);
            try (InputStream fileContent = musicFilePart.getInputStream()) {
                Files.copy(fileContent, outputFile.toPath());
            } catch (FileAlreadyExistsException e) {
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                response.getWriter().println("File already exists");
                return;
            }

            //update the db
            try {
                songDAO.insertSong(userID, title, imageFileName, albumTitle, performer, year, genre, musicFileName);
            } catch (SQLException e) {
                throw new RuntimeException(e);
            }
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Missing parameters");
            return;
        }

        response.setContentType("application/json");
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
