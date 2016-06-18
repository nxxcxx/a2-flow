import { Component } from 'angular2/core'
import { NodeManager } from './nodeManager.service'
import { NodeItem } from './nodeItem.component'
import { SvgMovableDirective } from './svgMovable.directive'
import { SvgZoomableDirective } from './svgZoomable.directive'
import { SvgUIService } from './svgUI.service'

@Component( {

	selector: 'node-graph',
	directives: [ NodeItem, SvgMovableDirective, SvgZoomableDirective ],
	providers: [ SvgUIService ],
	template:
	`
	<div class="view right">
		<svg id="nodeGraph">
			<rect svgMovable svgZoomable [isRootCtrl]="true" targetId="svgMoveCtrlRoot" fill="rgba(0,0,0,0)" width="100%" height="100%" />
			<g id="svgMoveCtrlRoot">
				<g nodeItem *ngFor="let currentNode of nodeManager.getNodes()" [node]="currentNode" />
			</g>
		</svg>
	</div>
	`

} )
export class NodeGraph {

	constructor( nodeManager: NodeManager ) {
		this.nodeManager = nodeManager
	}

}
