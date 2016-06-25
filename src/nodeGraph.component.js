import { Component } from 'angular2/core'
import { NodeManager } from './nodeManager.service'
import { NodeItem } from './nodeItem.component'
import { SvgMovableDirective } from './svgMovable.directive'
import { SvgZoomableDirective } from './svgZoomable.directive'
import { SvgUIService } from './svgUI.service'
import { NodeConnection } from './nodeConnection.component'

@Component( {

	selector: 'node-graph',
	directives: [ NodeItem, SvgMovableDirective, SvgZoomableDirective, NodeConnection ],
	providers: [ SvgUIService ],
	template:
	`
	<div class="view right">
		<svg id="nodeGraph">
			<rect svgMovable svgZoomable [isRootCtrl]="true" targetId="svgMoveCtrlRoot" fill="rgba(0,0,0,0)" width="100%" height="100%" />
			<g id="svgMoveCtrlRoot">
				<line [attr.visibility]="nodeMan.linking ? 'visible' : 'hidden'"
					[attr.x1]="getTempConnStartCoord().x"
					[attr.y1]="getTempConnStartCoord().y"
					x2="100"
					y2="100" stroke="#fff"
				/>
				<g nodeConnection *ngFor="let conn of nodeMan.getConnections()" [connection]="conn" />
				<g nodeItem *ngFor="let currentNode of nodeMan.getNodes()" [node]="currentNode" />
			</g>
		</svg>
	</div>
	`

} )
export class NodeGraph {

	constructor( nodeManager: NodeManager, svgUI: SvgUIService ) {
		this.nodeMan = nodeManager
		this.svgUI = svgUI
	}

	getTempConnStartCoord() {
		let p = { x: 0, y: 0 }
		if ( this.nodeMan.connectingIO.src ) {
			p.x = this.nodeMan.connectingIO.src.ui.absolutePosition.x
			p.y = this.nodeMan.connectingIO.src.ui.absolutePosition.y
		}
		return p
	}

	getTempConnEndCoord() {

		// return this.svgUI.getRelativeMousePosition()

		// if ( !$scope.active ) return;
		// var off =  $( '#nodeCanvas').offset();
		// var cx = e.pageX - offset.left;
		// var cy = e.pageY - offset.top;
		// var sc = zoomCtrl.scalingFactor;
		// var pos = panCtrl.getPosition();
		// var ox = pos.x;
		// var oy = pos.y;
		// $scope.end = {
		// 	 x: ( cx - ox ) / sc,
		// 	 y: ( cy - oy ) / sc
		// };
	}

}
