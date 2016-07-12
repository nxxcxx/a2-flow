import { Component } from '@angular/core'
import { NodeDetails } from 'src/NodeDetails/NodeDetails.cmp'
import { NodeGraph } from 'src/NodeGraph/NodeGraph.cmp'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import { NodeCanvas } from 'src/NodeGraph/NodeCanvas.cmp'
import { NodeStats } from 'src/NodeGraph/NodeStats.cmp'
import { NodeStoreService } from 'src/NodeGraph/NodeStore.svc'
import { NodeEngineService } from 'src/NodeGraph/NodeEngine.svc'
import { NodeRegistryService } from 'src/NodeGraph/NodeRegistry.svc'
import { NodeIEService } from 'src/NodeGraph/NodeIE.svc'
import { NodeConnectionService } from 'src/NodeGraph/NodeConnection.svc'
const html = String.raw

@Component( {

	selector: '[rootComponent]',
	directives: [ NodeDetails, NodeGraph, NodeCanvas, NodeStats ],
	providers: [
		NodeRegistryService, NodeStoreService, NodeGraphService, NodeEngineService, NodeIEService,
		NodeConnectionService
	],
	template:
	html`
	<div>

		<div nodeDetails class="view left"></div>

		<!-- nodeCanvas suppose to be inside the right viewport but chrome's bug make things pixelated -->
		<nodeCanvas></nodeCanvas>
		<div nodeGraph class="view right"></div>

		<nodeStats></nodeStats>

	</div>
	`

} )
export class RootComponent {

	constructor( _reg: NodeRegistryService ) {
		global._REG = _reg
	}

}
