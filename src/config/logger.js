import log4js from "log4js";

log4js.configure({
    appenders: {
        out: {
            type: "stdout",
            layout: {
                type: "colored"
            }
        },
        file: {
            type: "file",
            filename: "logs/app.log",
            maxLogSize: 10485768,
            compress: true
        }
    },
    categories: {
        default: {
            appenders: ["out", "file"],
            level: "debug"
        }
    },
});

const logger = log4js.getLogger();

export default logger;