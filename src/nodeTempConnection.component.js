import { Component, Input } from 'angular2/core'
import { NodeManager } from './nodeManager.service'

@Component( {

	selector: '[nodeTempConnection]',
	template:
	`
		<svg:line style="pointer-events: none"
			[attr.visibility]="active ? 'visible' : 'hidden'"
			[attr.x1]="getTempConnStartCoord().x"
			[attr.y1]="getTempConnStartCoord().y"
			x2="200" y2="200"
			stroke="#fff"
		/>
	`

} )
export class NodeTempConnection {

	@Input() active

	constructor( nodeMan: NodeManager ) {
		this.nodeMan = nodeMan
	}

	ngOnInit() {
		this.mouseupEvent = () => {
			// TODO: set as function - this.nodeMan.deactivateConnectionLink()
			this.nodeMan.linking = false
		}
		// TODO: svgUI.addEventListener ...

	}

	ngOnChanges() {
	}

	ngOnDestroy() {
		// TODO: svgUI.removeEventListener ...
	}

	getTempConnStartCoord() {
		let p = { x: 0, y: 0 }
		if ( this.nodeMan.connectingIO.src ) {
			p.x = this.nodeMan.connectingIO.src.ui.absolutePosition.x
			p.y = this.nodeMan.connectingIO.src.ui.absolutePosition.y
		}
		return p
	}

}


// 	if ( this.nodeMan.linking ) {
// 		this.svgMousePosition = this.svgUI.getMousePositionSVG( $event )
// 	}



// [attr.x2]="svgMousePosition.x"
// [attr.y2]="svgMousePosition.y"
