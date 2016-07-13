import { Component } from '@angular/core'
import { NodeRegistryService } from 'src/NodeGraph/NodeRegistry.svc'
let html = String.raw

@Component( {

	selector: '[nodeModuleGropu]',
	template:
	html`
		<div></div>
	`

} )
export class NodeModuleGroup {

	constructor( _reg: NodeRegistryService ) {
		this._reg = _reg
	}

}
