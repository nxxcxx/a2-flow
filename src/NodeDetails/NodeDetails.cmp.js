import { Component } from '@angular/core'
import { NodeRegistryService } from 'src/NodeGraph/NodeRegistry.svc'
import { NodeEditor } from 'src/NodeDetails/NodeEditor.cmp'
const html = String.raw

@Component( {

	selector: '[nodeDetails]',
	directives: [ NodeEditor ],
	template:
	html`
		<div>
			<button (click)="flush()">CLR</button>
			<button (click)="parse()">PAR</button>
			<button (click)="loopStart()">EXE</button>
			<button (click)="step()">STP</button>
			<button (click)="loopStop()">HLT</button>
			<button (click)="importGraph()">IMP</button>
			<button (click)="_nodeGraph.createTestNode()">ADD</button>
			<button (click)="parseSelectedNode()">PAR-S</button>
		</div>
		<div style="clear: left"></div>
		<span>{{ _nodeGraph.getSelectedNode()?.name || 'NULL' }}</span> <span>{{ _nodeGraph.getSelectedNode()?.uuid | uppercase }}</span>
		<nodeEditor></nodeEditor>
	`

} )
export class NodeDetails {

	constructor( _reg: NodeRegistryService ) {
		this._nodeGraph = _reg.request( 'NodeGraph' )
		this._nodeEngine = _reg.request( 'NodeEngine' )
		this._nodeIM = _reg.request( 'NodeIM' )
		this.debugEnabled = false
	}

	importGraph() {
		this._nodeIM.importGraphConfiguration()
	}

	parse() {
		this.loopStop()
		this._nodeEngine.parse()
		console.log( 'PAR' )
	}

	parseSelectedNode() {
		this._nodeGraph.getSelectedNode().parse()
	}

	loopStart() {
		this._nodeEngine.loopStart()
		console.log( 'EXE' )
	}

	loopStop() {
		this._nodeEngine.loopStop()
		console.log( 'HLT' )
	}

	step() {
		this._nodeEngine.step()
		console.log( 'STP' )
	}

	flush() {
		this.loopStop()
		this._nodeEngine.flushNodesData()
		console.log( 'CLR' )
	}

}
