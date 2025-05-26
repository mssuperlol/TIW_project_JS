package it.polimi.tiw_project_js.filters;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

@WebFilter(urlPatterns = {"/homepage.html"})
public class LoginChecker implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) servletRequest;
        HttpServletResponse res = (HttpServletResponse) servletResponse;
        HttpSession session = req.getSession();
        String loginPath = req.getServletContext().getContextPath() + "/login.html";

        if (session.isNew() || session.getAttribute("user") == null) {
            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
            res.setHeader("Location", loginPath);
            return;
        }

        filterChain.doFilter(servletRequest, servletResponse);
    }
}
