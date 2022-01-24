# For more information, please refer to https://aka.ms/vscode-docker-python
# Added platform argument because tensorflow doesn't support linux/arm64 till now 22-01-2022
FROM python:3.8-slim

EXPOSE 5000

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Configuring Virtual Environment
# The following two commands for Linux Docker containers that don't have venv installed
# RUN apt-get update
# RUN apt install python3.8-venv -y
ENV VIRTUAL_ENV=/opt/venv
RUN python -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# These commands install the cv2 dependencies that are normally present on the local machine
# RUN apt-get update
# RUN apt-get install ffmpeg libsm6 libxext6  -y

# Install pip requirements
COPY requirements.txt .
RUN python -m pip install -r requirements.txt
# The following command for forcing the reinstallation of tensorflow to work without AVX instruction set so that arm64 emulation can work correctly
# RUN python -m pip install --force-reinstall https://tf.novaal.de/barcelona/tensorflow-2.7.0-cp38-cp38-linux_x86_64.whl

WORKDIR /app
COPY . /app

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-python-configure-containers
# Commented the following two lines to run as a root user
# RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app
# USER appuser

# During debugging, this entry point will be overridden. For more information, please refer to https://aka.ms/vscode-docker-python-debug
# Added timeout 600 because the inference is taking too long and the workers fail before returning a result
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--timeout", "600", "app:app"]
