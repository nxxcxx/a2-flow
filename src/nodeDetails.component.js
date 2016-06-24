import { Component } from 'angular2/core'
import { NodeManager } from './nodeManager.service'
import { CircularJSON } from './circularJSON.pipe'
import { NodeEditor } from './nodeEditor.component'

@Component( {

	selector: 'node-details',
	directives: [ NodeEditor ],
	pipes: [ CircularJSON ],
	template:
	`
	<div class="view left">
		<button (click)="run()">RUN</button>
		<node-editor></node-editor>
		<input [(ngModel)]="enabled" type="checkbox"> Debug
		<pre *ngIf="enabled" style="background: #f6f6f6; margin: 0px; overflow-x: scroll">{{ getNodeInfo() }}</pre>
	</div>
	`
	// {{ nodeMan.getSelectedNode() | cjson: 2 }} why this does not update when object's property changed?
} )
export class NodeDetails {

	constructor( nodeManager: NodeManager ) {
		this.nodeMan = nodeManager
		this.cjson = new CircularJSON()
		this.enabled = true
	}

	getNodeInfo() {
		return this.cjson.transform( this.nodeMan.getSelectedNode(), 2 )
	}

	run() {
		this.nodeMan.computeTopologicalOrder()
		this.nodeMan.run()
	}

}
