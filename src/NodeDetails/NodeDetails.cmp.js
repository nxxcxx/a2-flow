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
			<button (click)="ngs.createTestNode()">ADD</button>
			<button (click)="parseSelectedNode()">PAR-S</button>
		</div>
		<div style="clear: left"></div>
		<span>{{ ngs.getSelectedNode()?.name || 'NULL' }}</span> <span>{{ ngs.getSelectedNode()?.uuid | uppercase }}</span>
		<nodeEditor></nodeEditor>
	`

} )
export class NodeDetails {

	constructor( _reg: NodeRegistryService ) {
		this.ngs = _reg.request( 'NodeGraph' )
		this.nen = _reg.request( 'NodeEngine' )
		this.nie = _reg.request( 'NodeIE' )
		this.debugEnabled = false
	}

	importGraph() {
		this.nie.importGraphConfiguration()
	}

	parse() {
		this.loopStop()
		this.nen.parse()
		console.log( 'PAR' )
	}

	parseSelectedNode() {
		this.ngs.getSelectedNode().parse()
	}

	loopStart() {
		this.nen.loopStart()
		console.log( 'EXE' )
	}

	loopStop() {
		this.nen.loopStop()
		console.log( 'HLT' )
	}

	step() {
		this.nen.step()
		console.log( 'STP' )
	}

	flush() {
		this.loopStop()
		this.nen.flushNodesData()
		console.log( 'CLR' )
	}

}
