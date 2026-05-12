# Ollama Quick Start

Ollama lets you run AI models on your own machine instead of sending requests to a cloud service. For this project, it is used to power local voice and chat features.

## Before You Start

You need:

- Docker installed and running
- A terminal or PowerShell window

## Start Ollama

Run Ollama in Docker:

```bash
docker run --rm -d --net host --name ollama ollama/ollama
```

This starts the Ollama service in the background.

## Download the Model

After Ollama is running, download the model the app expects:

```bash
docker exec -it ollama ollama pull llama3
```

The first download may take a few minutes depending on your internet speed.

## Use It in This Project

Once the model is ready, start the app as usual. The app will send requests to the local Ollama service when it needs AI responses.

## Stop Ollama

When you are done, stop the container:

```bash
docker stop ollama
```

## Common Issues

- If the pull command fails, make sure the Ollama container is still running.
- If Docker says the port or host is already in use, stop any older Ollama container and try again.
- If the app cannot find the model, run the pull command again.
