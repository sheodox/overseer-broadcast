FROM ubuntu:latest
RUN apt update && apt install curl python3-pip gpac -y
ENV LD_LIBRARY_PATH=/opt/vc/lib

WORKDIR /usr/src/app
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

CMD python3 broadcast.py
