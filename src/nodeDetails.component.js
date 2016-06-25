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
		<div>
			<button (click)="createTestNodes()">TEST</button>
			<button (click)="run()">RUN</button>
		</div>
		<div style="clear: left"></div>
		<node-editor></node-editor>
		<input [(ngModel)]="debugEnabled" type="checkbox"> Debug
		<pre *ngIf="debugEnabled">{{ getNodeInfo() }}</pre>
	</div>
	`

} )
export class NodeDetails {

	constructor( nodeManager: NodeManager ) {
		this.nodeMan = nodeManager
		this.cjson = new CircularJSON()
		this.debugEnabled = false
	}

	getNodeInfo() {
		return this.cjson.transform( this.nodeMan.getSelectedNode(), 2 )
	}

	run() {
		this.nodeMan.computeTopologicalOrder()
		this.nodeMan.run()
	}

	createTestNodes() {
		this.nodeMan.createTestNode()
	}

}
