import { Component } from 'angular2/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'

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

	getMousePositionAbsolute( $event ) {
		let viewport = this.ngs.getViewportElem()
		, offset = viewport.offset()
		, zf = this.ngs.zoomFactor
		, mat = this.ngs.getNodeContainerTransformationMatrix()
		return {
			x: ( $event.clientX - offset.left + viewport.scrollLeft() - mat[ 4 ] ) / zf,
			y: ( $event.clientY - offset.top + viewport.scrollTop() - mat[ 5 ] ) / zf
		}
	}

	ngAfterViewInit() {
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
		this.ngs.getViewportElem()
		.on( 'mousedown', this.mousedownEvent )
		.on( 'mouseup', this.mouseupEvent )
		.on( 'mousemove', this.mousemoveEvent )
	}

	getStartCoord() {
		let p = { x: 0, y: 0 }
		, io = this.ngs.connectingIO.src
		if ( io ) {
			// TODO: no hard coded offset
			p.x = io.position.x + 5 * ( io.type === 0 ? 1 : -1 )
			p.y = io.position.y
		}
		return p
	}

}
