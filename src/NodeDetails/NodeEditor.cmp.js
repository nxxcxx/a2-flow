import { Component, ViewChild } from 'angular2/core'
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

	ngAfterViewInit() {
		this.ngs.initEditor( this.editor.nativeElement )
	}

}
