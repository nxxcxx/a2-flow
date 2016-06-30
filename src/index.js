// stylesheets
import 'sass/index.sass'

// TODO: load style as string to use as component's css style
// elample:
// let style = require( '!raw!sass!root/sass/index.sass')
// console.log( style )

// import { enableProdMode } from 'angular2/core'
// enableProdMode() // https://github.com/angular/angular/issues/6005

import { bootstrap } from 'angular2/platform/browser'
import { RootComponent } from 'src/root.cmp'

bootstrap( RootComponent )
