import { Injectable } from '@angular/core'

@Injectable()
export class NodeStoreService {

	constructor() {
		this.viewportElem = null
		this.containerElem = null
		this.nodes = []
		this.connections = []
		this.connectingIO = { src: null, dst: null }
		this.isConnecting = false
		this.selectedNodes = []
		this.zoomFactor = 1.0

		this.stats = null
		this.codeMirror = null
		this.renderer = null
	}

}
