import { Directive, ElementRef, HostListener, Input } from 'angular2/core'

@Directive( {

	selector: '[svgZoomable]'

} )
export class SvgZoomableDirective {

	@Input() targetId

	constructor( elRef: ElementRef ) {

		this.el = elRef.nativeElement
		this.handler = elRef.nativeElement

	}

	ngOnInit() {

		if ( this.targetId ) this.el = document.getElementById( this.targetId )

		if ( !this.el.hasAttribute( 'transform' ) ) {
			this.el.setAttribute( 'transform', 'matrix(1,0,0,1,0,0)' )
		}

	}

	@HostListener( 'mousewheel', [ '$event' ] ) onMouseWheel( $event ) {

		$event.preventDefault()
		let mat = this.el.getAttribute( 'transform' ).match( /[\d|\.|\+|-]+/g ).map( v => parseFloat( v ) )
		, gain = 2.0
		, minz = 0.25
		, maxz = 10.0
		, dd = gain * Math.sign( $event.wheelDelta ) * 0.1
		, ss = mat[ 0 ] + ( mat[ 0 ] * dd )
		, sd = ss / mat[ 0 ]
		, handlerOffsetLeft = this.handler.getBoundingClientRect().left + document.body.scrollLeft - document.body.clientLeft
		, handlerOffsetTop = this.handler.getBoundingClientRect().top + document.body.scrollTop - document.body.clientTop
		, ox = $event.pageX - handlerOffsetLeft
		, oy = $event.pageY - handlerOffsetTop
		, cx = mat[ 4 ]
		, cy = mat[ 5 ]
		, xx = sd * ( cx - ox ) + ox
		, yy = sd * ( cy - oy ) + oy

		if ( ss < minz || ss > maxz ) return

		this.el.setAttribute( 'transform', `matrix(${ss},${mat[1]},${mat[2]},${ss},${xx},${yy})` )

	}

}
