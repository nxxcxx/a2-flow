import { Directive, ElementRef, HostListener, Input } from 'angular2/core'
import { NodeManager } from './nodeManager.service'

@Directive( {

	selector: '[nodeIO]'

} )
export class NodeIO {

	@Input() io
	@Input() ioFree

	constructor( elRef: ElementRef, nodeMan: NodeManager ) {
		this.el = elRef.nativeElement
		this.nodeMan = nodeMan
	}

	ngOnChanges() {
		this.setFillColor( !this.ioFree )
	}

	setFillColor( bool ) {
		// TODO use css class
		if ( bool ) this.el.setAttribute( 'fill', '#fff' )
		else this.el.setAttribute( 'fill', 'rgba(0,0,0,0)' )
	}

	@HostListener( 'mousedown' ) onMouseDown() {
		this.nodeMan.startConnectingIO( this.io )
	}

	@HostListener( 'mouseup' ) onMouseUp() {
		this.nodeMan.endConnectingIO( this.io )
	}

	@HostListener( 'mouseenter' ) onMouseEnter() {
		if ( this.ioFree ) this.setFillColor( true )
	}

	@HostListener( 'mouseleave' ) onMouseLeave() {
		if ( this.ioFree ) this.setFillColor( false )
	}

	@HostListener( 'dblclick' ) onDblClick() {
		this.nodeMan.disconnectIO( this.io )
	}

}
