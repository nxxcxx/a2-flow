import { Component, Input, ViewChild, ElementRef } from 'angular2/core'
import { SvgMovableDirective } from './svgMovable.directive'
import { NodeManager } from './nodeManager.service'
import { NodeIO } from './nodeIO.directive'

@Component( {

	selector: '[nodeItem]',
	directives: [ SvgMovableDirective, NodeIO ],
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
			header: { height: 16, offset: { x: 0, y: 0 } },
			io: { width: 8, height: 8, spacing: { x: 4, y: 0 }, offset: { x: 0, y: 2 } },
			input: { label: { x: 0, y: 0 }, io: { x: 0, y: 0 } },
			output: { label: { x: 0, y: 0 }, io: { x: 0, y: 0 } },
			padding: { top: 0, bottom: 0 }
		}
	}

	ngAfterViewInit() {
		// monkey patch setTimeout https://github.com/angular/angular/issues/6005
		setTimeout( () => {
			let ui = this.ui
			ui.node.width = this.computeNodeWidth() + ui.centerSpacing + ( ui.io.width + ui.io.spacing.x ) * 2
			ui.node.height = Math.max( this.node.input.length, this.node.output.length ) * ui.lineHeight + ui.header.height
			+ ui.padding.top + ui.padding.bottom
			ui.header.offset.y = ui.padding.top
			ui.input.label.x = ui.io.width + ui.io.spacing.x
			ui.output.label.x = ui.node.width - ui.io.width - ui.io.spacing.x
			ui.output.io.x = ui.node.width - ui.io.width
		}, 0 )
	}

	computeNodeWidth() {
		let maxWidthInp = 0, maxWidthOpt = 0
		for ( let el of this.inputElem.nativeElement.children ) {
			maxWidthOpt = Math.max( el.children[ 0 ].getComputedTextLength(), maxWidthOpt )
		}
		for ( let el of this.outputElem.nativeElement.children ) {
			maxWidthInp = Math.max( el.children[ 0 ].getComputedTextLength(), maxWidthInp )
		}
		return Math.max( maxWidthInp + maxWidthOpt, this.headerElem.nativeElement.getComputedTextLength() )
	}

	getLabelPosY( index ) {
		return index * this.ui.lineHeight + this.ui.header.height + this.ui.padding.top
	}

	updateNodePosition( position ) {
		this.node.ui.absolutePosition.x = position.x
		this.node.ui.absolutePosition.y = position.y
		this.node.output.forEach( ( io, idx ) => {
			io.ui.absolutePosition.x = position.x + this.ui.output.io.x + this.ui.io.width
			io.ui.absolutePosition.y = position.y + this.getLabelPosY( idx ) + this.ui.io.offset.y + this.ui.io.height * 0.5
		} )
		this.node.input.forEach( ( io, idx ) => {
			io.ui.absolutePosition.x = position.x + this.ui.input.io.x
			io.ui.absolutePosition.y = position.y + this.getLabelPosY( idx ) + this.ui.io.offset.y + this.ui.io.height * 0.5
		} )
	}

	select() {
		this.nodeManager.setSelectedNode( this.node )
	}

}
