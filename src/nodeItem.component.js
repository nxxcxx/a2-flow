import { Component, Input, ViewChild, ElementRef } from 'angular2/core'
import { SvgMovableDirective } from './svgMovable.directive'
import { NodeManager } from './nodeManager.service'

@Component( {

	selector: '[nodeItem]',
	directives: [ SvgMovableDirective ],
	template: require( './nodeItem.html' ) // using require instad of templateUrl so webpack can watch the file

} )
export class NodeItem {

	@Input() node
	@ViewChild( 'headerElem' ) headerElem
	@ViewChild( 'inputElem' ) inputElem
	@ViewChild( 'outputElem' ) outputElem

	constructor( elRef: ElementRef, nodeManager: NodeManager ) {
		this.elRef = elRef
		this.nodeManager = nodeManager
		this.ui = {
			node: { width: 0, height: 0 },
			centerSpacing: 10,
			lineHeight: 12,
			headerHeight: 16,
			io: { width: 8, height: 8, spacing: { x: 4, y: 0 }, offset: { x: 0, y: 2 } },
			input: { label: { x: 0, y: 0 }, io: { x: 0, y: 0 } },
			output: { label: { x: 0, y: 0 }, io: { x: 0, y: 0 } }
		}
	}

	ngOnInit() {
	}

	ngAfterViewInit() {
		let maxWidth = 0, maxWidthInp = 0, maxWidthOpt = 0
		Array.from( this.inputElem.nativeElement.children ).forEach( el => {
			maxWidthInp = Math.max( el.children[ 0 ].getComputedTextLength(), maxWidthInp )
		} )
		Array.from( this.outputElem.nativeElement.children ).forEach( el => {
			maxWidthOpt = Math.max( el.children[ 0 ].getComputedTextLength(), maxWidthOpt )
		} )
		maxWidth = Math.max( maxWidthInp + maxWidthOpt, this.headerElem.nativeElement.getComputedTextLength() )
		// monkey patch setTimeout https://github.com/angular/angular/issues/6005
		setTimeout( () => {
			let ui = this.ui
			ui.node.width = maxWidth + ui.centerSpacing + ( ui.io.width + ui.io.spacing.x ) * 2
			ui.node.height = Math.max( this.node.input.length, this.node.output.length ) * ui.lineHeight + ui.headerHeight
			ui.input.label.x = ui.io.width + ui.io.spacing.x
			ui.output.label.x = ui.node.width - ui.io.width - ui.io.spacing.x
			ui.output.io.x = ui.node.width - ui.io.width
		}, 0 )
	}

	getLabelPosY( index ) {
		return index * this.ui.lineHeight + this.ui.headerHeight
	}

}
