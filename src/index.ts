const z = require("./libzopfli");

export function add(x: number, y: number, cb: (r: number) => void) {
    z.onRuntimeInitialized = () => {
        cb(z._add(x, y));
    };
}
