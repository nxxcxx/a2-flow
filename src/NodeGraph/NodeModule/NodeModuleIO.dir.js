import { Directive, ElementRef, HostListener, Input } from 'angular2/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'

@Directive( {

	selector: '[nodeIO]'

} )
export class NodeModuleIO {

	@Input() io
	@Input() ioFree

	constructor( elRef: ElementRef, ngs: NodeGraphService ) {
		this.el = elRef.nativeElement
		this.ngs = ngs
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
		this.ngs.startConnectingIO( this.io )
	}

	@HostListener( 'mouseup' ) onMouseUp() {
		this.ngs.endConnectingIO( this.io )
	}

	@HostListener( 'mouseenter' ) onMouseEnter() {
		if ( this.ioFree ) this.setFillColor( true )
	}

	@HostListener( 'mouseleave' ) onMouseLeave() {
		if ( this.ioFree ) this.setFillColor( false )
	}

	@HostListener( 'dblclick' ) onDblClick() {
		this.ngs.disconnectIO( this.io )
	}

}
