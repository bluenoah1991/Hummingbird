"use strict";

module.exports = {
    HOSTNAME: 'bot.instflow.org',
    PORT: process.env.port || process.env.PORT || 3978,
    STATIC_IMAGES_DIR: './static/images',
    LOOP_TASK_BOOT_EXEC: false,
    MONGOCONNECT: process.env.MONGOCONNECT || 'mongodb://localhost:27017/instflow'
}