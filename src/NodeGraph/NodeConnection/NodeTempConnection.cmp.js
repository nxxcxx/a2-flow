import { Component } from '@angular/core'
import { NodeRegistryService } from 'src/NodeGraph/NodeRegistry.svc'
const html = String.raw

@Component( {

	selector: '[nodeTempConnection]',
	template:
	html`
		<svg:line
			[attr.visibility]="isConnecting() ? 'visible' : 'hidden'"
			[attr.x1]="getStartCoord().x"
			[attr.y1]="getStartCoord().y"
			[attr.x2]="mousePos.x"
			[attr.y2]="mousePos.y"
			stroke-width="1" stroke="#0bb1f9"
			style="pointer-events: none"
		/>
	`

} )
export class NodeTempConnection {

	constructor( _reg: NodeRegistryService ) {
		this._store = _reg._store
		this.ngs = _reg.request( 'NodeGraph' )
		this.mousePos = { x: 0, y: 0 }
	}

	ngAfterViewInit() {
		this.mousedownEvent = $event => {
			this.mousePos = this.getMousePositionAbsolute( $event )
		}
		this.mouseupEvent = () => {
			this._store.isConnecting = false
		}
		this.mousemoveEvent = $event => {
			if ( !this._store.isConnecting ) return
			this.mousePos = this.getMousePositionAbsolute( $event )
		}
		this.ngs.getViewportElem()
		.on( 'mousedown', this.mousedownEvent )
		.on( 'mouseup', this.mouseupEvent )
		.on( 'mousemove', this.mousemoveEvent )
	}

	getMousePositionAbsolute( $event ) {
		let viewport = this.ngs.getViewportElem()
		, offset = viewport.offset()
		, zf = this._store.zoomFactor
		, mat = this.ngs.getNodeContainerTransformationMatrix()
		return {
			x: ( $event.clientX - offset.left + viewport.scrollLeft() - mat[ 4 ] ) / zf,
			y: ( $event.clientY - offset.top + viewport.scrollTop() - mat[ 5 ] ) / zf
		}
	}

	getStartCoord() {
		let p = { x: 0, y: 0 }
		, io = this._store.connectingIO.src
		if ( io ) {
			// TODO: no hard coded offset
			p.x = io.position.x + 5 * ( io.type === 0 ? 1 : -1 )
			p.y = io.position.y
		}
		return p
	}

	isConnecting() {
		return this._store.isConnecting
	}

}
