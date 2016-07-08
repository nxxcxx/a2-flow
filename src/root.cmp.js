import { Component } from '@angular/core'
import { NodeDetails } from 'src/NodeDetails/NodeDetails.cmp'
import { NodeGraph } from 'src/NodeGraph/NodeGraph.cmp'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import { NodeCanvas } from 'src/NodeGraph/NodeCanvas.cmp'

@Component( {

	selector: '[rootComponent]',
	directives: [ NodeDetails, NodeGraph, NodeCanvas ],
	providers: [ NodeGraphService ],
	template:
	`
	<div>

		<div nodeDetails class="view left"></div>

		<!-- nodeCanvas suppose to be inside the right viewport but chrome's bug make things pixelated -->
		<nodeCanvas></nodeCanvas>
		<div nodeGraph class="view right"></div>

	</div>
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
