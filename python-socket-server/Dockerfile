FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV CONSOLE_CHARSET="UTF-8"

# Install extra dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    kbd \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Optional: install requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt || true


CMD ["sleep", "infinity"]
