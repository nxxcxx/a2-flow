import { Component, ViewChild } from 'angular2/core'
import { NodeManager } from './nodeManager.service'

@Component( {

	selector: 'node-editor',
	template: '<textarea #editor></textarea>'

} )
export class NodeEditor {

	@ViewChild( 'editor' ) editor

	constructor( nodeManager: NodeManager ) {
		this.nodeMan = nodeManager
	}

	ngAfterViewInit() {
		this.nodeMan.initEditor( this.editor.nativeElement )
	}

}
