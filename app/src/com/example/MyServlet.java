package com.example;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

// HttpServlet 클래스를 상속받아 서블릿을 만듭니다.
public class MyServlet extends HttpServlet {

    // GET 요청을 처리하는 doGet 메소드
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // 1. 응답 콘텐츠 타입과 인코딩 설정
        response.setContentType("text/html;charset=UTF-8");

        // 2. HTML 출력을 위한 PrintWriter 객체 얻기
        PrintWriter out = response.getWriter();

        // 3. HTML 페이지 내용 작성
        out.println("<!DOCTYPE html>");
        out.println("<html>");
        out.println("<head>");
        out.println("<title>Hello Servlet</title>");
        out.println("</head>");
        out.println("<body>");
        out.println("<h1>Hello, Servlet!</h1>");
        out.println("<p>이 페이지는 서블릿이 동적으로 생성했습니다.</p>");
        out.println("</body>");
        out.println("</html>");
    }
}
