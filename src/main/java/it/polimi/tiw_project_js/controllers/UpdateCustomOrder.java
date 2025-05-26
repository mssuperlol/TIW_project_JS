package it.polimi.tiw_project_js.controllers;

import it.polimi.tiw_project_js.beans.User;
import it.polimi.tiw_project_js.dao.PlaylistDAO;
import it.polimi.tiw_project_js.utils.DBConnectionHandler;
import jakarta.servlet.ServletException;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@WebServlet("/UpdateCustomOrder")
public class UpdateCustomOrder extends HttpServlet {
    @Serial
    private static final long serialVersionUID = 1L;
    private Connection connection = null;

    public UpdateCustomOrder() {
        super();
    }

    @Override
    public void init() throws UnavailableException {
        connection = DBConnectionHandler.getConnection(this.getServletContext());
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("user");
        response.setContentType("application/json");

        PlaylistDAO playlistDAO = new PlaylistDAO(connection);
        List<Integer> songOrder = new ArrayList<>();
        int playlistId;

        request.getParameterMap().forEach((k, v) -> {
            System.out.println("key: " + k + " | value: " + Arrays.toString(v));
        });


        try {
            playlistId = Integer.parseInt(request.getParameter("playlistId"));
        } catch (NumberFormatException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Invalid playlist id");
            return;
        }

        for (int i = 0; request.getParameter(Integer.toString(i)) != null; i++) {
            songOrder.add(Integer.parseInt(request.getParameter(Integer.toString(i))));
        }

        try {
            playlistDAO.updateCustomOrder(playlistId, songOrder);
        } catch (SQLException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Couldn't update custom order");
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
