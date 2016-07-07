import { Component, ViewChild } from '@angular/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'

@Component( {

	selector: 'nodeEditor',
	template: '<textarea #editor ></textarea>'

} )
export class NodeEditor {

	@ViewChild( 'editor' ) editor

	constructor( ngs: NodeGraphService ) {
		this.ngs = ngs
	}

	ngOnInit() {
		this.ngs.initEditor( this.editor.nativeElement )
	}

}
