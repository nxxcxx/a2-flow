import { Component } from 'angular2/core'
import { NodeDetails } from 'src/NodeDetails/NodeDetails.cmp'
import { NodeGraph } from 'src/NodeGraph/NodeGraph.cmp'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'


@Component( {

	selector: 'rootComponent',
	template: '<nodeDetails></nodeDetails><nodeGraph></nodeGraph>',
	directives: [ NodeDetails, NodeGraph ],
	providers: [ NodeGraphService ]

} )
export class RootComponent {

}
