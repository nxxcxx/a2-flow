import { Component, ElementRef } from '@angular/core'
import { NodeRegistryService } from 'src/NodeGraph/NodeRegistry.svc'
import { NodeModuleIO } from 'src/NodeGraph/NodeModule/NodeModuleIO.cmp'
import { NodeModuleBase } from 'src/NodeGraph/NodeModule/NodeModuleBase'
let html = String.raw

@Component( {

	selector: '[nodeModuleDisplay]',
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

				<div style="display: inline-block; width: 100px; background: red; text-align: center">
					{{ node.scope._dispText }}
				</div>

				<div #outputColumn class="outputColumn">
					<div nodeModuleIO *ngFor="let output of node.output" [io]="output" (onConnecting)="onConnecting( $event )"></div>
				</div>

			</div>

		</div>
	`

} )
export class NodeModuleDisplay extends NodeModuleBase {
	constructor( elRef: ElementRef, _reg: NodeRegistryService ) {
		super( elRef, _reg )
	}
}
