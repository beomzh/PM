FROM tomcat:9.0.109-jdk17

ADD app/build/MyWebApp.war /usr/local/tomcat/webapps/

EXPOSE 8080

CMD ["catalina.sh", "run"] 
