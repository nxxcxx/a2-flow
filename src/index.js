// stylesheets
import 'sass/index.sass'

// moved to index.html
// import THREE from 'root/node_modules/three/build/three.min.js'
// global.THREE = THREE
// import 'root/node_modules/three/examples/js/postprocessing/EffectComposer.js'
// import 'root/node_modules/three/examples/js/postprocessing/RenderPass.js'
// import 'root/node_modules/three/examples/js/postprocessing/ShaderPass.js'

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
