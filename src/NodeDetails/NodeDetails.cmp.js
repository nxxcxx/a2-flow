import { Component } from 'angular2/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import { NodeEditor } from 'src/NodeDetails/NodeEditor.cmp'

@Component( {

	selector: '[nodeDetails]',
	directives: [ NodeEditor ],
	template:
	`
		<div>
			<button (click)="flush()">CLR</button>
			<button (click)="parse()">PAR</button>
			<button (click)="loopStart()">EXE</button>
			<button (click)="loopStop()">HLT</button>
			<button (click)="step()">STP</button>
			<button (click)="testMem()">MEM</button>
		</div>
		<div style="clear: left"></div>
		<span>{{ ngs.getSelectedNode()?.name }}</span> <span>{{ ngs.getSelectedNode()?.uuid | uppercase }}</span>
		<nodeEditor></nodeEditor>
	`

} )
export class NodeDetails {

	constructor( ngs: NodeGraphService ) {
		this.ngs = ngs
		this.debugEnabled = false
	}

	toggleDebug() {
		this.debugEnabled = !this.debugEnabled
	}

	getNodeInfo() {
		return this.cjson.transform( this.ngs.getSelectedNode(), 2 )
	}

	parse() {
		this.ngs.parse()
		console.log( 'PAR' )
	}

	loopStart() {
		this.ngs.loopStart()
		console.log( 'EXE' )
	}

	loopStop() {
		this.ngs.loopStop()
		console.log( 'HLT' )
	}

	step() {
		this.ngs.step()
		console.log( 'STP' )
	}

	flush() {
		this.ngs.flushNodesData()
		console.log( 'CLR' )
	}

	testMem() {
		setInterval( () => {
			this.parse()
			this.loopStart()
			this.loopStop()
			this.flush()
		}, 250 )
	}

}
