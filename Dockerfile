# https://hub.docker.com/r/emscripten/emsdk/tags?page=1&ordering=last_updated
FROM emscripten/emsdk:2.0.20

VOLUME ["/src"]
WORKDIR "/src"

CMD emcc --version
