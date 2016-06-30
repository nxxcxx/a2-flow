import { Component } from 'angular2/core'
import { NodeDetails } from 'src/NodeDetails/NodeDetails.cmp'
import { NodeGraph } from 'src/NodeGraph/NodeGraph.cmp'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'

@Component( {

	selector: '[rootComponent]',
	directives: [ NodeDetails, NodeGraph ],
	providers: [ NodeGraphService ],
	template:
	`
	<div nodeDetails class="view left"></div>
	<div nodeGraph class="view right"></div>
	`

} )
export class RootComponent {

}
