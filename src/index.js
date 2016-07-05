// stylesheets
import 'sass/index.sass'

// THREE.js
import THREE from 'three'
window.THREE = THREE

// import { enableProdMode } from 'angular2/core'
// enableProdMode() // https://github.com/angular/angular/issues/6005

import { bootstrap } from 'angular2/platform/browser'
import { RootComponent } from 'src/root.cmp'

bootstrap( RootComponent )
