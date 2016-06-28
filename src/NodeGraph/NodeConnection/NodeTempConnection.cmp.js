import { Component, Input } from 'angular2/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import { NodeSvgService } from 'src/NodeGraph/NodeSvg/NodeSvg.svc'

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

	constructor( ngs: NodeGraphService, nss: NodeSvgService ) {
		this.ngs = ngs
		this.nss = nss
		this.mousePos = { x: 0, y: 0 }
	}

	ngOnInit() {
		this.mousedownEvent = () => {
			this.mousePos = this.getStartCoord()
		}
		this.mouseupEvent = () => {
			this.ngs.linking = false
		}
		this.mousemoveEvent = $event => {
			if ( this.ngs.linking ) {
				this.mousePos = this.nss.getMousePositionSVG( $event )
			}
		}
	}

	ngAfterViewInit() {
		this.nss.addEventListener( 'mousedown', this.mousedownEvent )
		this.nss.addEventListener( 'mouseup', this.mouseupEvent )
		this.nss.addEventListener( 'mousemove', this.mousemoveEvent )
	}

	ngOnDestroy() {
		this.nss.removeEventListener( 'mousedown', this.mousedownEvent )
		this.nss.removeEventListener( 'mouseup', this.mouseupEvent )
		this.nss.removeEventListener( 'mousemove', this.mousemoveEvent )
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
