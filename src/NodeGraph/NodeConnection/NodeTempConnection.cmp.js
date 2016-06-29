import { Component } from 'angular2/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'

@Component( {

	selector: '[nodeTempConnection]',
	template:
	`
		<svg:line style="pointer-events: none" stroke="#00bbff"
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
		let viewport = this.ngs.getContainerElem()
		let offset = viewport.offset()
		let scrollLeft = viewport.scrollLeft()
		let scrollTop = viewport.scrollTop()
		return { x: $event.clientX - offset.left + scrollLeft, y: $event.clientY - offset.top + scrollTop }
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
