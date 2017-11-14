FROM apiaryio/emcc:1.37

VOLUME ["/src"]
WORKDIR "/src"

CMD emcc --version
