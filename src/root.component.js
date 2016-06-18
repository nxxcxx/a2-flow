import { Component } from 'angular2/core'
import { NodeDetails } from './nodeDetails.component'
import { NodeGraph } from './nodeGraph.component'
import { NodeManager } from './nodeManager.service'


@Component( {

	selector: 'root-component',
	template: '<node-details></node-details><node-graph></node-graph>',
	directives: [ NodeDetails, NodeGraph ],
	providers: [ NodeManager ]

} )
export class RootComponent {
	
}
