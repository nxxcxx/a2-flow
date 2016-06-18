require( 'sass/index.sass' )

import { bootstrap } from 'angular2/platform/browser'
import { RootComponent } from './root.component'
import { enableProdMode } from 'angular2/core'

// enableProdMode() // https://github.com/angular/angular/issues/6005
bootstrap( RootComponent )
