/** Global UI state shared across the layout and pages. */
export const ui = $state({
	/** True once the preloader has finished and the page may play its intro. */
	introDone: false,
	menuOpen: false,
});
