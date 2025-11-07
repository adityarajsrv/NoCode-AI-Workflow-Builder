# Use PyTorch base image with Python 3.11 + CUDA 12.1
FROM pytorch/pytorch:2.5.1-cuda12.1-cudnn9-runtime

# Set working directory
WORKDIR /app

# Copy only requirements first (to leverage layer caching)
COPY requirements.txt .

# Install dependencies (using PyTorch’s index for torch/torchvision)
RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cu121

# Copy your FastAPI app
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Start server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
