FROM python:3.8-buster
RUN apt update && apt install curl gpac -y --fix-missing

ENV LD_LIBRARY_PATH=/opt/vc/lib
WORKDIR /usr/src/app

COPY . .

CMD ["python3", "broadcast.py"]
