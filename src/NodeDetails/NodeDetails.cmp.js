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
			<button (click)="exportGraph()">EXP</button>
			<button (click)="ngs.createTestNode()">ADD</button>
		</div>
		<div style="clear: left"></div>
		<div *ngFor="let node of ngs.getSelectedNodes()" (click)="logDebugInfo( node )">
				<span>{{ node.name }}</span> <span>{{ node.uuid | uppercase }}</span>
		</div>
		<span *ngIf="!ngs.getSelectedNodes()">NULL</span>
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

	logDebugInfo( info ) {
		console.log( info )
	}

	importGraph() {
		this.nie.importGraphConfiguration()
	}

	exportGraph() {
		this.nie.exportGraphConfiguration()
	}

	parse() {
		console.log( 'PAR' )
		this.loopStop()
		this.nen.parse()
	}

	loopStart() {
		console.log( 'EXE' )
		this.nen.loopStart()
	}

	loopStop() {
		console.log( 'HLT' )
		this.nen.loopStop()
	}

	step() {
		console.log( 'STP' )
		this.nen.step()
	}

	flush() {
		console.log( 'CLR' )
		this.loopStop()
		this.nen.flushNodesData()
	}

}
