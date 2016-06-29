import { Directive, ElementRef } from 'angular2/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'
import $ from 'jquery'

@Directive( {

	selector: '[nodeGraphCtrl]'

} )
export class NodeGraphCtrl {

	constructor( elRef: ElementRef, ngs: NodeGraphService ) {
		this.ngs = ngs
		this.el = elRef.nativeElement
	}

	registerCtrlTarget( targetElem ) {
		let target = $( targetElem )
		let controller = $( this.el )
		this.mousedownEvent = $event => {
			this.mousehold = true
			this.prevMouse = { x: $event.clientX, y: $event.clientY }
			this.prevPos = target.position()
		}
		this.mouseupEvent = () => {
			this.mousehold = false
		}
		this.mousemoveEvent = $event => {
			if ( this.mousehold ) {
				let [ dx, dy ] = [ $event.clientX - this.prevMouse.x, $event.clientY - this.prevMouse.y ]
				target.css( { left: this.prevPos.left + dx, top: this.prevPos.top + dy } )
			}
		}
		controller.on( 'mousedown', this.mousedownEvent )
		.on( 'mouseup', this.mouseupEvent )
		.on( 'mousemove', this.mousemoveEvent )
	}


}
