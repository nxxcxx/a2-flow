import { Component, ViewChild } from '@angular/core'
import { NodeRegistryService } from 'src/NodeGraph/NodeRegistry.svc'

@Component( {

	selector: 'nodeEditor',
	template: '<textarea #editor ></textarea>'

} )
export class NodeEditor {

	@ViewChild( 'editor' ) editor

	constructor( _reg: NodeRegistryService ) {
		this.ngs = _reg.request( 'NodeGraph' )
	}

	ngOnInit() {
		this.ngs.initEditor( this.editor.nativeElement )
	}

}
