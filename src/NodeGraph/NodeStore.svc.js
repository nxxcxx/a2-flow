import { Injectable } from '@angular/core'

@Injectable()
export class NodeStoreService {

	constructor() {
		this._store = {}
	}

	set( key, value ) {
		return this._store[ key ] = value
	}

	get( key ) {
		return this._store[ key ]
	}

}
