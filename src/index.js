// stylesheets
import 'sass/index.sass'

import THREE from 'three'
window.THREE = THREE

import 'core-js/client/shim.min.js'
import 'zone.js'
import 'reflect-metadata'
import { bootstrap } from '@angular/platform-browser-dynamic'
import { RootComponent } from 'src/root.cmp'
// import { enableProdMode } from '@angular/core'
// enableProdMode() // https://github.com/angular/angular/issues/6005

bootstrap( RootComponent )
