import { Component } from 'angular2/core'
import { NodeManager } from './nodeManager.service'
import { CircularJSON } from './circularJSON.pipe'

@Component( {

	selector: 'node-details',
	pipes: [ CircularJSON ],
	template:
	`
	<div class="view left">
		<input [(ngModel)]="enabled" type="checkbox" style="display: inline-block">
		<h4 style="margin: 0px; display: inline-block;" >Debug</h4>
		<pre *ngIf="enabled" style="background: #f6f6f6; margin: 0px;">{{ getNodeInfo() }}</pre>
	</div>
	`
	// {{ nodeMan.getSelectedNode() | cjson: 2 }} why this does not update when object's property changed?
} )
export class NodeDetails {

	constructor( nodeManager: NodeManager ) {
		this.nodeMan = nodeManager
		this.cjson = new CircularJSON()
		this.enabled = false
	}

	getNodeInfo() {
		// TODO cache response, 1 sec interval
		return this.cjson.transform( this.nodeMan.getSelectedNode(), 2 )
	}

}
