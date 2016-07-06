import { Component, ViewChild } from '@angular/core'
import { NodeGraphService } from 'src/NodeGraph/NodeGraph.svc'

import CodeMirror from 'codemirror'

@Component( {

	selector: 'nodeTerminal',
	template: '<textarea #terminal ></textarea>'

} )
export class NodeTerminal {

	@ViewChild( 'terminal' ) terminal

	constructor( ngs: NodeGraphService ) {
		this.ngs = ngs
	}

	ngAfterViewInit() {

		let cm = this.codeMirror = CodeMirror.fromTextArea( this.terminal.nativeElement, {
			lineNumbers: false,
			theme: 'black',
			tabSize: 2
		} )
		cm.setSize( '100%', 25 )

	}

}
