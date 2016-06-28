import { Component } from 'angular2/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import { CircularJSON } from 'src/pipes/circularJSON.pipe'
import { NodeEditor } from 'src/NodeDetails/NodeEditor.cmp'

@Component( {

	selector: 'nodeDetails',
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
		<nodeEditor></nodeEditor>
		<br>
		<input [(ngModel)]="debugEnabled" type="checkbox"> DEBUG
		<pre *ngIf="debugEnabled">{{ getNodeInfo() }}</pre>
	</div>
	`

} )
export class NodeDetails {

	constructor( ngs: NodeGraphService ) {
		this.ngs = ngs
		this.cjson = new CircularJSON()
		this.debugEnabled = false
	}

	getNodeInfo() {
		return this.cjson.transform( this.ngs.getSelectedNode(), 2 )
	}

	run() {
		this.ngs.run()
	}

	createTestNodes() {
		this.ngs.createTestNode2()
	}

}
