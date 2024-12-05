(() => {
	/* check and set a global guard variable, to keep it from injecting more than once */
	if (window.hasRun) { return; }
	window.hasRun = true;
})