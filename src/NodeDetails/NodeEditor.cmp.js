import { Component, ViewChild } from '@angular/core'
import { NodeRegistryService } from 'src/NodeGraph/NodeRegistry.svc'

// CodeMirror ( import order is important )
import CodeMirror from 'codemirror'
import 'root/node_modules/codemirror/mode/javascript/javascript.js'
import 'root/node_modules/codemirror/keymap/vim.js'
import 'root/node_modules/codemirror/lib/codemirror.css'

@Component( {

	selector: 'nodeEditor',
	template: '<textarea #textarea ></textarea>'

} )
export class NodeEditor {

	@ViewChild( 'textarea' ) textarea

	constructor( _reg: NodeRegistryService ) {
		this.ngs = _reg.request( 'NodeGraph' )
	}

	ngOnInit() {
		let cm = CodeMirror.fromTextArea( this.textarea.nativeElement, {
			mode: 'javascript',
			keyMap: 'vim',
			theme: 'black',
			lineNumbers: true,
			tabSize: 2
		} )
		cm.constructor.Vim.map( 'jj', '<Esc>', 'insert' )
		cm.setSize( '100%', 600 )
		cm.on( 'change', cm => {
			if ( !this.ngs.getSelectedNode() ) return
			this.ngs.getSelectedNode()._fnstr = cm.doc.getValue()
		} )
		this.ngs.registerCodeMirror( cm )
	}

}
