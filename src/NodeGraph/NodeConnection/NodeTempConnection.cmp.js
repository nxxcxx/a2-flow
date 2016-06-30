import { Component } from 'angular2/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import $ from 'jquery'

@Component( {

	selector: '[nodeTempConnection]',
	template:
	`
		<svg:line style="pointer-events: none" stroke="#0bb1f9"
			[attr.visibility]="ngs.linking ? 'visible' : 'hidden'"
			[attr.x1]="getStartCoord().x"
			[attr.y1]="getStartCoord().y"
			[attr.x2]="mousePos.x"
			[attr.y2]="mousePos.y"
		/>
	`

} )
export class NodeTempConnection {

	constructor( ngs: NodeGraphService ) {
		this.ngs = ngs
		this.mousePos = { x: 0, y: 0 }
	}

	ngOnInit() {
		this.mousedownEvent = $event => {
			this.mousePos = this.getMousePositionAbsolute( $event )
		}
		this.mouseupEvent = () => {
			this.ngs.linking = false
		}
		this.mousemoveEvent = $event => {
			if ( this.ngs.linking ) {
				this.mousePos = this.getMousePositionAbsolute( $event )
			}
		}
	}

	getMousePositionAbsolute( $event ) {
		// TODO: no ID selector
		let viewport = this.ngs.getContainerElem()
		let offset = viewport.offset()
		let zf = this.ngs.zoomFactor
		let mat = $( '#nodeGraphContainer' ).css( 'transform' ).match( /[\d|\.|\+|-]+/g ).map( v => parseFloat( v ) )
		return {
			x: ( $event.clientX - offset.left + viewport.scrollLeft() - mat[ 4 ] ) / zf,
			y: ( $event.clientY - offset.top + viewport.scrollTop() - mat[ 5 ] ) / zf
		}
	}

	ngAfterViewInit() {
		this.ngs.getContainerElem()
		.on( 'mousedown', this.mousedownEvent )
		.on( 'mouseup', this.mouseupEvent )
		.on( 'mousemove', this.mousemoveEvent )
	}

	ngOnDestroy() {
		this.ngs.getContainerElem()
		.off( 'mousedown', this.mousedownEvent )
		.off( 'mouseup', this.mouseupEvent )
		.off( 'mousemove', this.mousemoveEvent )
	}

	getStartCoord() {
		let p = { x: 0, y: 0 }
		if ( this.ngs.connectingIO.src ) {
			p.x = this.ngs.connectingIO.src.ui.absolutePosition.x
			p.y = this.ngs.connectingIO.src.ui.absolutePosition.y
		}
		return p
	}

}
