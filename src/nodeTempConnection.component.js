import { Component, Input } from 'angular2/core'
import { NodeManager } from './nodeManager.service'
import { SvgUIService } from './svgUI.service'

@Component( {

	selector: '[nodeTempConnection]',
	template:
	`
		<svg:line style="pointer-events: none" stroke="#fff"
			[attr.visibility]="active ? 'visible' : 'hidden'"
			[attr.x1]="getStartCoord().x"
			[attr.y1]="getStartCoord().y"
			[attr.x2]="mousePos.x"
			[attr.y2]="mousePos.y"
		/>
	`

} )
export class NodeTempConnection {

	@Input() active

	constructor( nodeMan: NodeManager, svgUI: SvgUIService ) {
		this.nodeMan = nodeMan
		this.svgUI = svgUI
		this.mousePos = { x: 0, y: 0 }
	}

	ngOnInit() {
		this.mousedownEvent = () => {
			this.mousePos = this.getStartCoord()
		}
		this.mouseupEvent = () => {
			this.nodeMan.linking = false
		}
		this.mousemoveEvent = $event => {
			if ( this.nodeMan.linking ) {
				this.mousePos = this.svgUI.getMousePositionSVG( $event )
			}
		}
	}

	ngAfterViewInit() {
		this.svgUI.addEventListener( 'mousedown', this.mousedownEvent )
		this.svgUI.addEventListener( 'mouseup', this.mouseupEvent )
		this.svgUI.addEventListener( 'mousemove', this.mousemoveEvent )
	}

	ngOnDestroy() {
		this.svgUI.removeEventListener( 'mousedown', this.mousedownEvent )
		this.svgUI.removeEventListener( 'mouseup', this.mouseupEvent )
		this.svgUI.removeEventListener( 'mousemove', this.mousemoveEvent )
	}

	getStartCoord() {
		let p = { x: 0, y: 0 }
		if ( this.nodeMan.connectingIO.src ) {
			p.x = this.nodeMan.connectingIO.src.ui.absolutePosition.x
			p.y = this.nodeMan.connectingIO.src.ui.absolutePosition.y
		}
		return p
	}

}
