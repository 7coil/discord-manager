if (getGET("error")) {
	err = document.getElementById("error");
	err.innerHTML = getGET("error");
}

function getGET(name){
	if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search)) {
		return decodeURIComponent(name[1]);
	}
}
