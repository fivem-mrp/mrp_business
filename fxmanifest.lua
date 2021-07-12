fx_version 'cerulean'
game 'gta5'

author 'mufty'
description 'MRP Business'
version '0.0.1'

dependencies {
    "mrp_core"
}

ui_page 'ui/index.html'

files {
    'config/config.json',
    'ui/styles/*.css',
    'ui/*.html',
    'ui/app/*.js',
    'ui/img/*.jpg',
    'ui/img/*.png',
    'ui/fonts/*.ttf',
}

client_scripts {
    '@mrp_core/shared/debug.js',
    'client/*.js',
}

server_scripts {
    '@mrp_core/shared/debug.js',
    'server/*.js',
}
