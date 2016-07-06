import { Component } from '@angular/core'
import { NodeDetails } from 'src/NodeDetails/NodeDetails.cmp'
import { NodeGraph } from 'src/NodeGraph/NodeGraph.cmp'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'

@Component( {

	selector: '[rootComponent]',
	directives: [ NodeDetails, NodeGraph ],
	providers: [ NodeGraphService ],
	template:
	`
	<canvas #canvas id="canvas" style="
		position: absolute;
		bottom: 0px; right: 0px;
		width: 300px; height: 180px;
		border: 1px solid white;
	">
	</canvas>
	<div nodeDetails class="view left"></div>
	<div nodeGraph class="view right"></div>
	`

} )
export class RootComponent {

}
