import { Component } from 'angular2/core'
import { NodeManager } from './nodeManager.service'
import { CircularJSON } from './circularJSON.pipe'

@Component( {

	selector: 'node-details',
	pipes: [ CircularJSON ],
	template:
	`
	<div class="view left">
		<h4 style="margin-bottom: 0px">Node Info</h4>
		<pre style="background: #f6f6f6; margin: 0px;">{{ ( nodeMan.getSelectedNode() === null ) ? ' ' : ( nodeMan.getSelectedNode() | cjson ) }}</pre>
	</div>
	`

} )
export class NodeDetails {

	constructor( nodeManager: NodeManager ) {
		this.nodeMan = nodeManager
	}

}
