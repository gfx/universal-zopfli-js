FROM apiaryio/emcc:1.38

VOLUME ["/src"]
WORKDIR "/src"

CMD emcc --version
