import { Component, Input, ViewChild, ElementRef } from 'angular2/core'
import { SvgMovableDirective } from './svgMovable.directive'
import { NodeManager } from './nodeManager.service'

@Component( {

	selector: '[nodeItem]',
	directives: [ SvgMovableDirective ],
	template:
	// SVG snippet templates need an svg: prefix on their root element to disambiguate the SVG element from an HTML component.
	`
	<svg:g svgMovable>
		<rect [attr.width]="ui.node.width" [attr.height]="ui.node.height" stroke="black" fill="rgba(230,230,235,1.0)" />
		<text #headerVar alignment-baseline="hanging"> {{ node.name }} </text>
		<g #inputVar>
			<g *ngFor="let input of node.input; let i = index">
				<text [attr.x]="ui.input.label.x" [attr.y]="computeLabel_y( i )" alignment-baseline="hanging"> {{ input.name }} </text>
				<rect [attr.x]="ui.input.io.x" [attr.y]="computeLabel_y( i ) + ui.io.offset.y" [attr.width]="ui.io.width" [attr.height]="ui.io.height" stroke="black" fill="rgba(0,0,0,0)" />
			</g>
		</g>
		<g #outputVar>
			<g *ngFor="let output of node.output; let i = index">
				<text [attr.x]="ui.output.label.x" [attr.y]="computeLabel_y( i )" text-anchor="end" alignment-baseline="hanging"> {{ output.name }} </text>
				<rect [attr.x]="ui.output.io.x" [attr.y]="computeLabel_y( i ) + ui.io.offset.y" [attr.width]="ui.io.width" [attr.height]="ui.io.height" stroke="black" fill="rgba(0,0,0,0)" />
			</g>
		</g>
	</g>
	`

} )
export class NodeItem {

	@Input() node
	@ViewChild( 'headerVar' ) headerVar
	@ViewChild( 'inputVar' ) inputVar
	@ViewChild( 'outputVar' ) outputVar

	constructor( elRef: ElementRef, nodeManager: NodeManager ) {
		this.elRef = elRef
		this.nodeManager = nodeManager
		this.ui = {
			node: { width: 0, height: 0 },
			centerSpacing: 10,
			lineHeight: 12,
			headerHeight: 12,
			io: { width: 8, height: 8, spacing: { x: 4, y: 0 }, offset: { x: 0, y: 2 } },
			input: { label: { x: 0, y: 0 }, io: { x: 0, y: 0 } },
			output: { label: { x: 0, y: 0 }, io: { x: 0, y: 0 } }
		}
	}

	ngOnInit() {
	}

	ngAfterViewInit() {
		let maxWidth = 0, maxWidthInp = 0, maxWidthOpt = 0
		Array.from( this.inputVar.nativeElement.children ).forEach( el => {
			maxWidthInp = Math.max( el.children[ 0 ].getComputedTextLength(), maxWidthInp )
		} )
		Array.from( this.outputVar.nativeElement.children ).forEach( el => {
			maxWidthOpt = Math.max( el.children[ 0 ].getComputedTextLength(), maxWidthOpt )
		} )
		maxWidth = Math.max( maxWidthInp + maxWidthOpt, this.headerVar.nativeElement.getComputedTextLength() )
		// monkey patch setTimeout https://github.com/angular/angular/issues/6005
		setTimeout( () => {
			let ui = this.ui
			ui.node.width = maxWidth + ui.centerSpacing + ( ui.io.width + ui.io.spacing.x ) * 2 
			ui.node.height = Math.max( this.node.input.length, this.node.output.length ) * ui.lineHeight + ui.headerHeight

			ui.input.label.x = ui.io.width + ui.io.spacing.x
			ui.input.io.x = 0

			ui.output.label.x = ui.node.width - ui.io.width - ui.io.spacing.x
			ui.output.io.x = ui.node.width - ui.io.width

		}, 0 )
	}

	computeLabel_y( index ) {
		return index * this.ui.lineHeight + this.ui.headerHeight
	}

}
