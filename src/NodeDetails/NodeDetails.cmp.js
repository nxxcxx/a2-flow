import { Component } from '@angular/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import { NodeEditor } from 'src/NodeDetails/NodeEditor.cmp'
import { NodeTerminal } from 'src/NodeDetails/NodeTerminal.cmp'

@Component( {

	selector: '[nodeDetails]',
	directives: [ NodeEditor, NodeTerminal ],
	template:
	`
		<div>
			<button (click)="flush()">CLR</button>
			<button (click)="parse()">PAR</button>
			<button (click)="loopStart()">EXE</button>
			<button (click)="loopStop()">HLT</button>
			<button (click)="step()">STP</button>
			<button (click)="importGraph()">IMP</button>
		</div>
		<div style="clear: left"></div>
		<span>{{ ngs.getSelectedNode()?.name || 'NULL' }}</span> <span>{{ ngs.getSelectedNode()?.uuid | uppercase }}</span>
		<nodeEditor></nodeEditor>
		<nodeTerminal></nodeTerminal>
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

	importGraph() {
		this.ngs.importGraphConfiguration()
	}

}
