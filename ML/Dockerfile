FROM python:3.11-slim

WORKDIR /app

# Install uv for fast dependency resolution and installation
RUN pip install uv

# Copy project definition files
COPY pyproject.toml uv.lock ./

# Install dependencies using uv without creating a virtual environment,
# placing packages directly in system python.
RUN uv pip install --system .

# Copy remaining source code and models
COPY src ./src
COPY app ./app
COPY data ./data
COPY reports ./reports

# The service must listen on the port provided by the environment variable
# If PORT is not set, default to 8000
CMD uvicorn app.api:app --host 0.0.0.0 --port ${PORT:-8000}
