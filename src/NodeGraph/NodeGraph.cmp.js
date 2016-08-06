import { Component, ElementRef, HostListener, ViewChild } from '@angular/core'
import { NodeModule } from 'src/NodeGraph/NodeModule/NodeModule.cmp'
import { NodeConnection } from 'src/NodeGraph/NodeConnection/NodeConnection.cmp'
import { NodeTempConnection } from 'src/NodeGraph/NodeConnection/NodeTempConnection.cmp'
import { NodeRegistryService } from 'src/NodeGraph/NodeRegistry.svc'
import { SelectionBox } from 'src/NodeGraph/SelectionBox.cmp'
import { NodeModuleDisplay } from 'src/NodeGraph/NodeModule/NodeModuleDisplay.cmp'
const html = String.raw

@Component( {

	selector: '[nodeGraph]',
	directives: [ NodeModule, NodeConnection, NodeTempConnection, SelectionBox, NodeModuleDisplay ],
	styles: [ require( '!raw!sass!root/sass/NodeGraph.cmp.sass') ],
	template:
	html`
	<div #container class="nodeGraphContainer"
		style="pointer-events: none; position: absolute; width: 5000px; height: 5000px;
			transform-origin: 0px 0px; transform: matrix(1,0,0,1,0,0);
		"
	>

		<svg class="nodeContainerSvg">
			<g nodeConnection *ngFor="let conn of ngs.getConnections()"
				[connection]="conn"
				[x1]="conn[ 0 ].position.x" [y1]="conn[ 0 ].position.y"
				[x2]="conn[ 1 ].position.x" [y2]="conn[ 1 ].position.y"
			/>
			<g nodeTempConnection />
		</svg>

		<div class="nodeContainer">
			<div *ngFor="let node of ngs.getNodes()">
				<div *ngIf="node.type === 'NM_BASIC'" nodeModule [node]="node"></div>
				<div *ngIf="node.type === 'NM_DISPLAY'" nodeModuleDisplay [node]="node"></div>
				<!-- TODO: node.type = 'NM_XPACK' -->
			</div>
		</div>

	</div>

	<div selectionBox></div>
	`

} )
export class NodeGraph {

	@ViewChild( 'container' ) container
	@ViewChild( 'canvas' ) canvas

	constructor( elRef: ElementRef, _reg: NodeRegistryService ) {
		this._store = _reg._store
		this.ngs = _reg.request( 'NodeGraph' )
		this.el = elRef.nativeElement
		this.clampScale = 0.2
	}

	ngOnInit() {
		this.ngs.registerViewportElem( this.el )
		this.ngs.registerNodeContainerElem( this.container.nativeElement )

		setInterval( () => {
			if ( !this.ioUnderCursor ) return
			if ( this.ioUnderCursor.type === 0 ) {
				console.log( 'OPT:', this.ioUnderCursor.data )
			} else if ( this.ioUnderCursor.type === 1 ) {
				console.log( 'INP:', this.ioUnderCursor.output.data )
			}
		}, 100 )
	}

	zoom( anchor, delta ) {
		let mat = this.ngs.getNodeContainerTransformationMatrix()
		, dd = - Math.sign( delta ) * 0.1
		, sf = Math.max( mat[ 0 ] * ( 1.0 + dd ), this.clampScale )
		, sd = sf / mat[ 0 ]
		, xx = sd * ( mat[ 4 ] - anchor.x ) + anchor.x
		, yy = sd * ( mat[ 5 ] - anchor.y ) + anchor.y
		this.ngs.getNodeContainerElem().css( 'transform', `matrix(${sf},0,0,${sf},${xx},${yy})` )
		this._store.zoomFactor = sf
	}

	pan( delta ) {
		let viewport = this.ngs.getViewportElem()
		viewport.scrollLeft( viewport.scrollLeft() - delta.x )
		viewport.scrollTop( viewport.scrollTop() - delta.y )
	}

	@HostListener( 'wheel', [ '$event' ] ) onMouseWheel( $event ) {
		$event.preventDefault()
		let viewport = this.ngs.getViewportElem()
		, viewportOffset = viewport.offset()
		let anchor = {
			x: $event.clientX - viewportOffset.left + viewport.scrollLeft(),
			y: $event.clientY - viewportOffset.top + viewport.scrollTop()
		}
		this.zoom( anchor, $event.deltaY )
		this.ngs.getSelectedNodes()
			.filter( n => n !== this.node )
			.map( n => n._ngComponent.resetPrevPos() )
	}

	@HostListener( 'mousedown', [ '$event' ] ) onMouseDown( $event ) {
		if ( $event.which !== 2 || $event.target !== this.ngs.getViewportElem()[ 0 ] ) return
		this.mousehold = true
		this.prevMouse = { x: $event.clientX, y: $event.clientY }
	}

	@HostListener( 'mouseup' ) onMouseUp() {
		this.mousehold = false
	}

	@HostListener( 'mousemove', [ '$event' ] ) onMouseMove( $event ) {

		if ( $event.target._ioComponentRef ) {
			this.ioUnderCursor = $event.target._ioComponentRef.io
		} else {
			this.ioUnderCursor = null
		}

		if ( !this.mousehold || ( $event.target !== this.ngs.getViewportElem()[ 0 ] ) ) return
		this.pan( { x: $event.clientX - this.prevMouse.x, y: $event.clientY - this.prevMouse.y } )
		this.prevMouse = { x: $event.clientX, y: $event.clientY }
	}

	@HostListener( 'contextmenu', [ '$event' ] ) onContextMenu( $event ) {
		$event.preventDefault()
	}

}
