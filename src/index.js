import 'sass/index.sass'

import 'core-js/client/shim.min.js'
import 'root/node_modules/zone.js/dist/zone.min.js'
import 'reflect-metadata'
import { enableProdMode } from '@angular/core'
import { bootstrap } from '@angular/platform-browser-dynamic'
import { RootComponent } from 'src/root.cmp'

if ( process.env === 'production' ) {
	enableProdMode()
}

bootstrap( RootComponent )
