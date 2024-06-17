FROM python:3
ENV PYTHONUNBUFFERED 1
RUN mkdir /code
WORKDIR /code
COPY requirements.txt /code/
# 필요한 패키지 설치
RUN apt-get update \
    && apt-get install -y python3-dev default-libmysqlclient-dev build-essential \
    && apt-get clean
    
RUN pip install -r requirements.txt
COPY . /code/

RUN python3 manage.py migrate

CMD python3 manage.py runserver 0.0.0.0:8000

# sudo docker build -t beomzh/pmc .
# sudo docker push beomzh/pmc
# 각 node별로 docker iamge pull 해줘야하는데 처리 방법 고민..
# ds 을 띄워 각 노드별 image pull 문제 해결
