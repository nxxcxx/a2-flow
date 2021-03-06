import { Component, ElementRef } from '@angular/core'
import { NodeRegistryService } from 'src/NodeGraph/NodeRegistry.svc'
import { NodeModuleIO } from 'src/NodeGraph/NodeModule/NodeModuleIO.cmp'
import { NodeModuleBase } from 'src/NodeGraph/NodeModule/NodeModuleBase'
let html = String.raw

@Component( {

	selector: '[nodeModule]',
	directives: [ NodeModuleIO ],
	styles: [ require( '!raw!sass!root/sass/NodeModule.cmp.sass') ],
	template:
	html`
		<div #nodeBody class="nodeElem" [ngClass]="{selected: shouldHighlight(), deselected: !shouldHighlight()}" >

			<div #headerElem class="headerElem">
				{{ node.name }}
			</div>

			<div #ioContainer class="ioContainer">

				<div #inputColumn class="inputColumn">
					<div nodeModuleIO *ngFor="let input of node.input" [io]="input" (onConnecting)="onConnecting( $event )"></div>
				</div>

				<div #separator class="separator"></div>

				<div #outputColumn class="outputColumn">
					<div nodeModuleIO *ngFor="let output of node.output" [io]="output" (onConnecting)="onConnecting( $event )"></div>
				</div>

			</div>

		</div>
	`

} )
export class NodeModule extends NodeModuleBase {
	constructor( elRef: ElementRef, _reg: NodeRegistryService ) {
		super( elRef, _reg )
	}
}
