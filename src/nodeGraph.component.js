import { Component, ViewChild } from 'angular2/core'
import { NodeManager } from './nodeManager.service'
import { NodeItem } from './nodeItem.component'
import { SvgMovableDirective } from './svgMovable.directive'
import { SvgZoomableDirective } from './svgZoomable.directive'
import { SvgUIService } from './svgUI.service'
import { NodeConnection } from './nodeConnection.component'
import { NodeTempConnection } from './nodeTempConnection.component'

@Component( {

	selector: 'nodeGraph',
	directives: [ NodeItem, SvgMovableDirective, SvgZoomableDirective, NodeConnection, NodeTempConnection ],
	providers: [ SvgUIService ],
	template:
	`
	<div class="view right">
		<svg #svgCanvas id="nodeGraph">
			<rect #viewportCtrl svgMovable svgZoomable targetId="svgViewport" fill="rgba(0,0,0,0)" width="100%" height="100%" />
			<g #viewport id="svgViewport">
				<g nodeConnection *ngFor="let conn of nodeMan.getConnections()" [connection]="conn" />
				<g nodeItem *ngFor="let currentNode of nodeMan.getNodes()" [node]="currentNode" />
				<g nodeTempConnection [active]="nodeMan.linking" />
			</g>
		</svg>
	</div>
	`

} )
export class NodeGraph {

	@ViewChild( 'svgCanvas' ) svgCanvas
	@ViewChild( 'viewportCtrl' ) viewportCtrl
	@ViewChild( 'viewport') viewport

	constructor( nodeManager: NodeManager, svgUI: SvgUIService ) {
		this.nodeMan = nodeManager
		this.svgUI = svgUI
	}

	ngOnInit() {}

	ngAfterViewInit() {
		this.svgUI.initSvgCanvas( this.svgCanvas.nativeElement, this.viewportCtrl.nativeElement, this.viewport.nativeElement )
	}

}
