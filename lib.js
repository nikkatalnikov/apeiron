/*
	type Type = "HTTP" | "WS" | "COLLECTION"
	type Settings = (Endpoints, Credentials) | Collection
	type Endpoints = [ HTTPEnd ] | WSEnd
	type HTTPEnd = {
		url: String,
		action: "GET" | "POST" ...
	}
	type WSEnd = {
		url: String
	}
	type Collection = [a]
*/

// Leap.js - Λειτουργικό αντιδραστική προγραμματισμού

import StreamAPI from './StreamAPI';
// run :: Type -> Settings -> StreamAPI {send: IO (), dataStream: Subject a, errorStream: Subject a}
window.initLeap = (type, settings) => new StreamAPI(type, settings);
