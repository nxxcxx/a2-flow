import { Component, ElementRef } from 'angular2/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import { NodeModule } from 'src/NodeGraph/NodeModule/NodeModule.cmp'
import { NodeConnection } from 'src/NodeGraph/NodeConnection/NodeConnection.cmp'

@Component( {

	selector: '[nodeGraph]',
	directives: [ NodeModule, NodeConnection ],
	template:
	`
		<svg id="nodeContainerSvg">
			<g nodeConnection *ngFor="let conn of ngs.getConnections()" [connection]="conn" />
		</svg>
		<div id="nodeContainer">
			<nodeModule *ngFor="let node of ngs.getNodes()" [node]="node"></nodeModule>
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
