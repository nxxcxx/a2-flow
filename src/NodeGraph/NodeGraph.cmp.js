import { Component, ViewChild } from 'angular2/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import { NodeModule } from 'src/NodeGraph/NodeModule/NodeModule.cmp'
import { SvgMovableDirective } from 'src/NodeGraph/NodeSvg/MovableSvg.dir'
import { SvgZoomableDirective } from 'src/NodeGraph/NodeSvg/ZoomableSvg.dir'
import { NodeSvgService } from 'src/NodeGraph/NodeSvg/NodeSvg.svc'
import { NodeConnection } from 'src/NodeGraph/NodeConnection/NodeConnection.cmp'
import { NodeTempConnection } from 'src/NodeGraph/NodeConnection/NodeTempConnection.cmp'

@Component( {

	selector: 'nodeGraph',
	directives: [ NodeModule, SvgMovableDirective, SvgZoomableDirective, NodeConnection, NodeTempConnection ],
	providers: [ NodeSvgService ],
	template:
	`
	<div class="view right">

		<div class="view right backdrop"></div>

		<svg #svgCanvas id="nodeGraph">
			<rect #viewportCtrl svgMovable svgZoomable targetId="svgViewport" fill="rgba(0,0,0,0)" width="100%" height="100%" />
			<g #viewport id="svgViewport">
				<g nodeConnection *ngFor="let conn of ngs.getConnections()" [connection]="conn" />
				<g nodeModule *ngFor="let currentNode of ngs.getNodes()" [node]="currentNode" />
				<g nodeTempConnection [active]="ngs.linking" />
			</g>
		</svg>

	</div>
	`

} )
export class NodeGraph {

	@ViewChild( 'svgCanvas' ) svgCanvas
	@ViewChild( 'viewportCtrl' ) viewportCtrl
	@ViewChild( 'viewport') viewport

	constructor( ngs: NodeGraphService, nss: NodeSvgService ) {
		this.ngs = ngs
		this.nss = nss
	}

	ngAfterViewInit() {
		this.nss.initSvgCanvas( this.svgCanvas.nativeElement, this.viewportCtrl.nativeElement, this.viewport.nativeElement )
	}

}
