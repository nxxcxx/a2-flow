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
			<button (click)="ngs.createTestNode()">ADD</button>
		</div>
		<div style="clear: left"></div>
		<span>{{ ngs.getSelectedNode()?.name || 'NULL' }}</span> <span>{{ ngs.getSelectedNode()?.uuid | uppercase }}</span>
		<nodeEditor></nodeEditor>
	`

} )
export class NodeDetails {

	constructor( ngs: NodeGraphService ) {
		this.ngs = ngs
		this.debugEnabled = false
		window.test = () => {
			this.parse()
			this.loopStart()
			this.loopStop()
			this.flush()
		}
	}

	parse() {
		this.loopStop()
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
		this.loopStop()
		this.ngs.flushNodesData()
		console.log( 'CLR' )
	}

	importGraph() {
		this.ngs.importGraphConfiguration()
	}

}
