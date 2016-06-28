import { Component, ElementRef } from 'angular2/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import { NodeModule } from 'src/NodeGraph/NodeModule/NodeModule.cmp'
import { NodeConnection } from 'src/NodeGraph/NodeConnection/NodeConnection.cmp'
import { NodeTempConnection } from 'src/NodeGraph/NodeConnection/NodeTempConnection.cmp'

@Component( {

	selector: '[nodeGraph]',
	directives: [ NodeModule, NodeConnection, NodeTempConnection ],
	template:
	`
		<svg id="nodeContainerSvg" style="pointer-events: none">
			<g style="pointer-events: auto">
				<g nodeConnection *ngFor="let conn of ngs.getConnections()" [connection]="conn" />
				<g nodeTempConnection />
			</g>
		</svg>
		<div id="nodeContainer" style="pointer-events: none">
			<div style="pointer-events: auto">
				<nodeModule *ngFor="let node of ngs.getNodes()" [node]="node"></nodeModule>
			</div>
		</div>
	`

} )
export class NodeGraph {

	constructor( elRef: ElementRef, ngs: NodeGraphService ) {
		this.ngs = ngs
		this.el = elRef.nativeElement
	}

	ngOnInit() {
		this.ngs.registerContainerElem( this.el )
	}

}
