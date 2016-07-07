import { Component } from '@angular/core'
import { NodeDetails } from 'src/NodeDetails/NodeDetails.cmp'
import { NodeGraph } from 'src/NodeGraph/NodeGraph.cmp'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import { NodeRendererService } from 'src/NodeGraph/NodeRenderer.svc'
import { NodeCanvas } from 'src/NodeGraph/NodeCanvas.cmp'

@Component( {

	selector: '[rootComponent]',
	directives: [ NodeDetails, NodeGraph, NodeCanvas ],
	providers: [ NodeGraphService, NodeRendererService ],
	template:
	`
	<nodeCanvas></nodeCanvas>
	<div nodeDetails class="view left"></div>
	<div nodeGraph class="view right"></div>
	`

} )
export class RootComponent {

	constructor( ngs: NodeGraphService ) {
		this.ngs = ngs
	}

	ngAfterViewInit() {
		setTimeout( () => { this.ngs.importGraphConfiguration() }, 0 )
	}

}
