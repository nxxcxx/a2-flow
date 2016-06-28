import { Pipe } from 'angular2/core'
import CJSON from 'circular-json'

@Pipe( {
	name: 'cjson'
} )
export class CircularJSON {
	transform( value, space ) {
		return CJSON.stringify( value, undefined, parseInt( space ) )
	}
}
