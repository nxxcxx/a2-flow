import { Component } from 'angular2/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import { CircularJSON } from 'src/pipes/circularJSON.pipe'
import { NodeEditor } from 'src/NodeDetails/NodeEditor.cmp'

@Component( {

	selector: '[nodeDetails]',
	directives: [ NodeEditor ],
	pipes: [ CircularJSON ],
	template:
	`
		<div>
			<!-- <button (click)="createTestNodes()">TEST</button> -->
			<button (click)="parse()">PAR</button>
			<button (click)="run()">EXE</button>
		</div>
		<div style="clear: left"></div>
		<span>{{ ngs.getSelectedNode()?.name }}</span> <span>{{ ngs.getSelectedNode()?.uuid | uppercase }}</span>
		<nodeEditor></nodeEditor>
		<br>
		<div style="margin-left: 5px; width: 8px; height: 8px; border: 1px solid #fff; display: inline-block" [ngStyle]="{'background': debugEnabled ? '#fff':'rgba(0,0,0,0)'}" (click)="toggleDebug()"></div> DEBUG
		<pre *ngIf="debugEnabled">{{ getNodeInfo() }}</pre>
	`

} )
export class NodeDetails {

	constructor( ngs: NodeGraphService ) {
		this.ngs = ngs
		this.cjson = new CircularJSON()
		this.debugEnabled = false
	}

	toggleDebug() {
		this.debugEnabled = !this.debugEnabled
	}

	getNodeInfo() {
		return this.cjson.transform( this.ngs.getSelectedNode(), 2 )
	}

	createTestNodes() {
		this.ngs.createTestNode2()
	}

	parse() {
		this.ngs.parse()
	}

	run() {
		this.ngs.run2()
	}

}
