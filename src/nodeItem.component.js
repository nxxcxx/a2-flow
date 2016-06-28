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
			lineHeight: 13,
			header: { height: 16, x: 3, y: 4 },
			io: { width: 10, height: 10 },
			output: { label: { x: 4, y: 3 }, io: { x: 0, y: 0 } },
			input: { label: { x: 4, y: 3 }, io: { x: 0, y: 0 } },
			extraSpacing: { height: 4 }
		}
		// TODO:
		// this.ui.settings
		// this.ui.computed
	}

	ngAfterViewInit() {
		// monkey patch setTimeout https://github.com/angular/angular/issues/6005
		setTimeout( () => {
			let ui = this.ui
			ui.node.width = this.computeMaxLabelWidth() + ui.centerSpacing + ui.io.width * 2
			ui.node.height = Math.max( this.node.input.length, this.node.output.length ) * ui.lineHeight + ui.header.height + ui.extraSpacing.height
			ui.output.label.x = ui.node.width - ui.io.width - ui.output.label.x
			ui.input.label.x = ui.io.width + ui.input.label.x
			ui.output.io.x = ui.node.width - ui.io.width
			ui.output.io.y
		}, 0 )
	}

	computeMaxLabelWidth() {
		let maxWidthInp = 0, maxWidthOpt = 0
		for ( let el of this.inputElem.nativeElement.children ) {
			maxWidthOpt = Math.max( el.children[ 0 ].getComputedTextLength(), maxWidthOpt )
		}
		for ( let el of this.outputElem.nativeElement.children ) {
			maxWidthInp = Math.max( el.children[ 0 ].getComputedTextLength(), maxWidthInp )
		}
		return Math.max( maxWidthInp + maxWidthOpt, this.headerElem.nativeElement.getComputedTextLength() )
	}

	getLabelPosY( idx ) {
		// TODO: separate label for opt &  inp
		return idx * this.ui.lineHeight + this.ui.header.height + this.ui.output.label.y
	}

	updateNodePosition( position ) {
		this.node.ui.absolutePosition.x = position.x
		this.node.ui.absolutePosition.y = position.y
		this.node.output.forEach( ( io, idx ) => {
			io.ui.absolutePosition.x = position.x + this.ui.output.io.x + this.ui.io.width
			io.ui.absolutePosition.y = position.y + this.getLabelPosY( idx ) + this.ui.io.height * 0.5
		} )
		this.node.input.forEach( ( io, idx ) => {
			io.ui.absolutePosition.x = position.x + this.ui.input.io.x
			io.ui.absolutePosition.y = position.y + this.getLabelPosY( idx ) + this.ui.io.height * 0.5
		} )
	}

	select() {
		this.nodeManager.setSelectedNode( this.node )
	}

}
