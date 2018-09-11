# https://hub.docker.com/r/apiaryio/emcc/tags/
FROM apiaryio/emcc:1.38.11

VOLUME ["/src"]
WORKDIR "/src"

CMD emcc --version
